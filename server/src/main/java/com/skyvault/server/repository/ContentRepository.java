package com.skyvault.server.repository;

import com.skyvault.server.model.DroneContent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContentRepository extends MongoRepository<DroneContent, String> {
    
    // Creator-specific queries
    Page<DroneContent> findByCreatorId(String creatorId, Pageable pageable);
    List<DroneContent> findByCreatorIdAndStatus(String creatorId, DroneContent.ContentStatus status);
    
    // Public content queries
    Page<DroneContent> findByStatus(DroneContent.ContentStatus status, Pageable pageable);
    Page<DroneContent> findByTitleContainingIgnoreCaseAndStatus(String title, DroneContent.ContentStatus status, Pageable pageable);
    Page<DroneContent> findByCategoryAndStatus(String category, DroneContent.ContentStatus status, Pageable pageable);
    Page<DroneContent> findByLocationContainingIgnoreCaseAndStatus(String location, DroneContent.ContentStatus status, Pageable pageable);
    
    // Search by tags
    @Query("{ 'tags': { $in: ?0 }, 'status': ?1 }")
    Page<DroneContent> findByTagsInAndStatus(List<String> tags, DroneContent.ContentStatus status, Pageable pageable);
    
    // Price range queries
    @Query("{ 'price': { $gte: ?0, $lte: ?1 }, 'status': ?2 }")
    Page<DroneContent> findByPriceBetweenAndStatus(Double minPrice, Double maxPrice, DroneContent.ContentStatus status, Pageable pageable);
    
    // Resolution queries
    Page<DroneContent> findByResolutionAndStatus(String resolution, DroneContent.ContentStatus status, Pageable pageable);
    
    // Date range queries
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 }, 'status': ?2 }")
    Page<DroneContent> findByCreatedAtBetweenAndStatus(LocalDateTime start, LocalDateTime end, DroneContent.ContentStatus status, Pageable pageable);
    
    // License type queries
    Page<DroneContent> findByLicenseTypeAndStatus(DroneContent.LicenseType licenseType, DroneContent.ContentStatus status, Pageable pageable);
    
    // Combined search query
    @Query("{ $and: [ " +
           "{ $or: [ " +
           "  { 'title': { $regex: ?0, $options: 'i' } }, " +
           "  { 'description': { $regex: ?0, $options: 'i' } }, " +
           "  { 'tags': { $regex: ?0, $options: 'i' } }, " +
           "  { 'location': { $regex: ?0, $options: 'i' } } " +
           "] }, " +
           "{ 'status': ?1 } " +
           "] }")
    Page<DroneContent> searchByKeywordAndStatus(String keyword, DroneContent.ContentStatus status, Pageable pageable);
    
    // Analytics queries
    @Query("{ 'creatorId': ?0 }")
    List<DroneContent> findAnalyticsByCreatorId(String creatorId);
    
    // Top performing content
    Page<DroneContent> findByStatusOrderByViewsDesc(DroneContent.ContentStatus status, Pageable pageable);
    Page<DroneContent> findByStatusOrderByDownloadsDesc(DroneContent.ContentStatus status, Pageable pageable);
    Page<DroneContent> findByStatusOrderByEarningsDesc(DroneContent.ContentStatus status, Pageable pageable);
    
    // Advanced search methods for creator content management
    @Query("{ 'creatorId': ?0, 'title': { $regex: ?1, $options: 'i' } }")
    Page<DroneContent> findByCreatorIdAndTitleContainingIgnoreCase(String creatorId, String title, Pageable pageable);
    
    @Query("{ 'creatorId': ?0, 'status': ?1 }")
    Page<DroneContent> findByCreatorIdAndStatus(String creatorId, DroneContent.ContentStatus status, Pageable pageable);
    
    @Query("{ 'creatorId': ?0, 'title': { $regex: ?1, $options: 'i' }, 'status': ?2 }")
    Page<DroneContent> findByCreatorIdAndTitleContainingIgnoreCaseAndStatus(String creatorId, String title, DroneContent.ContentStatus status, Pageable pageable);
    
    @Query("{ 'creatorId': ?0, 'category': ?1 }")
    Page<DroneContent> findByCreatorIdAndCategory(String creatorId, String category, Pageable pageable);
    
    @Query("{ 'creatorId': ?0, 'tags': { $in: [?1] } }")
    Page<DroneContent> findByCreatorIdAndTagsContaining(String creatorId, String tag, Pageable pageable);
}
