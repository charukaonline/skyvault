package com.skyvault.server.service;

import com.skyvault.server.dto.ContentUploadRequest;
import com.skyvault.server.dto.ContentResponse;
import com.skyvault.server.dto.ContentSearchRequest;
import com.skyvault.server.model.DroneContent;
import com.skyvault.server.model.User;
import com.skyvault.server.repository.ContentRepository;
import com.skyvault.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {
    
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service; // Changed from CloudinaryService
    
    public ContentResponse uploadContent(String creatorId, ContentUploadRequest request, List<MultipartFile> files) {
        // Validate creator exists and is approved
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        
        if (creator.getRole() != User.UserRole.creator) {
            throw new RuntimeException("Only creators can upload content");
        }
        
        if (!creator.getApproved()) {
            throw new RuntimeException("Creator account must be approved before uploading content");
        }
        
        // Validate files
        if (files == null || files.isEmpty()) {
            throw new RuntimeException("At least one media file is required");
        }
        
        // Validate file types and sizes
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                throw new RuntimeException("Empty files are not allowed");
            }
            
            String contentType = file.getContentType();
            if (contentType == null || 
                (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
                throw new RuntimeException("Invalid file type: " + file.getOriginalFilename());
            }
            
            if (file.getSize() > 100 * 1024 * 1024) { // 100MB
                throw new RuntimeException("File size exceeds 100MB limit: " + file.getOriginalFilename());
            }
        }
        
        try {
            DroneContent content = new DroneContent();
            content.setCreatorId(creatorId);
            content.setTitle(request.getTitle());
            content.setDescription(request.getDescription());
            content.setCategory(request.getCategory());
            content.setTags(request.getTags());
            content.setLocation(request.getLocation());
            
            // Set coordinates if provided
            if (request.getLatitude() != null && request.getLongitude() != null) {
                DroneContent.Coordinates coordinates = new DroneContent.Coordinates();
                coordinates.setLat(request.getLatitude().toString());
                coordinates.setLng(request.getLongitude().toString());
                content.setCoordinates(coordinates);
            }
            
            content.setResolution(request.getResolution());
            content.setDuration(request.getDuration());
            content.setYoutubePreview(request.getYoutubePreview());
            content.setPrice(request.getPrice());
            content.setLicenseType(DroneContent.LicenseType.valueOf(request.getLicenseType()));
            content.setDroneModel(request.getDroneModel());
            content.setShootingDate(request.getShootingDate());
            content.setWeatherConditions(request.getWeatherConditions());
            content.setAltitude(request.getAltitude());
            content.setStatus(DroneContent.ContentStatus.PENDING_REVIEW);
            content.setViews(0);
            content.setDownloads(0);
            content.setEarnings(0.0);
            content.setCreatedAt(LocalDateTime.now());
            content.setUpdatedAt(LocalDateTime.now());
            
            // Upload files to S3 for secure download-only access (no streaming)
            List<DroneContent.MediaFile> mediaFiles = s3Service.uploadMultipleFiles(files, "skyvault/content");
            content.setMediaFiles(mediaFiles);
            
            // Set thumbnail reference (first image for preview generation)
            if (!mediaFiles.isEmpty()) {
                content.setThumbnailFile(mediaFiles.get(0));
            }
            
            DroneContent savedContent = contentRepository.save(content);
            log.info("Content uploaded successfully with {} files for download-only access: {} by creator: {}", 
                    mediaFiles.size(), savedContent.getId(), creatorId);
            
            return convertToResponse(savedContent, creator);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid license type for creator: {}", creatorId, e);
            throw new RuntimeException("Invalid license type: " + request.getLicenseType());
        } catch (Exception e) {
            log.error("Error uploading content for creator: {}", creatorId, e);
            throw new RuntimeException("Failed to upload content: " + e.getMessage());
        }
    }
    
    public Page<ContentResponse> getCreatorContent(String creatorId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<DroneContent> contentPage = contentRepository.findByCreatorId(creatorId, pageable);
        
        User creator = userRepository.findById(creatorId).orElse(null);
        
        return contentPage.map(content -> convertToResponse(content, creator));
    }
    
    public Page<ContentResponse> searchContent(ContentSearchRequest searchRequest, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<DroneContent> contentPage;
        
        if (searchRequest.getKeyword() != null && !searchRequest.getKeyword().trim().isEmpty()) {
            contentPage = contentRepository.findByTitleContainingIgnoreCaseAndStatus(
                searchRequest.getKeyword(), DroneContent.ContentStatus.APPROVED, pageable);
        } else {
            contentPage = contentRepository.findByStatus(DroneContent.ContentStatus.APPROVED, pageable);
        }
        
        return contentPage.map(content -> {
            User creator = userRepository.findById(content.getCreatorId()).orElse(null);
            return convertToResponse(content, creator);
        });
    }
    
    public ContentResponse getContentById(String contentId) {
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        User creator = userRepository.findById(content.getCreatorId()).orElse(null);
        return convertToResponse(content, creator);
    }
    
    public ContentResponse updateContent(String contentId, String creatorId, ContentUploadRequest request) {
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        if (!content.getCreatorId().equals(creatorId)) {
            throw new RuntimeException("You can only update your own content");
        }
        
        // Update editable fields
        content.setTitle(request.getTitle());
        content.setDescription(request.getDescription());
        content.setCategory(request.getCategory());
        content.setTags(request.getTags());
        content.setLocation(request.getLocation());
        content.setPrice(request.getPrice());
        content.setLicenseType(DroneContent.LicenseType.valueOf(request.getLicenseType()));
        content.setYoutubePreview(request.getYoutubePreview());
        content.setUpdatedAt(LocalDateTime.now());
        
        DroneContent savedContent = contentRepository.save(content);
        User creator = userRepository.findById(creatorId).orElse(null);
        
        return convertToResponse(savedContent, creator);
    }
    
    public void deleteContent(String contentId, String creatorId) {
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        if (!content.getCreatorId().equals(creatorId)) {
            throw new RuntimeException("You can only delete your own content");
        }
        
        // Delete files from S3 instead of Cloudinary
        try {
            s3Service.deleteFiles(content.getMediaFiles());
        } catch (Exception e) {
            log.warn("Failed to delete files from S3 for content: {}", contentId, e);
        }
        
        contentRepository.delete(content);
        log.info("Content deleted: {} by creator: {}", contentId, creatorId);
    }
    
    public void incrementViews(String contentId) {
        contentRepository.findById(contentId).ifPresent(content -> {
            content.setViews(content.getViews() + 1);
            contentRepository.save(content);
        });
    }
    
    // Admin methods
    public Page<ContentResponse> getAllContentForAdmin(int page, int size, DroneContent.ContentStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<DroneContent> contentPage = status != null ? 
                contentRepository.findByStatus(status, pageable) :
                contentRepository.findAll(pageable);
        
        return contentPage.map(content -> {
            User creator = userRepository.findById(content.getCreatorId()).orElse(null);
            return convertToResponse(content, creator);
        });
    }
    
    public ContentResponse updateContentStatus(String contentId, DroneContent.ContentStatus status, String adminReason) {
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        content.setStatus(status);
        content.setUpdatedAt(LocalDateTime.now());
        
        DroneContent savedContent = contentRepository.save(content);
        User creator = userRepository.findById(content.getCreatorId()).orElse(null);
        
        log.info("Content status updated: {} to {} by admin", contentId, status);
        return convertToResponse(savedContent, creator);
    }
    
    public Page<ContentResponse> getCreatorContentWithFilters(
            String creatorId, 
            String searchTerm, 
            String status, 
            String category,
            int page, 
            int size, 
            String sortBy, 
            String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<DroneContent> contentPage;
        
        DroneContent.ContentStatus contentStatus = null;
        if (status != null && !status.isEmpty() && !status.equals("all")) {
            try {
                contentStatus = DroneContent.ContentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status filter: {}", status);
            }
        }
        
        // Apply filters based on provided parameters
        if (searchTerm != null && !searchTerm.trim().isEmpty() && contentStatus != null) {
            contentPage = contentRepository.findByCreatorIdAndTitleContainingIgnoreCaseAndStatus(
                creatorId, searchTerm.trim(), contentStatus, pageable);
        } else if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            contentPage = contentRepository.findByCreatorIdAndTitleContainingIgnoreCase(
                creatorId, searchTerm.trim(), pageable);
        } else if (contentStatus != null) {
            contentPage = contentRepository.findByCreatorIdAndStatus(creatorId, contentStatus, pageable);
        } else if (category != null && !category.trim().isEmpty()) {
            contentPage = contentRepository.findByCreatorIdAndCategory(creatorId, category.trim(), pageable);
        } else {
            contentPage = contentRepository.findByCreatorId(creatorId, pageable);
        }
        
        User creator = userRepository.findById(creatorId).orElse(null);
        
        return contentPage.map(content -> convertToResponse(content, creator));
    }
    
    public ContentResponse getCreatorContentStats(String creatorId) {
        // Get aggregated stats for creator's content
        List<DroneContent> allContent = contentRepository.findByCreatorId(creatorId, Pageable.unpaged()).getContent();
        
        ContentResponse stats = new ContentResponse();
        stats.setViews(allContent.stream().mapToInt(DroneContent::getViews).sum());
        stats.setDownloads(allContent.stream().mapToInt(DroneContent::getDownloads).sum());
        stats.setEarnings(allContent.stream().mapToDouble(DroneContent::getEarnings).sum());
        
        return stats;
    }
    
    private ContentResponse convertToResponse(DroneContent content, User creator) {
        ContentResponse response = new ContentResponse();
        response.setId(content.getId());
        response.setTitle(content.getTitle());
        response.setDescription(content.getDescription());
        response.setCategory(content.getCategory());
        response.setTags(content.getTags());
        response.setLocation(content.getLocation());
        response.setCoordinates(content.getCoordinates());
        response.setResolution(content.getResolution());
        response.setDuration(content.getDuration());
        response.setYoutubePreview(content.getYoutubePreview());
        response.setPrice(content.getPrice());
        response.setLicenseType(content.getLicenseType());
        response.setDroneModel(content.getDroneModel());
        response.setShootingDate(content.getShootingDate());
        response.setWeatherConditions(content.getWeatherConditions());
        response.setAltitude(content.getAltitude());
        response.setMediaFiles(content.getMediaFiles());
        response.setThumbnailFile(content.getThumbnailFile());
        response.setStatus(content.getStatus());
        response.setViews(content.getViews());
        response.setDownloads(content.getDownloads());
        response.setEarnings(content.getEarnings());
        response.setCreatedAt(content.getCreatedAt());
        response.setUpdatedAt(content.getUpdatedAt());
        
        if (creator != null) {
            response.setCreatorName(creator.getName());
            response.setCreatorEmail(creator.getEmail());
            response.setCreatorId(creator.getId()); // Add this line
        } else {
            response.setCreatorId(content.getCreatorId()); // fallback
        }
        return response;
    }
}
