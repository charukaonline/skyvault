package com.skyvault.server.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.skyvault.server.model.DroneContent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
    
    public List<DroneContent.MediaFile> uploadMultipleFiles(List<MultipartFile> files, String folderName) {
        List<DroneContent.MediaFile> mediaFiles = new ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                DroneContent.MediaFile mediaFile = uploadSingleFile(file, folderName);
                mediaFiles.add(mediaFile);
            } catch (Exception e) {
                log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
                throw new RuntimeException("Failed to upload file: " + file.getOriginalFilename());
            }
        }
        
        return mediaFiles;
    }
    
    public DroneContent.MediaFile uploadSingleFile(MultipartFile file, String folderName) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Cannot upload empty file");
        }
        
        String fileType = getFileType(file.getContentType());
        String resourceType = fileType.equals("video") ? "video" : "image";
        
        Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", "skyvault/" + folderName,
                "resource_type", resourceType,
                "public_id", UUID.randomUUID().toString(),
                "overwrite", true,
                "quality", "auto:good",
                "fetch_format", "auto"
        );
        
        // Add video-specific parameters
        if (fileType.equals("video")) {
            uploadParams.put("video_codec", "auto");
            uploadParams.put("audio_codec", "auto");
        }
        
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            DroneContent.MediaFile mediaFile = new DroneContent.MediaFile();
            mediaFile.setId(uploadResult.get("public_id").toString());
            mediaFile.setUrl(uploadResult.get("secure_url").toString());
            mediaFile.setType(fileType);
            mediaFile.setFormat(uploadResult.get("format").toString());
            mediaFile.setSize(file.getSize());
            mediaFile.setOriginalName(file.getOriginalFilename());
            
            // Set dimensions
            if (uploadResult.get("width") != null) {
                mediaFile.setWidth((Integer) uploadResult.get("width"));
            }
            if (uploadResult.get("height") != null) {
                mediaFile.setHeight((Integer) uploadResult.get("height"));
            }
            
            // Set duration for videos
            if (fileType.equals("video") && uploadResult.get("duration") != null) {
                Double duration = (Double) uploadResult.get("duration");
                mediaFile.setDuration(duration.intValue());
            }
            
            log.info("Successfully uploaded file to Cloudinary: {}", mediaFile.getId());
            return mediaFile;
            
        } catch (Exception e) {
            log.error("Failed to upload file to Cloudinary: {}", file.getOriginalFilename(), e);
            throw new IOException("Cloudinary upload failed: " + e.getMessage());
        }
    }
    
    public void deleteFiles(List<DroneContent.MediaFile> mediaFiles) {
        for (DroneContent.MediaFile mediaFile : mediaFiles) {
            try {
                String resourceType = mediaFile.getType().equals("video") ? "video" : "image";
                cloudinary.uploader().destroy(mediaFile.getId(), 
                        ObjectUtils.asMap("resource_type", resourceType));
                log.info("Deleted file from Cloudinary: {}", mediaFile.getId());
            } catch (Exception e) {
                log.error("Failed to delete file from Cloudinary: {}", mediaFile.getId(), e);
            }
        }
    }
    
    private String getFileType(String contentType) {
        if (contentType == null) return "image";
        
        if (contentType.startsWith("video/")) {
            return "video";
        } else if (contentType.startsWith("image/")) {
            return "image";
        }
        
        return "image"; // default
    }
}
