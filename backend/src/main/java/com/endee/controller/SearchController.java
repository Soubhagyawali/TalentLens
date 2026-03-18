package com.endee.controller;

import com.endee.model.InsertRequest;
import com.endee.model.SearchRequest;
import com.endee.model.SearchResponse;
import com.endee.service.EmbeddingService;
import com.endee.service.EndeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final EmbeddingService embeddingService;
    private final EndeeService endeeService;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Endee Semantic Search API is running successfully.");
    }

    @PostMapping("/insert")
    public ResponseEntity<Map<String, String>> insertData(@Valid @RequestBody InsertRequest request) {
        log.info("Received request to insert text");
        
        // 1. Convert text to embedding
        List<Float> vector = embeddingService.getEmbedding(request.getText());
        
        // 2. Store in Endee Database
        endeeService.insertVector(request.getText(), vector);
        
        return ResponseEntity.ok(Map.of("message", "Data successfully vectorized and inserted into Endee."));
    }

    @PostMapping("/search")
    public ResponseEntity<List<SearchResponse>> searchData(@Valid @RequestBody SearchRequest request) {
        log.info("Received request to search for query: {}", request.getQuery());
        
        // 1. Convert query to embedding
        List<Float> vector = embeddingService.getEmbedding(request.getQuery());
        
        // 2. Search in Endee vector database
        List<Map<String, Object>> rawResults = endeeService.searchVector(vector, request.getTopK());
        
        // 3. Map Endee response to client DTO
        List<SearchResponse> results = new ArrayList<>();

        if (rawResults != null) {
            for (Map<String, Object> result : rawResults) {

                // Debug (optional)
                System.out.println(result);

                // ✅ TEXT (direct field)
                String text = result.getOrDefault("text", "").toString();

                // ✅ SCORE (convert from distance)
                double score = 0.0;
                if (result.containsKey("_additional")) {
                    Map<String, Object> additional = (Map<String, Object>) result.get("_additional");
                    if (additional != null && additional.containsKey("distance")) {
                        double distance = Double.parseDouble(additional.get("distance").toString());
                        score = 1 - distance;  // similarity score
                    }
                }

                results.add(SearchResponse.builder()
                        .text(text)
                        .score(score)
                        .build());
            }
        }
        return ResponseEntity.ok(results);
    }
}
