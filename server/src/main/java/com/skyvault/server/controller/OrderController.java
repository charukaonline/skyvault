package com.skyvault.server.controller;

import com.skyvault.server.model.Order;
import com.skyvault.server.service.JwtService;
import com.skyvault.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final JwtService jwtService;

    @GetMapping("/my-approved")
    public ResponseEntity<?> getMyApprovedOrders(@RequestHeader("Authorization") String token) {
        String jwt = token.replace("Bearer ", "");
        String userId = jwtService.extractUserId(jwt);
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid authentication token"));
        }
        List<Order> orders = orderService.getApprovedOrdersForBuyer(userId);
        return ResponseEntity.ok(Map.of("orders", orders));
    }
}
