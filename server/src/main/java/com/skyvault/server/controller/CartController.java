package com.skyvault.server.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import com.skyvault.server.repository.ContentRepository;
import com.skyvault.server.model.DroneContent;
import com.skyvault.server.model.User;
import com.skyvault.server.repository.UserRepository;
import com.skyvault.server.service.S3Service;

import java.util.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    // In-memory cart storage: userId -> set of contentIds
    private final Map<String, Set<String>> cartStore = new HashMap<>();
    private final Map<String, String> cartCreatorStore = new HashMap<>();

    @Autowired
    private ContentRepository contentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private S3Service s3Service;

    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader("Authorization") String token) {
        String userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        Set<String> cart = cartStore.getOrDefault(userId, new HashSet<>());
        String creatorId = cartCreatorStore.get(userId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("cart", cart);
        resp.put("creatorId", creatorId);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> body) {
        String userId = extractUserId(token);
        String contentId = body.get("contentId");
        String creatorId = body.get("creatorId");
        if (userId == null || contentId == null || creatorId == null) return ResponseEntity.badRequest().body("Missing data");
        String existingCreator = cartCreatorStore.get(userId);
        if (existingCreator != null && !existingCreator.equals(creatorId)) {
            return ResponseEntity.badRequest().body("You can only add items from one creator at a time.");
        }
        cartStore.computeIfAbsent(userId, k -> new HashSet<>()).add(contentId);
        cartCreatorStore.put(userId, creatorId);
        return ResponseEntity.ok("Added to cart");
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeFromCart(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> body) {
        String userId = extractUserId(token);
        String contentId = body.get("contentId");
        if (userId == null || contentId == null) return ResponseEntity.badRequest().body("Missing data");
        Set<String> cart = cartStore.getOrDefault(userId, new HashSet<>());
        cart.remove(contentId);
        if (cart.isEmpty()) {
            cartCreatorStore.remove(userId);
        }
        return ResponseEntity.ok("Removed from cart");
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestHeader("Authorization") String token) {
        String userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        cartStore.remove(userId);
        cartCreatorStore.remove(userId);
        return ResponseEntity.ok("Cart cleared");
    }

    // --- Checkout endpoint ---
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestHeader("Authorization") String token,
            @RequestParam("contentIds") List<String> contentIds,
            @RequestPart("slip") MultipartFile slip
    ) {
        String userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid token"));
        if (contentIds == null || contentIds.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "No items in cart"));
        if (slip == null || slip.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Bank slip required"));

        // Check all content are from the same creator
        String creatorId = null;
        for (String cid : contentIds) {
            DroneContent c = contentRepository.findById(cid).orElse(null);
            if (c == null) return ResponseEntity.badRequest().body(Map.of("message", "Invalid content in cart"));
            if (creatorId == null) creatorId = c.getCreatorId();
            if (!creatorId.equals(c.getCreatorId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "All items must be from the same creator"));
            }
        }

        // Upload slip to S3 (private)
        try {
            String folder = "skyvault/purchase-slips/" + userId;
            var mediaFile = s3Service.uploadSingleFile(slip, folder);
            // Store purchase record (for demo, just log)
            log.info("User {} purchased {} items from creator {}. Slip S3 key: {}", userId, contentIds.size(), creatorId, mediaFile.getId());
            // TODO: Save purchase record to DB and notify creator (e.g., via email)
            // Clear cart after purchase
            cartStore.remove(userId);
            cartCreatorStore.remove(userId);
            return ResponseEntity.ok(Map.of(
                "message", "Purchase submitted. Awaiting verification.",
                "slipUrl", mediaFile.getUrl(),
                "creatorId", creatorId
            ));
        } catch (Exception e) {
            log.error("Checkout failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Checkout failed: " + e.getMessage()));
        }
    }

    // Dummy JWT extraction (replace with real JWTService)
    private String extractUserId(String token) {
        if (token == null) return null;
        // For demo, expect "Bearer userId"
        return token.replace("Bearer ", "").trim();
    }
}
