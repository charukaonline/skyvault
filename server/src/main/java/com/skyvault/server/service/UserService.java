package com.skyvault.server.service;

import com.skyvault.server.dto.AuthResponse;
import com.skyvault.server.dto.ContentResponse;
import com.skyvault.server.dto.SignupRequest;
import com.skyvault.server.exception.PendingApprovalException;
import com.skyvault.server.model.DroneContent;
import com.skyvault.server.model.User;
import com.skyvault.server.repository.ContentRepository;
import com.skyvault.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ContentRepository contentRepository;

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

    public Page<ContentResponse> getAllContentForAdmin(int page, int size, DroneContent.ContentStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<DroneContent> contentPage = (status != null)
                ? contentRepository.findByStatus(status, pageable)
                : contentRepository.findAll(pageable);
        return contentPage.map(content -> {
            ContentResponse resp = new ContentResponse();
            resp.setId(content.getId());
            resp.setTitle(content.getTitle());
            resp.setStatus(content.getStatus());
            resp.setCategory(content.getCategory());
            resp.setLocation(content.getLocation());
            resp.setCreatedAt(content.getCreatedAt());
            resp.setCreatorName(userRepository.findById(content.getCreatorId()).map(u -> u.getName()).orElse("Unknown"));
            // ...add more fields as needed...
            return resp;
        });
    }

    public ContentResponse updateContentStatus(String contentId, DroneContent.ContentStatus status, String reason) {
        DroneContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        content.setStatus(status);
        content.setUpdatedAt(java.time.LocalDateTime.now());
        // Optionally store reason somewhere if needed
        DroneContent saved = contentRepository.save(content);

        ContentResponse resp = new ContentResponse();
        resp.setId(saved.getId());
        resp.setTitle(saved.getTitle());
        resp.setStatus(saved.getStatus());
        resp.setCategory(saved.getCategory());
        resp.setLocation(saved.getLocation());
        resp.setCreatedAt(saved.getCreatedAt());
        resp.setCreatorName(userRepository.findById(saved.getCreatorId()).map(u -> u.getName()).orElse("Unknown"));
        // ...add more fields as needed...
        return resp;
    }

    /**
     * Change password for a user (buyer)
     */
    public void changePassword(String userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != User.UserRole.buyer) {
            throw new RuntimeException("Only buyers can change password here");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}