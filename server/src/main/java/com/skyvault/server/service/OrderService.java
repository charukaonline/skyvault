package com.skyvault.server.service;

import com.skyvault.server.model.Order;
import com.skyvault.server.model.User;
import com.skyvault.server.repository.OrderRepository;
import com.skyvault.server.repository.UserRepository;
import com.skyvault.server.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final EmailService emailService; // Inject EmailService

    public List<Order> getOrdersForCreator(String creatorId) {
        return orderRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId);
    }

    public Order approveOrder(String orderId, String creatorId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getCreatorId().equals(creatorId)) {
            throw new RuntimeException("Unauthorized");
        }
        order.setStatus(Order.Status.APPROVED);
        order.setUpdatedAt(java.time.LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // Notify buyer and creator
        User buyer = userRepository.findById(order.getBuyerId()).orElse(null);
        User creator = userRepository.findById(order.getCreatorId()).orElse(null);
        if (buyer != null && creator != null) {
            emailService.sendOrderApprovedEmail(buyer, creator, order);
        }
        return savedOrder;
    }

    public Order rejectOrder(String orderId, String creatorId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getCreatorId().equals(creatorId)) {
            throw new RuntimeException("Unauthorized");
        }
        order.setStatus(Order.Status.REJECTED);
        order.setUpdatedAt(java.time.LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // Notify buyer and creator
        User buyer = userRepository.findById(order.getBuyerId()).orElse(null);
        User creator = userRepository.findById(order.getCreatorId()).orElse(null);
        if (buyer != null && creator != null) {
            emailService.sendOrderRejectedEmail(buyer, creator, order);
        }
        return savedOrder;
    }

    public String getSlipDownloadUrl(Order order, int expirationMinutes) {
        // Use only for slip files, not for video/image content
        String slipUrl = order.getSlipUrl();
        if (slipUrl == null || slipUrl.isEmpty()) return null;
        // If slipUrl is a full S3 URL, extract the key
        String s3Key = slipUrl;
        if (slipUrl.startsWith("https://")) {
            int idx = slipUrl.indexOf(".amazonaws.com/");
            if (idx > 0) {
                s3Key = slipUrl.substring(idx + ".amazonaws.com/".length());
            }
        } else if (slipUrl.startsWith("s3://")) {
            // s3://bucket/key
            int idx = slipUrl.indexOf('/', 5);
            if (idx > 0) {
                s3Key = slipUrl.substring(idx + 1);
            }
        }
        // Use dedicated slip presigned URL generator
        return s3Service.generateSlipPresignedUrl(s3Key, expirationMinutes);
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    public List<Order> getApprovedOrdersForBuyer(String buyerId) {
        return orderRepository.findByBuyerIdAndStatus(buyerId, Order.Status.APPROVED);
    }

    // Called from CartController after orderRepository.save(order)
    public void notifyOrderPlaced(Order order) {
        User buyer = userRepository.findById(order.getBuyerId()).orElse(null);
        User creator = userRepository.findById(order.getCreatorId()).orElse(null);
        if (buyer != null && creator != null) {
            emailService.sendOrderPlacedEmail(buyer, creator, order);
        }
    }
}
