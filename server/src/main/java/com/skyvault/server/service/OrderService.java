package com.skyvault.server.service;

import com.skyvault.server.model.Order;
import com.skyvault.server.model.DroneContent;
import com.skyvault.server.repository.OrderRepository;
import com.skyvault.server.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ContentRepository contentRepository;

    public List<Order> getOrdersForCreator(String creatorId) {
        // Find all orders that include content owned by this creator
        List<DroneContent> creatorContent = contentRepository.findByCreatorId(creatorId, null).getContent();
        List<String> creatorContentIds = creatorContent.stream().map(DroneContent::getId).collect(Collectors.toList());
        return orderRepository.findByContentIdsIn(creatorContentIds);
    }

    public void approveOrder(String orderId, String creatorId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        if (!orderContainsCreatorContent(order, creatorId)) {
            throw new AccessDeniedException("Not authorized");
        }
        order.setStatus(Order.Status.APPROVED);
        orderRepository.save(order);
    }

    public void rejectOrder(String orderId, String creatorId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        if (!orderContainsCreatorContent(order, creatorId)) {
            throw new AccessDeniedException("Not authorized");
        }
        order.setStatus(Order.Status.REJECTED);
        orderRepository.save(order);
    }

    private boolean orderContainsCreatorContent(Order order, String creatorId) {
        List<DroneContent> contents = contentRepository.findAllById(order.getContentIds());
        return contents.stream().anyMatch(c -> creatorId.equals(c.getCreatorId()));
    }
}
