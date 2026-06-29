package com.fatec.labify.api.service;

import com.fatec.labify.api.dto.laboratory.LaboratoryResponseDTO;
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

import java.util.*;

@Service
public class LaboratoryService {

    private final RestClient restClient;

    public LaboratoryService(RestClient restClient) {
        this.restClient = restClient;
    }

    public Page<LaboratoryResponseDTO> findAll(Pageable pageable) {
        int limit = pageable.getPageSize();
        int skip = (int) pageable.getOffset();

        String url = UriComponentsBuilder.fromPath("/api/laboratorios")
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

        List<LaboratoryResponseDTO> content = data.stream()
                .map(this::mapToDTO)
                .toList();

        for (LaboratoryResponseDTO lab : content) {
            lab.setBranches(fetchBranchesForLaboratory(lab.getId()));
        }

        return new PageImpl<>(content, pageable, total);
    }

    public LaboratoryResponseDTO findById(String id, String username) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/laboratorios/{id}", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null) {
                throw new NotFoundException("Laboratório", id);
            }

            LaboratoryResponseDTO dto = mapToDTO(response);
            dto.setBranches(fetchBranchesForLaboratory(dto.getId()));
            return dto;
        } catch (Exception e) {
            throw new NotFoundException("Laboratório", id);
        }
    }

    private List<BranchResponseDTO> fetchBranchesForLaboratory(String laboratoryId) {
        try {
            String url = UriComponentsBuilder.fromPath("/api/filiais")
                    .queryParam("laboratoryId", laboratoryId)
                    .queryParam("limit", 100)
                    .toUriString();

            Map<String, Object> response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null || !response.containsKey("data")) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
            return data.stream()
                    .map(this::mapBranchToDTO)
                    .toList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private BranchResponseDTO mapBranchToDTO(Map<String, Object> map) {
        BranchResponseDTO dto = new BranchResponseDTO();
        dto.setId((String) map.get("id"));
        dto.setName((String) map.get("name"));
        dto.setEmail((String) map.get("email"));
        dto.setPhoneNumber((String) map.get("phoneNumber"));
        dto.setOpeningHours((String) map.get("openingHours"));

        Object distanceObj = map.get("distanceKm");
        if (distanceObj instanceof Number) {
            dto.setDistanceKm(((Number) distanceObj).doubleValue());
        }

        Map<String, Object> addrMap = (Map<String, Object>) map.get("address");
        if (addrMap != null) {
            dto.setAddress(mapAddress(addrMap));
        }

        return dto;
    }

    private LaboratoryResponseDTO mapToDTO(Map<String, Object> map) {
        LaboratoryResponseDTO dto = new LaboratoryResponseDTO();
        dto.setId((String) map.get("id"));
        dto.setName((String) map.get("name"));
        dto.setCnpj((String) map.get("cnpj"));
        dto.setPhoneNumber((String) map.get("phoneNumber"));
        dto.setEmail((String) map.get("email"));
        dto.setCreatedAt((String) map.get("createdAt"));
        dto.setUpdatedAt((String) map.get("updatedAt"));

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

}
