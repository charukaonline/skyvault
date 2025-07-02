package com.skyvault.server.controller;

import com.skyvault.server.model.Order;
import com.skyvault.server.service.OrderService;
import com.skyvault.server.dto.OrderActionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders/creator")
@RequiredArgsConstructor
public class CreatorOrderController {

    private final OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<?> getCreatorOrders(Authentication authentication) {
        String creatorId = authentication.getName();
        List<Order> orders = orderService.getOrdersForCreator(creatorId);
        return ResponseEntity.ok().body(
            java.util.Map.of("orders", orders)
        );
    }

    @PostMapping("/{orderId}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable String orderId, Authentication authentication) {
        String creatorId = authentication.getName();
        orderService.approveOrder(orderId, creatorId);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Order approved"));
    }

    @PostMapping("/{orderId}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable String orderId, Authentication authentication) {
        String creatorId = authentication.getName();
        orderService.rejectOrder(orderId, creatorId);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Order rejected"));
    }
}
