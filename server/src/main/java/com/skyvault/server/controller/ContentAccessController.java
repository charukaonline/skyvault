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
     * Get presigned URLs for content viewing
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
            
            // Limit expiration time for security
            int maxExpiration = Math.min(expirationMinutes, 120); // Max 2 hours
            
            Map<String, String> urls = contentAccessService.generateContentUrls(
                userId, contentId, maxExpiration);
            
            Map<String, Object> response = new HashMap<>();
            response.put("urls", urls);
            response.put("expirationMinutes", maxExpiration);
            response.put("message", "Private URLs generated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            log.error("Error generating view URLs for content: {}", contentId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to generate access URLs");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get presigned URL for file download
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
            
            // Limit expiration time for downloads
            int maxExpiration = Math.min(expirationMinutes, 60); // Max 1 hour for downloads
            
            String downloadUrl = contentAccessService.generateDownloadUrl(
                userId, contentId, fileId, maxExpiration);
            
            Map<String, Object> response = new HashMap<>();
            response.put("downloadUrl", downloadUrl);
            response.put("expirationMinutes", maxExpiration);
            response.put("message", "Download URL generated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            log.error("Error generating download URL for file: {}", fileId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to generate download URL");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get presigned URLs for content preview (public content or owned content)
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
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            log.error("Error generating preview URLs for content: {}", contentId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to generate preview URLs");
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
