package com.skyvault.server.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.skyvault.server.dto.ContentResponse;
import com.skyvault.server.dto.ContentSearchRequest;
import com.skyvault.server.dto.ContentUploadRequest;
import com.skyvault.server.model.DroneContent;
import com.skyvault.server.service.ContentService;
import com.skyvault.server.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@Slf4j
public class ContentController {
    
    private final ContentService contentService;
    private final JwtService jwtService;
    
    // Public endpoints for browsing content
    @GetMapping("/public/search")
    public ResponseEntity<?> searchContent(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String resolution,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        try {
            ContentSearchRequest searchRequest = new ContentSearchRequest();
            searchRequest.setKeyword(keyword);
            searchRequest.setCategory(category);
            searchRequest.setLocation(location);
            searchRequest.setResolution(resolution);
            searchRequest.setMinPrice(minPrice);
            searchRequest.setMaxPrice(maxPrice);
            
            Page<ContentResponse> content = contentService.searchContent(searchRequest, page, size);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to search content: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/public/{contentId}")
    public ResponseEntity<?> getContentById(@PathVariable String contentId) {
        try {
            // Increment view count
            contentService.incrementViews(contentId);
            ContentResponse content = contentService.getContentById(contentId);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve content");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Creator endpoints
    @PostMapping("/creator/upload")
    public ResponseEntity<?> uploadContent(
            @RequestHeader("Authorization") String token,
            @RequestPart("data") String requestData,
            @RequestPart("files") List<MultipartFile> files) {
        
        log.info("Received upload request with {} files", files != null ? files.size() : 0);
        
        try {
            String jwt = token.replace("Bearer ", "");
            String creatorId = jwtService.extractUserId(jwt);
            
            if (creatorId == null || creatorId.trim().isEmpty()) {
                log.warn("Invalid authentication token received");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authentication token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            log.info("Processing upload for creator: {}", creatorId);
            
            // Parse JSON data
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            ContentUploadRequest request;
            
            try {
                request = objectMapper.readValue(requestData, ContentUploadRequest.class);
                log.info("Parsed upload request: title={}, category={}", request.getTitle(), request.getCategory());
            } catch (JsonProcessingException e) {
                log.error("Failed to parse request data", e);
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid request data format: " + e.getMessage());
                return ResponseEntity.badRequest().body(error);
            }
            
            if (files == null || files.isEmpty()) {
                log.warn("No files provided in upload request");
                Map<String, String> error = new HashMap<>();
                error.put("message", "At least one media file is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Validate file types and sizes
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    log.warn("Empty file detected: {}", file.getOriginalFilename());
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Empty files are not allowed");
                    return ResponseEntity.badRequest().body(error);
                }
                
                if (!isValidFileType(file)) {
                    log.warn("Invalid file type: {} ({})", file.getOriginalFilename(), file.getContentType());
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Invalid file type: " + file.getOriginalFilename() + ". Only MP4, MOV, JPG, PNG files are allowed");
                    return ResponseEntity.badRequest().body(error);
                }
                
                if (file.getSize() > 100 * 1024 * 1024) { // 100MB limit
                    log.warn("File size exceeds limit: {} ({}MB)", file.getOriginalFilename(), file.getSize() / (1024 * 1024));
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "File size must not exceed 100MB: " + file.getOriginalFilename());
                    return ResponseEntity.badRequest().body(error);
                }
            }
            
            log.info("All validations passed, proceeding with upload");
            ContentResponse response = contentService.uploadContent(creatorId, request, files);
            log.info("Upload successful for content: {}", response.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            log.error("Runtime error during upload", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Unexpected error during content upload", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload content: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/creator/my-content")
    public ResponseEntity<?> getCreatorContent(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String creatorId = jwtService.extractUserId(jwt);
            
            Page<ContentResponse> content = contentService.getCreatorContent(creatorId, page, size, sortBy, sortDir);
            return ResponseEntity.ok(content);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve content");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/creator/my-content-filtered")
    public ResponseEntity<?> getCreatorContentWithFilters(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String creatorId = jwtService.extractUserId(jwt);
            
            if (creatorId == null || creatorId.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authentication token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Page<ContentResponse> content = contentService.getCreatorContentWithFilters(
                creatorId, search, status, category, page, size, sortBy, sortDir);
            
            return ResponseEntity.ok(content);
            
        } catch (Exception e) {
            log.error("Error fetching filtered content for creator", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve content: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/creator/stats")
    public ResponseEntity<?> getCreatorStats(
            @RequestHeader("Authorization") String token) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String creatorId = jwtService.extractUserId(jwt);
            
            if (creatorId == null || creatorId.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authentication token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            ContentResponse stats = contentService.getCreatorContentStats(creatorId);
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error fetching creator stats", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve stats");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PutMapping("/creator/{contentId}")
    public ResponseEntity<?> updateContent(
            @RequestHeader("Authorization") String token,
            @PathVariable String contentId,
            @RequestBody @Valid ContentUploadRequest request) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String creatorId = jwtService.extractUserId(jwt);
            
            ContentResponse response = contentService.updateContent(contentId, creatorId, request);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update content");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/creator/{contentId}")
    public ResponseEntity<?> deleteContent(
            @RequestHeader("Authorization") String token,
            @PathVariable String contentId) {
        
        try {
            String jwt = token.replace("Bearer ", "");
            String creatorId = jwtService.extractUserId(jwt);
            
            contentService.deleteContent(contentId, creatorId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Content deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete content");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Admin endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllContentForAdmin(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            DroneContent.ContentStatus contentStatus = null;
            if (status != null && !status.isEmpty()) {
                contentStatus = DroneContent.ContentStatus.valueOf(status.toUpperCase());
            }
            
            Page<ContentResponse> content = contentService.getAllContentForAdmin(page, size, contentStatus);
            return ResponseEntity.ok(content);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve content");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/admin/{contentId}/status")
    public ResponseEntity<?> updateContentStatus(
            @PathVariable String contentId,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        
        try {
            DroneContent.ContentStatus contentStatus = DroneContent.ContentStatus.valueOf(status.toUpperCase());
            ContentResponse response = contentService.updateContentStatus(contentId, contentStatus, reason);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid status value");
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update content status");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private boolean isValidFileType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) return false;
        
        return contentType.equals("video/mp4") ||
               contentType.equals("video/quicktime") ||
               contentType.equals("image/jpeg") ||
               contentType.equals("image/jpg") ||
               contentType.equals("image/png");
    }
}
