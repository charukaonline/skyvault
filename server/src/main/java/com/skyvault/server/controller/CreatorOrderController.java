package com.skyvault.server.controller;

import com.skyvault.server.model.Order;
import com.skyvault.server.service.OrderService;
import com.skyvault.server.dto.OrderActionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/{orderId}/slip-url")
    public ResponseEntity<?> getSlipDownloadUrl(
            @PathVariable String orderId,
            @RequestParam(defaultValue = "10") int expirationMinutes,
            Authentication authentication) {
        String creatorId = authentication.getName();
        Order order = orderService.getOrderById(orderId);
        if (order == null || !order.getCreatorId().equals(creatorId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(java.util.Map.of("message", "Order not found"));
        }
        String url = orderService.getSlipDownloadUrl(order, expirationMinutes);
        if (url == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(java.util.Map.of("message", "Slip not found"));
        }
        return ResponseEntity.ok(java.util.Map.of("url", url, "expiresIn", expirationMinutes));
    }

    @PostMapping("/{orderId}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable String orderId, Authentication authentication) {
        String creatorId = authentication.getName();
        Order updatedOrder = orderService.approveOrder(orderId, creatorId);
        return ResponseEntity.ok().body(java.util.Map.of(
            "message", "Order approved",
            "order", updatedOrder
        ));
    }

    @PostMapping("/{orderId}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable String orderId, Authentication authentication) {
        String creatorId = authentication.getName();
        Order updatedOrder = orderService.rejectOrder(orderId, creatorId);
        return ResponseEntity.ok().body(java.util.Map.of(
            "message", "Order rejected",
            "order", updatedOrder
        ));
    }
}