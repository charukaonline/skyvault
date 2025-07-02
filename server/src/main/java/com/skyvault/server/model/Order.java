package com.skyvault.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String buyerId;
    private String buyerEmail;
    private List<String> contentIds;
    private String slipUrl;
    private Status status;
    private String creatorId;
    private List<String> contentTitles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum Status {
        PENDING, APPROVED, REJECTED;

        @Override
        public String toString() {
            return name().toLowerCase();
        }

        public static Status fromString(String value) {
            return Status.valueOf(value.toUpperCase());
        }
    }
}
