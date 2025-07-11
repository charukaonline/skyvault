package com.skyvault.server.repository;

import com.skyvault.server.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByContentIdsIn(List<String> contentIds);
    List<Order> findByCreatorIdOrderByCreatedAtDesc(String creatorId);
    List<Order> findByBuyerIdAndStatus(String buyerId, Order.Status status);
}
