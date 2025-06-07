package com.skyvault.server.dto;

import com.skyvault.server.model.DroneContent;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContentResponse {
    private String id;
    private String title;
    private String description;
    private String category;
    private List<String> tags;
    private String location;
    private DroneContent.Coordinates coordinates;
    private String resolution;
    private Integer duration;
    private String youtubePreview;
    private Double price;
    private DroneContent.LicenseType licenseType;
    private String droneModel;
    private LocalDateTime shootingDate;
    private String weatherConditions;
    private String altitude;
    private List<DroneContent.MediaFile> mediaFiles;
    private DroneContent.MediaFile thumbnailFile;
    private DroneContent.ContentStatus status;
    private Integer views;
    private Integer downloads;
    private Double earnings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Creator information
    private String creatorName;
    private String creatorEmail;
}
