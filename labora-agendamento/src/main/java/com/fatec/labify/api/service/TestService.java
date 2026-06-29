package com.fatec.labify.api.service;

import com.fatec.labify.api.dto.test.TestResponseDTO;
import com.fatec.labify.domain.TestCategory;
import com.fatec.labify.exception.NotFoundException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TestService {

    private final RestClient restClient;

    public TestService(RestClient restClient) {
        this.restClient = restClient;
    }

    public Page<TestResponseDTO> findAll(String search, String category, Pageable pageable) {
        int limit = pageable.getPageSize();
        int skip = (int) pageable.getOffset();

        UriComponentsBuilder builder = UriComponentsBuilder.fromPath("/api/exames")
                .queryParam("active", "true")
                .queryParam("limit", limit)
                .queryParam("skip", skip);

        if (search != null && !search.trim().isEmpty()) {
            builder.queryParam("q", search.trim());
        }
        if (category != null && !category.trim().isEmpty()) {
            builder.queryParam("category", category.trim());
        }

        Map<String, Object> response = restClient.get()
                .uri(builder.build().toUri())
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("data")) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        long total = ((Number) response.getOrDefault("total", 0)).longValue();

        List<TestResponseDTO> content = data.stream()
                .map(this::mapToDTO)
                .toList();

        return new PageImpl<>(content, pageable, total);
    }

    public TestResponseDTO findById(String id) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/exames/{id}", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null) {
                throw new NotFoundException("Teste", id);
            }

            return mapToDTO(response);
        } catch (Exception e) {
            throw new NotFoundException("Teste", id);
        }
    }

    public List<String> getCategories() {
        try {
            List<String> response = restClient.get()
                    .uri("/api/exames/categorias")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<String>>() {});
            return response != null ? response : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private TestResponseDTO mapToDTO(Map<String, Object> map) {
        TestResponseDTO dto = new TestResponseDTO();
        dto.setId((String) map.get("id"));
        dto.setName((String) map.get("name"));
        dto.setDescription((String) map.get("description"));

        dto.setTestCategory((String) map.get("category"));

        dto.setSexSpecific(Boolean.TRUE.equals(map.get("sexSpecific")));
        dto.setSampleType((String) map.get("sampleType"));
        dto.setEstimatedResultTime((String) map.get("estimatedResultTime"));
        dto.setPreparationInstructions((String) map.get("preparationInstructions"));
        dto.setActive(Boolean.TRUE.equals(map.get("active")));

        Object priceVal = map.get("price");
        if (priceVal instanceof Number) {
            dto.setPrice(((Number) priceVal).doubleValue());
        }

        String createdAtStr = (String) map.get("createdAt");
        if (createdAtStr != null) {
            try {
                dto.setCreatedAt(LocalDateTime.parse(createdAtStr.substring(0, 19), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                // ignore or parse differently
            }
        }
        return dto;
    }

}
