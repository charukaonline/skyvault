package com.skyvault.server.controller;

import com.skyvault.server.model.User;
import com.skyvault.server.repository.UserRepository;
import com.skyvault.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;
    private final UserService userService;
    
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
}
