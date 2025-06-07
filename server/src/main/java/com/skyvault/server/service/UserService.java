package com.skyvault.server.service;

import com.skyvault.server.dto.AuthResponse;
import com.skyvault.server.dto.SignupRequest;
import com.skyvault.server.exception.PendingApprovalException;
import com.skyvault.server.model.User;
import com.skyvault.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse registerUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        
        // Set approval status based on role
        if (request.getRole() == User.UserRole.creator) {
            user.setApproved(false); // Creators need approval
        } else {
            user.setApproved(true); // Buyers and admins are auto-approved
        }
        
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );

        return new AuthResponse(token, userDto);
    }

    public AuthResponse loginUser(String email, String password) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Check if creator account is approved - use getter method for null safety
        if (user.getRole() == User.UserRole.creator && !user.getApproved()) {
            throw new PendingApprovalException("Your creator account is pending approval. Please wait for admin approval.");
        }

        String token = jwtService.generateToken(user);

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        return new AuthResponse(token, userDto);
    }

    public void createDefaultUser(String email, String name, String password, User.UserRole role) {
        if (!userRepository.existsByEmail(email.toLowerCase())) {
            User user = new User();
            user.setName(name);
            user.setEmail(email.toLowerCase());
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            // Set approval based on role
            user.setApproved(role != User.UserRole.creator);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            userRepository.save(user);
        }
    }
    
    public void approveCreator(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != User.UserRole.creator) {
            throw new RuntimeException("User is not a creator");
        }
        
        user.setApproved(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    public void rejectCreator(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != User.UserRole.creator) {
            throw new RuntimeException("User is not a creator");
        }
        
        // Delete the user account when rejected
        userRepository.delete(user);
    }
}