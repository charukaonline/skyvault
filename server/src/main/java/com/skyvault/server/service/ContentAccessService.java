package com.skyvault.server.service;

import com.skyvault.server.model.DroneContent;
import com.skyvault.server.model.User;
import com.skyvault.server.repository.ContentRepository;
import com.skyvault.server.repository.UserRepository;
import com.skyvault.server.repository.OrderRepository;
import com.skyvault.server.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentAccessService {
    
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final OrderRepository orderRepository; // Add this line
    
    /**
     * Check if user has access to content
     */
    public boolean hasAccess(String userId, String contentId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            DroneContent content = contentRepository.findById(contentId).orElse(null);
            
            if (user == null || content == null) {
                return false;
            }
            
            // Admin has access to everything
            if (user.getRole() == User.UserRole.admin) {
                return true;
            }
            
            // Creator has access to their own content
            if (user.getRole() == User.UserRole.creator && 
                content.getCreatorId().equals(userId)) {
                return true;
            }
            
            // For buyers, check if content is approved first
            if (user.getRole() == User.UserRole.buyer) {
                // Only allow access to approved content
                if (content.getStatus() != DroneContent.ContentStatus.APPROVED) {
                    log.warn("Buyer {} tried to access non-approved content {}", userId, contentId);
                    return false;
                }
                
                // Check if user has purchased this content
                return hasPurchased(userId, contentId);
            }
            
            return false;
        } catch (Exception e) {
            log.error("Error checking access for user {} to content {}", userId, contentId, e);
            return false;
        }
    }
    
    /**
     * Check if user has purchased content
     * Now checks real purchase DB for approved orders
     */
    private boolean hasPurchased(String userId, String contentId) {
        // Check for an approved order for this user and content
        try {
            List<Order> orders = orderRepository.findByBuyerIdAndStatus(userId, Order.Status.APPROVED);
            for (Order order : orders) {
                if (order.getContentIds() != null && order.getContentIds().contains(contentId)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Error checking purchase for user {} and content {}", userId, contentId, e);
            return false;
        }
    }
    
    /**
     * Enhanced method to generate secure presigned URLs for private S3 content
     */
    public Map<String, String> generateContentUrls(String userId, String contentId, int expirationMinutes) {
        log.info("Generating secure presigned URLs for user {} and content {}", userId, contentId);
        
        if (!hasAccess(userId, contentId)) {
            log.warn("User {} denied access to private content {}", userId, contentId);
            throw new SecurityException("User does not have access to this private content");
        }
        
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        if (content.getMediaFiles() == null || content.getMediaFiles().isEmpty()) {
            log.warn("No private media files found for content {}", contentId);
            return new HashMap<>();
        }
        
        // Extract S3 keys from private file URLs
        List<String> s3Keys = content.getMediaFiles().stream()
                .map(DroneContent.MediaFile::getId) // ID contains the S3 key
                .collect(Collectors.toList());
        
        log.info("Generating presigned URLs for {} private S3 files", s3Keys.size());
        
        // Generate presigned URLs for private S3 access
        Map<String, String> urls = s3Service.generatePresignedUrls(s3Keys, expirationMinutes);
        log.info("Generated {} secure presigned URLs for private content", urls.size());
        
        return urls;
    }
    
    /**
     * Generate download URL for purchased private content (no streaming)
     */
    public String generateDownloadUrl(String userId, String contentId, String fileId, int expirationMinutes) {
        log.info("Generating download-only URL for user {} content {} file {}", userId, contentId, fileId);
        
        if (!hasAccess(userId, contentId)) {
            throw new SecurityException("User does not have access to this private content");
        }
        
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        DroneContent.MediaFile mediaFile = content.getMediaFiles().stream()
                .filter(file -> file.getId().equals(fileId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Private file not found"));
        
        // Generate presigned download URL for private S3 file (download-only, no streaming)
        return s3Service.generateDownloadPresignedUrl(
            fileId, // S3 key
            mediaFile.getOriginalName(), 
            expirationMinutes
        );
    }
    
    /**
     * Generate download URLs for all files in content (batch download)
     */
    public Map<String, String> generateDownloadUrls(String userId, String contentId, int expirationMinutes) {
        log.info("Generating batch download URLs for user {} and content {}", userId, contentId);
        
        if (!hasAccess(userId, contentId)) {
            log.warn("User {} denied access to private content {}", userId, contentId);
            throw new SecurityException("User does not have access to this private content");
        }
        
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        if (content.getMediaFiles() == null || content.getMediaFiles().isEmpty()) {
            log.warn("No private media files found for content {}", contentId);
            return new HashMap<>();
        }
        
        // Generate download URLs for all files (no streaming)
        Map<String, String> downloadUrls = new HashMap<>();
        for (DroneContent.MediaFile mediaFile : content.getMediaFiles()) {
            try {
                String downloadUrl = s3Service.generateDownloadPresignedUrl(
                    mediaFile.getId(), 
                    mediaFile.getOriginalName(), 
                    expirationMinutes
                );
                downloadUrls.put(mediaFile.getId(), downloadUrl);
            } catch (Exception e) {
                log.error("Failed to generate download URL for file: {}", mediaFile.getId(), e);
            }
        }
        
        log.info("Generated {} download URLs for private content", downloadUrls.size());
        return downloadUrls;
    }
    
    /**
     * Check if content has thumbnail available for public display
     */
    public String generateThumbnailUrl(String contentId) {
        try {
            DroneContent content = contentRepository.findById(contentId).orElse(null);
            if (content == null || content.getMediaFiles() == null || content.getMediaFiles().isEmpty()) {
                return null;
            }
            
            // Find first image file for thumbnail or generate from first video
            DroneContent.MediaFile thumbnailFile = content.getMediaFiles().stream()
                    .filter(file -> file.getType().equals("image"))
                    .findFirst()
                    .orElse(content.getMediaFiles().get(0));
            
            // Generate short-lived presigned URL for thumbnail (5 minutes)
            return s3Service.generatePresignedUrl(thumbnailFile.getId(), 5);
        } catch (Exception e) {
            log.error("Error generating thumbnail URL for content {}", contentId, e);
            return null;
        }
    }
}
