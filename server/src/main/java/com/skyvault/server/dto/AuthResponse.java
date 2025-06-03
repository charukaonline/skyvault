package com.skyvault.server.dto;

import com.skyvault.server.model.User;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDto user;
    
    @Data
    @AllArgsConstructor
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private User.UserRole role;
    }
}
