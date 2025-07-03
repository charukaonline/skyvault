package com.skyvault.server.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

public class JwtUtil {
    public static String extractUserId(String token) {
        try {
            // Replace with your JWT secret key
            String secret = System.getenv("JWT_SECRET") != null ? System.getenv("JWT_SECRET") : "secret";
            Claims claims = Jwts.parser().setSigningKey(secret.getBytes()).parseClaimsJws(token).getBody();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}
