package com.skyvault.server.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.HttpMethod;
import com.skyvault.server.model.DroneContent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class S3Service {
    
    @Value("${aws.s3.access-key}")
    private String accessKey;
    
    @Value("${aws.s3.secret-key}")
    private String secretKey;
    
    @Value("${aws.s3.region}")
    private String region;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    private AmazonS3 s3Client;
    
    @PostConstruct
    public void initializeS3Client() {
        BasicAWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
        this.s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(Regions.fromName(region))
                .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                .build();
        
        log.info("S3 Client initialized for bucket: {} in region: {}", bucketName, region);
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
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
        String s3Key = folderName + "/" + uniqueFileName;
        
        try {
            // Create metadata
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());
            metadata.setCacheControl("max-age=31536000"); // 1 year cache
            
            // Add custom metadata
            metadata.addUserMetadata("original-name", originalFileName);
            metadata.addUserMetadata("file-type", fileType);
            
            // Upload file to S3
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                bucketName, 
                s3Key, 
                file.getInputStream(), 
                metadata
            );
            
            // Make the object publicly readable
            putObjectRequest.setCannedAcl(CannedAccessControlList.PublicRead);
            
            PutObjectResult result = s3Client.putObject(putObjectRequest);
            
            // Generate public URL
            String publicUrl = s3Client.getUrl(bucketName, s3Key).toString();
            
            // Create MediaFile object
            DroneContent.MediaFile mediaFile = new DroneContent.MediaFile();
            mediaFile.setId(s3Key); // Use S3 key as ID
            mediaFile.setUrl(publicUrl);
            mediaFile.setType(fileType);
            mediaFile.setFormat(fileExtension);
            mediaFile.setSize(file.getSize());
            mediaFile.setOriginalName(originalFileName);
            
            // For images, we can get basic info, for videos we'd need additional processing
            if (fileType.equals("image")) {
                // Basic image handling - you might want to add image dimension reading
                mediaFile.setWidth(null); // You can add image processing library to get dimensions
                mediaFile.setHeight(null);
            } else if (fileType.equals("video")) {
                // Basic video handling - you might want to add video processing to get duration/dimensions
                mediaFile.setDuration(null); // You can add video processing library
                mediaFile.setWidth(null);
                mediaFile.setHeight(null);
            }
            
            log.info("Successfully uploaded file to S3: {} -> {}", originalFileName, publicUrl);
            return mediaFile;
            
        } catch (Exception e) {
            log.error("Failed to upload file to S3: {}", originalFileName, e);
            throw new IOException("S3 upload failed: " + e.getMessage());
        }
    }
    
    public void deleteFiles(List<DroneContent.MediaFile> mediaFiles) {
        for (DroneContent.MediaFile mediaFile : mediaFiles) {
            try {
                // Use the stored ID which is the S3 key
                s3Client.deleteObject(bucketName, mediaFile.getId());
                log.info("Deleted file from S3: {}", mediaFile.getId());
            } catch (Exception e) {
                log.error("Failed to delete file from S3: {}", mediaFile.getId(), e);
            }
        }
    }
    
    public void deleteFile(String s3Key) {
        try {
            s3Client.deleteObject(bucketName, s3Key);
            log.info("Deleted file from S3: {}", s3Key);
        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", s3Key, e);
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage());
        }
    }
    
    public String generatePresignedUrl(String s3Key, int expirationMinutes) {
        try {
            java.util.Date expiration = new java.util.Date();
            long expTimeMillis = expiration.getTime();
            expTimeMillis += 1000 * 60 * expirationMinutes; // Convert minutes to milliseconds
            expiration.setTime(expTimeMillis);
            
            GeneratePresignedUrlRequest generatePresignedUrlRequest = 
                new GeneratePresignedUrlRequest(bucketName, s3Key)
                    .withMethod(HttpMethod.GET)
                    .withExpiration(expiration);
                    
            return s3Client.generatePresignedUrl(generatePresignedUrlRequest).toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for: {}", s3Key, e);
            throw new RuntimeException("Failed to generate presigned URL: " + e.getMessage());
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
    
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "bin";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
    
    public boolean doesFileExist(String s3Key) {
        try {
            s3Client.getObjectMetadata(bucketName, s3Key);
            return true;
        } catch (AmazonS3Exception e) {
            if (e.getStatusCode() == 404) {
                return false;
            }
            throw e;
        }
    }
    
    public ObjectMetadata getFileMetadata(String s3Key) {
        try {
            return s3Client.getObjectMetadata(bucketName, s3Key);
        } catch (Exception e) {
            log.error("Failed to get metadata for file: {}", s3Key, e);
            throw new RuntimeException("Failed to get file metadata: " + e.getMessage());
        }
    }
}
