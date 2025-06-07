package com.skyvault.server.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private UserRole role;
    
    // Default to true for backward compatibility
    private Boolean approved = true;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Helper method to check approval status
    public Boolean getApproved() {
        // For backward compatibility - if approved is null, auto-approve non-creators
        if (approved == null) {
            return role != UserRole.creator;
        }
        return approved;
    }
    
    public enum UserRole {
        admin, creator, buyer
    }
}
