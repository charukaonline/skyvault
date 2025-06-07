package com.skyvault.server.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContentUploadRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotEmpty(message = "At least one tag is required")
    private List<String> tags;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private String latitude;
    private String longitude;
    
    @NotBlank(message = "Resolution is required")
    @Pattern(regexp = "^(4K|2K|HD|720p)$", message = "Resolution must be 4K, 2K, HD, or 720p")
    private String resolution;
    
    private Integer duration; // in seconds, for videos
    
    @Pattern(regexp = "^(https?://)?(www\\.)?(youtube\\.com/watch\\?v=|youtu\\.be/)[a-zA-Z0-9_-]+$", 
             message = "Invalid YouTube URL format")
    private String youtubePreview;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @DecimalMax(value = "10000.0", message = "Price must not exceed $10,000")
    private Double price;
    
    @NotBlank(message = "License type is required")
    @Pattern(regexp = "^(ROYALTY_FREE|LIMITED_USE|EXCLUSIVE)$", 
             message = "License type must be ROYALTY_FREE, LIMITED_USE, or EXCLUSIVE")
    private String licenseType;
    
    private String droneModel;
    private LocalDateTime shootingDate;
    private String weatherConditions;
    private String altitude;
}
