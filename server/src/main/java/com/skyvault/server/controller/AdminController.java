package com.skyvault.server.controller;

import com.skyvault.server.dto.ContentResponse;
import com.skyvault.server.model.DroneContent;
import com.skyvault.server.model.User;
import com.skyvault.server.repository.UserRepository;
import com.skyvault.server.service.ContentService;
import com.skyvault.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class AdminController {
    private final UserRepository userRepository;
    private final UserService userService;
    private final ContentService contentService;
    
    @GetMapping("/creators/pending")
    public ResponseEntity<?> getPendingCreators() {
        try {
            List<User> pendingCreators = userRepository.findByRoleAndApproved(User.UserRole.creator, false);
            return ResponseEntity.ok(pendingCreators);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch pending creators");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/creators")
    public ResponseEntity<?> getAllCreators() {
        try {
            List<User> creators = userRepository.findByRole(User.UserRole.creator);
            return ResponseEntity.ok(creators);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch creators");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/creators/{userId}/approve")
    public ResponseEntity<?> approveCreator(@PathVariable String userId) {
        try {
            userService.approveCreator(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Creator approved successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/creators/{userId}/reject")
    public ResponseEntity<?> rejectCreator(@PathVariable String userId) {
        try {
            userService.rejectCreator(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Creator rejected and removed successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // --- Content Moderation Endpoints ---

    @GetMapping("/content")
    public ResponseEntity<?> getAllContent(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            DroneContent.ContentStatus contentStatus = null;
            if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
                contentStatus = DroneContent.ContentStatus.valueOf(status.toUpperCase());
            }
            Page<ContentResponse> content = userService.getAllContentForAdmin(page, size, contentStatus);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch content");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/content/{contentId}/status")
    public ResponseEntity<?> updateContentStatus(
            @PathVariable String contentId,
            @RequestParam String status,
            @RequestParam(required = false) String reason
    ) {
        try {
            DroneContent.ContentStatus contentStatus = DroneContent.ContentStatus.valueOf(status.toUpperCase());
            ContentResponse response = userService.updateContentStatus(contentId, contentStatus, reason);
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
