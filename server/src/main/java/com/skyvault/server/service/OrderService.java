package com.skyvault.server.service;

import com.skyvault.server.model.Order;
import com.skyvault.server.repository.OrderRepository;
import com.skyvault.server.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final S3Service s3Service;

    public List<Order> getOrdersForCreator(String creatorId) {
        return orderRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId);
    }

    public void approveOrder(String orderId, String creatorId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getCreatorId().equals(creatorId)) {
            throw new RuntimeException("Unauthorized");
        }
        order.setStatus(Order.Status.APPROVED);
        order.setUpdatedAt(java.time.LocalDateTime.now()); // <-- Add this line
        orderRepository.save(order);
    }

    public void rejectOrder(String orderId, String creatorId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getCreatorId().equals(creatorId)) {
            throw new RuntimeException("Unauthorized");
        }
        order.setStatus(Order.Status.REJECTED);
        order.setUpdatedAt(java.time.LocalDateTime.now()); // <-- Add this line
        orderRepository.save(order);
    }

    public String getSlipDownloadUrl(Order order, int expirationMinutes) {
        // Assume slipUrl is an S3 URL or S3 key
        String slipUrl = order.getSlipUrl();
        if (slipUrl == null || slipUrl.isEmpty()) return null;
        // If slipUrl is a full S3 URL, extract the key
        String s3Key = slipUrl;
        if (slipUrl.startsWith("https://")) {
            int idx = slipUrl.indexOf(".amazonaws.com/");
            if (idx > 0) {
                s3Key = slipUrl.substring(idx + ".amazonaws.com/".length());
            }
        }
        return s3Service.generatePresignedUrl(s3Key, expirationMinutes);
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    public List<Order> getApprovedOrdersForBuyer(String buyerId) {
        return orderRepository.findByBuyerIdAndStatus(buyerId, Order.Status.APPROVED);
    }
}
