package com.skyvault.server.controller;

import com.skyvault.server.dto.AuthResponse;
import com.skyvault.server.dto.LoginRequest;
import com.skyvault.server.dto.SignupRequest;
import com.skyvault.server.exception.PendingApprovalException;
import com.skyvault.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class AuthController {
    private final UserService userService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> register(@Valid @RequestBody SignupRequest request) {
        try {
            AuthResponse response = userService.registerUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            
            if ("Email already exists".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login (@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.loginUser(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (PendingApprovalException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("type", "pending_approval");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());

            if ("Invalid email or password".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            return ResponseEntity.badRequest().body(error);
        }
    }
}
