package com.skyvault.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class ContentSearchRequest {
    private String keyword;
    private String category;
    private String location;
    private String resolution;
    private Double minPrice;
    private Double maxPrice;
    private List<String> tags;
    private String licenseType;
    private String sortBy = "createdAt";
    private String sortDirection = "desc";
}
