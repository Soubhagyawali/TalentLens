package com.endee.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SearchRequest {
    @NotBlank(message = "Query cannot be blank")
    private String query;
    private int topK = 5;
}
