package com.skyvault.server.service;

import com.skyvault.server.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements CommandLineRunner {
    private final UserService userService;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing default users...");
        
        // Create default admin user
        userService.createDefaultUser(
            "admin@gmail.com",
            "Admin User",
            "admin123",
            User.UserRole.ADMIN
        );
        
        // Create default creator user
        userService.createDefaultUser(
            "creator@gmail.com",
            "Creator User",
            "creator123",
            User.UserRole.CREATOR
        );
        
        // Create default buyer user
        userService.createDefaultUser(
            "buyer@gmail.com",
            "Buyer User",
            "buyer123",
            User.UserRole.BUYER
        );
        
        log.info("Default users initialization completed.");
    }
}
