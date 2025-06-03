package com.skyvault.server.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.bson.Document;

@RestController
@RequestMapping("/api")
public class TestController {

    @Autowired
    private MongoTemplate mongoTemplate;
    
    @GetMapping("/test-db")
    public ResponseEntity<String> testDatabaseConnection() {
        try {
            // Try to execute a simple command to check the connection
            mongoTemplate.getDb().runCommand(new Document("ping", 1));
            return ResponseEntity.ok("Database connection successful!");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                   .body("Database connection failed: " + e.getMessage());
        }
    }
}