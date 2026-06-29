package com.fatec.labify.api.service;

import com.fatec.labify.api.dto.branch.BranchResponseDTO;
import com.fatec.labify.api.dto.patient.AddressDTO;
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
public class BranchService {

    private final RestClient restClient;

    public BranchService(RestClient restClient) {
        this.restClient = restClient;
    }

    public BranchResponseDTO findById(String username, String id) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/filiais/{id}", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null) {
                throw new NotFoundException("Filial", id);
            }

            return mapToDTO(response);
        } catch (Exception e) {
            throw new NotFoundException("Filial", id);
        }
    }

    public Page<BranchResponseDTO> findByLabId(String username, String id, Pageable pageable) {
        int limit = pageable.getPageSize();
        int skip = (int) pageable.getOffset();

        String url = UriComponentsBuilder.fromPath("/api/filiais")
                .queryParam("laboratoryId", id)
                .queryParam("limit", limit)
                .queryParam("skip", skip)
                .toUriString();

        Map<String, Object> response = restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("data")) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        long total = ((Number) response.getOrDefault("total", 0)).longValue();

        List<BranchResponseDTO> content = data.stream()
                .map(this::mapToDTO)
                .toList();

        return new PageImpl<>(content, pageable, total);
    }

    public Page<BranchResponseDTO> getClosestBranches(String username, double frontLat, double frontLon, int limit) {
        // Fetch User and Patient address via API
        Map<String, Object> user = restClient.get()
                .uri("/api/users/{username}", username)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (user == null) {
            throw new NotFoundException("Usuário", username);
        }

        String userId = (String) user.get("id");
        Map<String, Object> patient = restClient.get()
                .uri("/api/pacientes/{userId}", userId)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        double userLat = 0;
        double userLon = 0;

        if (patient != null && patient.containsKey("address")) {
            Map<String, Object> addr = (Map<String, Object>) patient.get("address");
            if (addr != null) {
                userLat = addr.get("latitude") != null ? ((Number) addr.get("latitude")).doubleValue() : 0;
                userLon = addr.get("longitude") != null ? ((Number) addr.get("longitude")).doubleValue() : 0;
            }
        }

        double searchLat = isSameLocation(frontLat, frontLon, userLat, userLon) ? userLat : frontLat;
        double searchLon = isSameLocation(frontLat, frontLon, userLat, userLon) ? userLon : frontLon;

        String url = UriComponentsBuilder.fromPath("/api/filiais/by-area")
                .queryParam("lat", searchLat)
                .queryParam("lon", searchLon)
                .queryParam("limit", limit)
                .toUriString();

        Map<String, Object> response = restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("data")) {
            return new PageImpl<>(Collections.emptyList(), Pageable.unpaged(), 0);
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        long total = ((Number) response.getOrDefault("total", 0)).longValue();

        List<BranchResponseDTO> content = data.stream()
                .map(this::mapToDTO)
                .toList();

        return new PageImpl<>(content, Pageable.unpaged(), total);
    }


    private BranchResponseDTO mapToDTO(Map<String, Object> map) {
        BranchResponseDTO dto = new BranchResponseDTO();
        dto.setId((String) map.get("id"));
        dto.setName((String) map.get("name"));
        dto.setEmail((String) map.get("email"));
        dto.setPhoneNumber((String) map.get("phoneNumber"));
        dto.setOpeningHours((String) map.get("openingHours"));

        if (map.containsKey("distanceKm")) {
            dto.setDistanceKm(((Number) map.get("distanceKm")).doubleValue());
        }

        String createdAtStr = (String) map.get("createdAt");
        if (createdAtStr != null) {
            try {
                dto.setCreatedAt(LocalDateTime.parse(createdAtStr.substring(0, 19), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                // ignore
            }
        }

        String updatedAtStr = (String) map.get("updatedAt");
        if (updatedAtStr != null) {
            try {
                dto.setUpdatedAt(LocalDateTime.parse(updatedAtStr.substring(0, 19), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                // ignore
            }
        }

        Map<String, Object> addrMap = (Map<String, Object>) map.get("address");
        if (addrMap != null) {
            dto.setAddress(mapAddress(addrMap));
        }

        return dto;
    }

    private AddressDTO mapAddress(Map<String, Object> map) {
        AddressDTO dto = new AddressDTO();
        dto.setStreet((String) map.get("street"));
        dto.setNumber((String) map.get("number"));
        dto.setComplement((String) map.get("complement"));
        dto.setNeighborhood((String) map.get("neighborhood"));
        dto.setCity((String) map.get("city"));
        dto.setState((String) map.get("state"));
        dto.setZipCode((String) map.get("zipCode"));
        dto.setCountry((String) map.get("country"));
        return dto;
    }

    private boolean isSameLocation(double frontLat, double frontLon, double userLat, double userLon) {
        return Double.compare(frontLat, userLat) == 0 && Double.compare(frontLon, userLon) == 0;
    }

}
