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
            
            // Buyer has access if they purchased the content
            // TODO: Implement purchase tracking
            // For now, return false for buyers until purchase system is implemented
            if (user.getRole() == User.UserRole.buyer) {
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
     * TODO: Implement actual purchase tracking
     */
    private boolean hasPurchased(String userId, String contentId) {
        // Placeholder implementation
        // In a real application, you would check a purchases table
        return false;
    }
    
    /**
     * Generate presigned URLs for content access
     */
    public Map<String, String> generateContentUrls(String userId, String contentId, int expirationMinutes) {
        log.info("Generating content URLs for user {} and content {}", userId, contentId);
        
        if (!hasAccess(userId, contentId)) {
            log.warn("User {} denied access to content {}", userId, contentId);
            throw new SecurityException("User does not have access to this content");
        }
        
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        if (content.getMediaFiles() == null || content.getMediaFiles().isEmpty()) {
            log.warn("No media files found for content {}", contentId);
            return new HashMap<>();
        }
        
        List<String> s3Keys = content.getMediaFiles().stream()
                .map(DroneContent.MediaFile::getId)
                .collect(Collectors.toList());
        
        log.info("Generating presigned URLs for {} files", s3Keys.size());
        Map<String, String> urls = s3Service.generatePresignedUrls(s3Keys, expirationMinutes);
        log.info("Generated {} presigned URLs", urls.size());
        
        return urls;
    }
    
    /**
     * Generate download URL for purchased content
     */
    public String generateDownloadUrl(String userId, String contentId, String fileId, int expirationMinutes) {
        if (!hasAccess(userId, contentId)) {
            throw new SecurityException("User does not have access to this content");
        }
        
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        DroneContent.MediaFile mediaFile = content.getMediaFiles().stream()
                .filter(file -> file.getId().equals(fileId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        return s3Service.generateDownloadPresignedUrl(
            fileId, 
            mediaFile.getOriginalName(), 
            expirationMinutes
        );
    }
    
    /**
     * Generate preview URLs (shorter expiration for security)
     */
    public Map<String, String> generatePreviewUrls(String userId, String contentId) {
        User user = userRepository.findById(userId).orElse(null);
        DroneContent content = contentRepository.findById(contentId).orElse(null);
        
        if (user == null || content == null) {
            throw new RuntimeException("User or content not found");
        }
        
        // Allow preview for approved content
        if (content.getStatus() != DroneContent.ContentStatus.APPROVED) {
            // Only allow preview for creator's own content and admins
            if (user.getRole() != User.UserRole.admin && 
                !content.getCreatorId().equals(userId)) {
                throw new SecurityException("Content is not available for preview");
            }
        }
        
        List<String> s3Keys = content.getMediaFiles().stream()
                .map(DroneContent.MediaFile::getId)
                .collect(Collectors.toList());
        
        // Shorter expiration for previews (15 minutes)
        return s3Service.generatePresignedUrls(s3Keys, 15);
    }
}
