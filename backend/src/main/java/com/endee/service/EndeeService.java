package com.endee.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class EndeeService {

    private final WebClient webClient;
    private final String endeeUrl;

    public EndeeService(
            @Value("${endee.url}") String endeeUrl){
        this.endeeUrl = endeeUrl;
        this.webClient = WebClient.builder()
                .baseUrl(endeeUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .build();
    }

    /**
     * Store vector with metadata into Endee Database via HTTP API
     */
    public void insertVector(String text, List<Float> vector) {
        log.info("Inserting vector to Endee DB for text snippet...");
        String id = UUID.randomUUID().toString();

        Map<String, Object> payload = new HashMap<>();
        payload.put("class", "SearchCollection");
        payload.put("id", id);
        payload.put("vector", vector);
        payload.put("properties", Map.of("text", text));

        Map<String, String> metadata = new HashMap<>();
        metadata.put("text", text);


        try {
            // General structure for standard compatible vector DBs. 
            // Adjust endpoint (/v1/collections/...) based on specific Endee API version
            Map<String, Object> requestBody = new HashMap<>();

// Class name MUST match schema
            requestBody.put("class", "SearchCollection");

// Properties
            Map<String, Object> properties = new HashMap<>();
            properties.put("text", text);

            requestBody.put("properties", properties);

// Vector
            requestBody.put("vector", vector);

            this.webClient.post()
                    .uri("/v1/objects")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Successfully inserted vector into Weaviate!");
            log.info("Successfully inserted vector into Endee!");
        } catch (Exception e) {
            log.error("Failed to insert via HTTP. Reason: {}. Try falling back to ProcessBuilder for Docker exec.", e.getMessage());
            // fallbackToDockerExecInsert(id, vector, text);
            throw new RuntimeException("Endee Insert Error", e);
        }
    }

    /**
     * Search vector in Endee Database
     */
    public List<Map<String, Object>> searchVector(List<Float> vector, int topK) {
        log.info("Searching vector in Weaviate DB with topK={}", topK);

        try {
            // Build GraphQL query
            String query = String.format("""
        {
          Get {
            SearchCollection(
              nearVector: {
                vector: %s
              }
              limit: %d
            ) {
              text
              _additional {
                distance
              }
            }
          }
        }
        """, vector.toString(), topK);

            Map<String, Object> requestBody = Map.of("query", query);

            Map response = this.webClient.post()
                    .uri("/v1/graphql")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            // Extract response safely
            Map data = (Map) response.get("data");
            Map get = (Map) data.get("Get");

            return (List<Map<String, Object>>) get.get("SearchCollection");

        } catch (Exception e) {
            log.error("Failed to search via HTTP: {}", e.getMessage());
            throw new RuntimeException("Weaviate Search Error", e);
        }
    }

    /**
     * Alternative fallback: using ProcessBuilder to execute 'docker exec' into the running container.
     */
    private void fallbackToDockerExecInsert(String id, List<Float> vector, String text) {
        try {
            // Adjust the actual CLI command expected by Endee binary inside the docker container
            String command = String.format("endee-cli insert --collection %s --id %s --vector \"%s\" --metadata \"{\\\"text\\\":\\\"%s\\\"}\"", id, vector.toString(), text);
            
            ProcessBuilder pb = new ProcessBuilder("docker", "exec", "endee-oss", "sh", "-c", command);
            Process process = pb.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                log.info("Docker EXEC output: {}", line);
            }
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                 throw new RuntimeException("Docker exec failed with exit code " + exitCode);
            }
        } catch (Exception e) {
            log.error("ProcessBuilder Endee insert failed", e);
            throw new RuntimeException(e);
        }
    }
}
