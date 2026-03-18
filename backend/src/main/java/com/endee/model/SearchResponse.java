package com.endee.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SearchResponse {
    private String text;
    private double score;
}
