package com.skyvault.server.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "drone_content")
public class DroneContent {
    @Id
    private String id;
    
    private String creatorId;
    private String title;
    private String description;
    private String category;
    private List<String> tags;
    private String location;
    private Coordinates coordinates;
    private String resolution;
    private Integer duration; // in seconds
    private String youtubePreview;
    private Double price;
    private LicenseType licenseType;
    private String droneModel;
    private LocalDateTime shootingDate;
    private String weatherConditions;
    private String altitude;
    private List<MediaFile> mediaFiles;
    private MediaFile thumbnailFile;
    private ContentStatus status;
    private Integer views;
    private Integer downloads;
    private Double earnings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coordinates {
        private String lat;
        private String lng;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaFile {
        private String id;
        private String url;
        private String type; // video, image
        private String format;
        private Long size;
        private Integer duration;
        private Integer width;
        private Integer height;
        private String originalName;
    }

    public enum LicenseType {
        ROYALTY_FREE("royalty-free"),
        LIMITED_USE("limited-use"),
        EXCLUSIVE("exclusive");

        private final String value;

        LicenseType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public enum ContentStatus {
        PENDING_REVIEW("pending_review"),
        APPROVED("approved"),
        REJECTED("rejected"),
        SUSPENDED("suspended");

        private final String value;

        ContentStatus(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}
