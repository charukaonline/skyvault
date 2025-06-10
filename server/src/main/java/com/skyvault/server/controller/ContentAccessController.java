package com.skyvault.server.controller;

import com.skyvault.server.service.ContentAccessService;
import com.skyvault.server.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/content/access")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class ContentAccessController {
    
    private final ContentAccessService contentAccessService;
    private final JwtService jwtService;
    
    /**
     * Get presigned URLs for private S3 content viewing (for purchased content)
     */
    @GetMapping("/{contentId}/view")
    public ResponseEntity<?> getViewUrls(
            @RequestHeader("Authorization") String token,
            @PathVariable String contentId,
            @RequestParam(defaultValue = "60") int expirationMinutes) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String userId = jwtService.extractUserId(jwt);
            
            if (userId == null || userId.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authentication token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // Limit expiration time for security (max 2 hours for private content)
            int maxExpiration = Math.min(expirationMinutes, 120);
            
            Map<String, String> urls = contentAccessService.generateContentUrls(
                userId, contentId, maxExpiration);
            
            Map<String, Object> response = new HashMap<>();
            response.put("urls", urls);
            response.put("expirationMinutes", maxExpiration);
            response.put("message", "Private S3 URLs generated successfully");
            response.put("security", "Temporary access to private content");
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied: " + e.getMessage());
            error.put("type", "security_error");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            log.error("Error generating private S3 URLs for content: {}", contentId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to generate secure access URLs");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get presigned URL for high-quality file download (purchased content only)
     */
    @GetMapping("/{contentId}/download/{fileId}")
    public ResponseEntity<?> getDownloadUrl(
            @RequestHeader("Authorization") String token,
            @PathVariable String contentId,
            @PathVariable String fileId,
            @RequestParam(defaultValue = "30") int expirationMinutes) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String userId = jwtService.extractUserId(jwt);
            
            if (userId == null || userId.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authentication token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // Limit expiration time for downloads (max 1 hour for security)
            int maxExpiration = Math.min(expirationMinutes, 60);
            
            String downloadUrl = contentAccessService.generateDownloadUrl(
                userId, contentId, fileId, maxExpiration);
            
            Map<String, Object> response = new HashMap<>();
            response.put("downloadUrl", downloadUrl);
            response.put("expirationMinutes", maxExpiration);
            response.put("message", "Private download URL generated successfully");
            response.put("security", "Secure S3 download link with limited time access");
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied: " + e.getMessage());
            error.put("type", "purchase_required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            log.error("Error generating download URL for file: {}", fileId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to generate download URL");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get presigned URLs for content preview (for approved public content browsing)
     */
    @GetMapping("/{contentId}/preview")
    public ResponseEntity<?> getPreviewUrls(
            @RequestHeader("Authorization") String token,
            @PathVariable String contentId) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String userId = jwtService.extractUserId(jwt);
            
            if (userId == null || userId.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authentication token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Map<String, String> urls = contentAccessService.generatePreviewUrls(userId, contentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("urls", urls);
            response.put("expirationMinutes", 15);
            response.put("message", "Preview URLs generated successfully");
            response.put("security", "Limited time preview access");
            response.put("note", "These are temporary URLs for content preview only");
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied: " + e.getMessage());
            error.put("type", "preview_restricted");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            log.error("Error generating preview URLs for content: {}", contentId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to generate preview URLs");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get thumbnail URL for public content browsing
     */
    @GetMapping("/{contentId}/thumbnail")
    public ResponseEntity<?> getThumbnailUrl(
            @PathVariable String contentId) {
        
        try {
            String thumbnailUrl = contentAccessService.generateThumbnailUrl(contentId);
            
            if (thumbnailUrl == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No thumbnail available for this content");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("thumbnailUrl", thumbnailUrl);
            response.put("expirationMinutes", 5);
            response.put("message", "Thumbnail URL generated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error generating thumbnail URL for content: {}", contentId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to generate thumbnail URL");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Check if user has access to content
     */
    @GetMapping("/{contentId}/check")
    public ResponseEntity<?> checkAccess(
            @RequestHeader("Authorization") String token,
            @PathVariable String contentId) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String userId = jwtService.extractUserId(jwt);
            
            if (userId == null || userId.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authentication token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            boolean hasAccess = contentAccessService.hasAccess(userId, contentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasAccess", hasAccess);
            response.put("userId", userId);
            response.put("contentId", contentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error checking access for content: {}", contentId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to check access");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
