package com.skyvault.server.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    // In-memory cart storage: userId -> set of contentIds
    private final Map<String, Set<String>> cartStore = new HashMap<>();

    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader("Authorization") String token) {
        String userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        Set<String> cart = cartStore.getOrDefault(userId, new HashSet<>());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> body) {
        String userId = extractUserId(token);
        String contentId = body.get("contentId");
        if (userId == null || contentId == null) return ResponseEntity.badRequest().body("Missing data");
        cartStore.computeIfAbsent(userId, k -> new HashSet<>()).add(contentId);
        return ResponseEntity.ok("Added to cart");
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeFromCart(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> body) {
        String userId = extractUserId(token);
        String contentId = body.get("contentId");
        if (userId == null || contentId == null) return ResponseEntity.badRequest().body("Missing data");
        Set<String> cart = cartStore.getOrDefault(userId, new HashSet<>());
        cart.remove(contentId);
        return ResponseEntity.ok("Removed from cart");
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestHeader("Authorization") String token) {
        String userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        cartStore.remove(userId);
        return ResponseEntity.ok("Cart cleared");
    }

    // Dummy JWT extraction (replace with real JWTService)
    private String extractUserId(String token) {
        if (token == null) return null;
        // For demo, expect "Bearer userId"
        return token.replace("Bearer ", "").trim();
    }
}
