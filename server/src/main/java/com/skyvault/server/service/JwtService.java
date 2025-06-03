package com.skyvault.server.service;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.skyvault.server.model.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private final Key key;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    public JwtService(@Value("${jwt.secret:}") String configuredSecret) {
        // If a specific secret is configured and long enough, use it
        if (configuredSecret != null && !configuredSecret.isEmpty()
                && configuredSecret.getBytes().length >= 32) {
            this.key = Keys.hmacShaKeyFor(configuredSecret.getBytes());
        } else {
            // Generate a secure key for HS256
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    public String generateToken(User user) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}