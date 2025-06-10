package com.skyvault.server.service;

import com.skyvault.server.model.DroneContent;
import com.skyvault.server.model.User;
import com.skyvault.server.repository.ContentRepository;
import com.skyvault.server.repository.UserRepository;
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
    // Add purchase service dependency when implemented
    // private final PurchaseService purchaseService;
    
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
     * TODO: Implement actual purchase tracking with database
     */
    private boolean hasPurchased(String userId, String contentId) {
        // Placeholder implementation - replace with actual purchase table lookup
        // For now, we'll simulate some purchases for testing
        
        // In a real implementation, you would:
        // return purchaseRepository.existsByUserIdAndContentId(userId, contentId);
        
        // Temporary: allow access for demonstration (remove in production)
        log.warn("Purchase check bypassed for demo - implement actual purchase tracking");
        return true; // TODO: Replace with actual purchase verification
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
     * Generate download URL for purchased private content
     */
    public String generateDownloadUrl(String userId, String contentId, String fileId, int expirationMinutes) {
        log.info("Generating download URL for user {} content {} file {}", userId, contentId, fileId);
        
        if (!hasAccess(userId, contentId)) {
            throw new SecurityException("User does not have access to this private content");
        }
        
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        DroneContent.MediaFile mediaFile = content.getMediaFiles().stream()
                .filter(file -> file.getId().equals(fileId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Private file not found"));
        
        // Generate presigned download URL for private S3 file
        return s3Service.generateDownloadPresignedUrl(
            fileId, // S3 key
            mediaFile.getOriginalName(), 
            expirationMinutes
        );
    }
    
    /**
     * Generate preview URLs for public browsing (approved content only)
     */
    public Map<String, String> generatePreviewUrls(String userId, String contentId) {
        User user = userRepository.findById(userId).orElse(null);
        DroneContent content = contentRepository.findById(contentId).orElse(null);
        
        if (user == null || content == null) {
            throw new RuntimeException("User or content not found");
        }
        
        // For public previews, only allow approved content
        if (content.getStatus() != DroneContent.ContentStatus.APPROVED) {
            // Exception: allow creators to preview their own content and admins
            if (user.getRole() != User.UserRole.admin && 
                !content.getCreatorId().equals(userId)) {
                throw new SecurityException("Content is not available for public preview");
            }
        }
        
        if (content.getMediaFiles() == null || content.getMediaFiles().isEmpty()) {
            log.warn("No media files found for preview of content {}", contentId);
            return new HashMap<>();
        }
        
        List<String> s3Keys = content.getMediaFiles().stream()
                .map(DroneContent.MediaFile::getId)
                .collect(Collectors.toList());
        
        // Shorter expiration for previews (15 minutes) for security
        return s3Service.generatePresignedUrls(s3Keys, 15);
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
