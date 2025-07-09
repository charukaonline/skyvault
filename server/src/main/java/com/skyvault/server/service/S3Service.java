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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
        String s3Key = folderName + "/" + uniqueFileName;
        
        try {
            // Create metadata for private storage
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());
            metadata.setCacheControl("private, no-cache, must-revalidate"); // Strict private caching
            
            // Add custom metadata
            metadata.addUserMetadata("original-name", originalFileName);
            metadata.addUserMetadata("file-type", "download-only"); // Mark as download-only
            
            // Upload file to S3 as STRICTLY PRIVATE (no streaming access)
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                bucketName, 
                s3Key, 
                file.getInputStream(), 
                metadata
            );
            
            // Set private ACL - no public access, download-only
            putObjectRequest.setCannedAcl(CannedAccessControlList.Private);
            
            PutObjectResult result = s3Client.putObject(putObjectRequest);
            
            // Store private S3 reference (no public URL)
            String privateUrl = String.format("s3://%s/%s", bucketName, s3Key);
            
            // Create MediaFile object
            DroneContent.MediaFile mediaFile = new DroneContent.MediaFile();
            mediaFile.setId(s3Key); // Use S3 key as ID for download access
            mediaFile.setUrl(privateUrl); // Store private S3 reference
            mediaFile.setType("download-only");
            mediaFile.setFormat(fileExtension);
            mediaFile.setSize(file.getSize());
            mediaFile.setOriginalName(originalFileName);
            
            // Basic metadata without dimensions (download-only focus)
            mediaFile.setWidth(null); // Not needed for download-only
            mediaFile.setHeight(null);
            mediaFile.setDuration(null); // Not needed for download-only
            
            log.info("Successfully uploaded private file to S3 (download-only): {} -> {}", originalFileName, s3Key);
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
    
    // Add new method to generate presigned URLs for multiple files
    public Map<String, String> generatePresignedUrls(List<String> s3Keys, int expirationMinutes) {
        Map<String, String> presignedUrls = new HashMap<>();
        
        for (String s3Key : s3Keys) {
            try {
                String presignedUrl = generatePresignedUrl(s3Key, expirationMinutes);
                presignedUrls.put(s3Key, presignedUrl);
            } catch (Exception e) {
                log.error("Failed to generate presigned URL for key: {}", s3Key, e);
                // Continue with other keys, don't fail the entire operation
            }
        }
        
        return presignedUrls;
    }
    
    // Add method to generate presigned URL for download
    public String generateDownloadPresignedUrl(String s3Key, String originalFileName, int expirationMinutes) {
        try {
            java.util.Date expiration = new java.util.Date();
            long expTimeMillis = expiration.getTime();
            expTimeMillis += 1000 * 60 * expirationMinutes;
            expiration.setTime(expTimeMillis);
            
            GeneratePresignedUrlRequest generatePresignedUrlRequest = 
                new GeneratePresignedUrlRequest(bucketName, s3Key)
                    .withMethod(HttpMethod.GET)
                    .withExpiration(expiration);
        
            // Add response headers for download
            ResponseHeaderOverrides responseHeaders = new ResponseHeaderOverrides();
            responseHeaders.setContentDisposition("attachment; filename=\"" + originalFileName + "\"");
            generatePresignedUrlRequest.setResponseHeaders(responseHeaders);
                
            return s3Client.generatePresignedUrl(generatePresignedUrlRequest).toString();
        } catch (Exception e) {
            log.error("Failed to generate download presigned URL for: {}", s3Key, e);
            throw new RuntimeException("Failed to generate download presigned URL: " + e.getMessage());
        }
    }
    
    // --- SLIP UPLOAD/VIEWING METHODS (separate from video/image logic) ---

    /**
     * Upload a bank slip file to S3 (private, separate from video/image logic)
     * Returns the S3 key and a private S3 reference URL.
     */
    public SlipUploadResult uploadSlipFile(MultipartFile file, String folderName) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Cannot upload empty slip file");
        }
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = "slip-" + UUID.randomUUID().toString() + "." + fileExtension;
        String s3Key = folderName + "/" + uniqueFileName;

        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());
            metadata.setCacheControl("private, no-cache, must-revalidate");
            metadata.addUserMetadata("original-name", originalFileName);
            metadata.addUserMetadata("file-type", "bank-slip");

            PutObjectRequest putObjectRequest = new PutObjectRequest(
                bucketName,
                s3Key,
                file.getInputStream(),
                metadata
            );
            putObjectRequest.setCannedAcl(CannedAccessControlList.Private);

            s3Client.putObject(putObjectRequest);

            String privateUrl = String.format("s3://%s/%s", bucketName, s3Key);

            log.info("Uploaded bank slip to S3: {} -> {}", originalFileName, s3Key);

            return new SlipUploadResult(s3Key, privateUrl, originalFileName, fileExtension, file.getSize());
        } catch (Exception e) {
            log.error("Failed to upload slip to S3: {}", originalFileName, e);
            throw new IOException("S3 slip upload failed: " + e.getMessage());
        }
    }

    /**
     * Generate a presigned URL for a slip file (for viewing/downloading).
     */
    public String generateSlipPresignedUrl(String s3Key, int expirationMinutes) {
        try {
            java.util.Date expiration = new java.util.Date();
            long expTimeMillis = expiration.getTime();
            expTimeMillis += 1000 * 60 * expirationMinutes;
            expiration.setTime(expTimeMillis);

            GeneratePresignedUrlRequest req =
                new GeneratePresignedUrlRequest(bucketName, s3Key)
                    .withMethod(HttpMethod.GET)
                    .withExpiration(expiration);

            return s3Client.generatePresignedUrl(req).toString();
        } catch (Exception e) {
            log.error("Failed to generate slip presigned URL for: {}", s3Key, e);
            throw new RuntimeException("Failed to generate slip presigned URL: " + e.getMessage());
        }
    }

    // Helper class for slip upload result
    public static class SlipUploadResult {
        public final String s3Key;
        public final String s3Url;
        public final String originalName;
        public final String extension;
        public final long size;

        public SlipUploadResult(String s3Key, String s3Url, String originalName, String extension, long size) {
            this.s3Key = s3Key;
            this.s3Url = s3Url;
            this.originalName = originalName;
            this.extension = extension;
            this.size = size;
        }
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
