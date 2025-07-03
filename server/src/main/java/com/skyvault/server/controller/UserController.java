package com.skyvault.server.controller;

import com.skyvault.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ChangePasswordRequest req
    ) {
        // Extract userId from JWT (assume "Bearer <token>")
        String jwt = token.replace("Bearer ", "");
        // You may want to inject JwtService here, but for brevity:
        String userId = com.skyvault.server.util.JwtUtil.extractUserId(jwt); // implement this utility or inject JwtService
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid authentication token"));
        }
        try {
            userService.changePassword(userId, req.getOldPassword(), req.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    public static class ChangePasswordRequest {
        @NotBlank
        private String oldPassword;
        @NotBlank
        private String newPassword;
        // getters and setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
