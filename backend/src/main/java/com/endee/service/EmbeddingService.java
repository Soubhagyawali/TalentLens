package com.endee.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmbeddingService {

    private final WebClient webClient;

    public EmbeddingService(
            @Value("${embedding.api.url}") String apiUrl,
            @Value("${embedding.api.key}") String apiKey) {
        
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader("Accept", "application/json")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0")
                .build();
    }

    /**
     * Converts a text string into a vector embedding using HuggingFace API.
     * Note: The HuggingFace API often requires cold-starting the model, which might return a 503 initially.
     * We use a basic retry logic here or handle the exception up the stack.
     * 
     * @param text The input text
     * @return A list of floats representing the embedding
     */
    public List<Float> getEmbedding(String text) {
        log.info("Generating embedding for text: '{}'", text);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", text);



        try {
            // HuggingFace feature-extraction API typically returns an array of floats
            // For some models like sentence-transformers, it returns List<Float>
            // We'll read it as a List. If it returns List<List<Float>>, we'll need to adapt.
//            Object response = this.webClient.post()
//                    .bodyValue(requestBody)
//                    .retrieve()
//                    .bodyToMono(Object.class)
//                    .block();


            Object response = this.webClient.post()
                    .uri("")
                    .header(HttpHeaders.ACCEPT, "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();

            if (response instanceof List<?> list) {
                 if (!list.isEmpty() && list.get(0) instanceof List) {
                     // Nested array case: extract first element
                     List<?> innerList = (List<?>) list.get(0);
                     return innerList.stream()
                             .map(item -> Float.valueOf(item.toString()))
                             .toList();
                 } else {
                     // Flat array case
                     return list.stream()
                             .map(item -> Float.valueOf(item.toString()))
                             .toList();
                 }
            }
            throw new RuntimeException("Unexpected response format from embedding API");

        } catch (Exception e) {
            log.error("Failed to generate embedding: {}", e.getMessage());
            throw new RuntimeException("Embedding generation failed", e);
        }
    }
}
