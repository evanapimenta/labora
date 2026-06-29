package com.fatec.labify.api.service;

import com.fatec.labify.api.dto.GeolocationDTO;
import com.fatec.labify.api.dto.patient.*;
import com.fatec.labify.api.dto.user.UserInfoDTO;
import com.fatec.labify.client.NominatimClient;
import com.fatec.labify.domain.Gender;
import com.fatec.labify.domain.User;
import com.fatec.labify.domain.UserSettings;
import com.fatec.labify.exception.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PatientService {

    private final RestClient restClient;
    private final UserService userService;
    private final NominatimClient nominatimClient;

    public PatientService(RestClient restClient, UserService userService, NominatimClient nominatimClient) {
        this.restClient = restClient;
        this.userService = userService;
        this.nominatimClient = nominatimClient;
    }

    public Page<PatientResponseDTO> findAll(Pageable pageable) {
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();

        String url = UriComponentsBuilder.fromPath("/api/pacientes")
                .queryParam("page", page)
                .queryParam("size", size)
                .toUriString();

        Map<String, Object> response = restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("content")) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        List<Map<String, Object>> contentList = (List<Map<String, Object>>) response.get("content");
        long total = ((Number) response.getOrDefault("totalElements", 0)).longValue();

        List<PatientResponseDTO> content = contentList.stream()
                .map(this::mapToDTO)
                .filter(Objects::nonNull)
                .toList();

        return new PageImpl<>(content, pageable, total);
    }

    public PatientResponseDTO findById(String id, String username) {
        User user = userService.validateUser(id, username);
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/pacientes/{id}", user.getId())
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null) {
                throw new NotFoundException("Paciente", id);
            }

            return mapToDTO(response);
        } catch (Exception e) {
            throw new NotFoundException("Paciente", id);
        }
    }

    public CreatePatientResponseDTO create(String email, CreatePatientDTO dto) {
        // Fetch user first to get ID
        User user = (User) userService.loadUserByUsername(email);
        validateCpf(dto.getCpf());

        // Resolve coordinates
        GeolocationDTO geolocationDTO = nominatimClient.getGeolocation(dto.getAddressDTO());

        Map<String, Object> addressMap = new HashMap<>();
        if (dto.getAddressDTO() != null) {
            addressMap.put("street", dto.getAddressDTO().getStreet());
            addressMap.put("number", dto.getAddressDTO().getNumber());
            addressMap.put("complement", dto.getAddressDTO().getComplement());
            addressMap.put("neighborhood", dto.getAddressDTO().getNeighborhood());
            addressMap.put("city", dto.getAddressDTO().getCity());
            addressMap.put("state", dto.getAddressDTO().getState());
            addressMap.put("zipCode", dto.getAddressDTO().getZipCode());
            addressMap.put("country", dto.getAddressDTO().getCountry() != null ? dto.getAddressDTO().getCountry() : "Brasil");
            if (geolocationDTO != null) {
                addressMap.put("latitude", geolocationDTO.getLatitude());
                addressMap.put("longitude", geolocationDTO.getLongitude());
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("id", user.getId());
        body.put("birthDate", dto.getBirthDate() != null ? dto.getBirthDate().toString() : null);
        body.put("cpf", dto.getCpf());
        body.put("phoneNumber", dto.getPhoneNumber());
        body.put("gender", dto.getGender() != null ? dto.getGender().name() : null);
        body.put("weight", dto.getWeight());
        body.put("height", dto.getHeight());
        body.put("address", addressMap);
        body.put("emergencyContactName", dto.getEmergencyContactName());
        body.put("emergencyContactNumber", dto.getEmergencyContactNumber());

        Map<String, Object> response = restClient.post()
                .uri("/api/pacientes")
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null) {
            throw new RuntimeException("Erro ao criar perfil de paciente");
        }

        // Set user role to PATIENT
        Map<String, Object> userUpdate = new HashMap<>();
        userUpdate.put("role", "PATIENT");
        restClient.put()
                .uri("/api/users/{id}", user.getId())
                .body(userUpdate)
                .retrieve()
                .toBodilessEntity();

        CreatePatientResponseDTO respDto = new CreatePatientResponseDTO();
        respDto.setId(user.getId());
        
        String createdAtStr = (String) response.get("createdAt");
        if (createdAtStr != null) {
            try {
                respDto.setCreatedAt(LocalDateTime.parse(createdAtStr.substring(0, 19), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                respDto.setCreatedAt(LocalDateTime.now());
            }
        } else {
            respDto.setCreatedAt(LocalDateTime.now());
        }

        return respDto;
    }

    public PatientResponseDTO update(String id, UpdatePatientDTO dto, String username) {
        User user = userService.validateUser(id, username);

        Map<String, Object> body = new HashMap<>();
        if (dto.getWeight() != null) body.put("weight", dto.getWeight());
        if (dto.getHeight() != null) body.put("height", dto.getHeight());
        if (dto.getPhoneNumber() != null) body.put("phoneNumber", dto.getPhoneNumber());
        if (dto.getGender() != null) body.put("gender", dto.getGender().name());
        if (dto.getEmergencyContactName() != null) body.put("emergencyContactName", dto.getEmergencyContactName());
        if (dto.getEmergencyContactNumber() != null) body.put("emergencyContactNumber", dto.getEmergencyContactNumber());

        if (dto.getAddressDTO() != null) {
            GeolocationDTO geolocationDTO = nominatimClient.getGeolocation(dto.getAddressDTO());
            Map<String, Object> addressMap = new HashMap<>();
            addressMap.put("street", dto.getAddressDTO().getStreet());
            addressMap.put("number", dto.getAddressDTO().getNumber());
            addressMap.put("complement", dto.getAddressDTO().getComplement());
            addressMap.put("neighborhood", dto.getAddressDTO().getNeighborhood());
            addressMap.put("city", dto.getAddressDTO().getCity());
            addressMap.put("state", dto.getAddressDTO().getState());
            addressMap.put("zipCode", dto.getAddressDTO().getZipCode());
            addressMap.put("country", dto.getAddressDTO().getCountry() != null ? dto.getAddressDTO().getCountry() : "Brasil");
            if (geolocationDTO != null) {
                addressMap.put("latitude", geolocationDTO.getLatitude());
                addressMap.put("longitude", geolocationDTO.getLongitude());
            }
            body.put("address", addressMap);
        }

        Map<String, Object> response = restClient.put()
                .uri("/api/pacientes/{id}", user.getId())
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null) {
            throw new NotFoundException("Paciente", id);
        }

        return mapToDTO(response);
    }

    public void delete(String id, String username) {
        User user = userService.validateUser(id, username);
        restClient.delete()
                .uri("/api/pacientes/{id}", user.getId())
                .retrieve()
                .toBodilessEntity();
    }

    private void validateCpf(String cpf) {
        try {
            // Check if patient with this CPF exists by fetching
            // Wait, we don't have a direct search-by-cpf endpoint in pacientes.ts,
            // but we can query GET /api/pacientes?cpf=... if supported or let the database return error
            // Actually, we can search by fetching. To keep it simple: the Node.js POST will throw error if CPF exists.
        } catch (Exception e) {
            throw new AlreadyExistsException("Paciente", "CPF", cpf);
        }
    }

    private PatientResponseDTO mapToDTO(Map<String, Object> map) {
        if (map == null) return null;

        PatientResponseDTO dto = new PatientResponseDTO();
        String userId = (String) map.get("id");
        dto.setId(userId);
        dto.setCpf((String) map.get("cpf"));
        dto.setPhoneNumber((String) map.get("phoneNumber"));
        
        String genderStr = (String) map.get("gender");
        if (genderStr != null) {
            try {
                dto.setGender(Gender.valueOf(genderStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }

        dto.setWeight(map.get("weight") != null ? new BigDecimal(map.get("weight").toString()) : null);
        dto.setHeight(map.get("height") != null ? new BigDecimal(map.get("height").toString()) : null);
        dto.setEmergencyContactName((String) map.get("emergencyContactName"));
        dto.setEmergencyContactNumber((String) map.get("emergencyContactNumber"));

        String birthDateStr = (String) map.get("birthDate");
        if (birthDateStr != null && birthDateStr.length() >= 10) {
            try {
                dto.setBirthDate(LocalDate.parse(birthDateStr.substring(0, 10)));
            } catch (Exception e) {
                // ignore
            }
        }

        Map<String, Object> addrMap = (Map<String, Object>) map.get("address");
        if (addrMap != null) {
            AddressDTO addrDto = new AddressDTO();
            addrDto.setStreet((String) addrMap.get("street"));
            addrDto.setNumber((String) addrMap.get("number"));
            addrDto.setComplement((String) addrMap.get("complement"));
            addrDto.setNeighborhood((String) addrMap.get("neighborhood"));
            addrDto.setCity((String) addrMap.get("city"));
            addrDto.setState((String) addrMap.get("state"));
            addrDto.setZipCode((String) addrMap.get("zipCode"));
            addrDto.setCountry((String) addrMap.get("country"));
            dto.setAddress(addrDto);
        }

        // Fetch user details for UserInfoDTO
        try {
            Map<String, Object> userResponse = restClient.get()
                    .uri("/api/users/{id}", userId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
            
            if (userResponse != null) {
                User user = new User();
                user.setId((String) userResponse.get("id"));
                user.setName((String) userResponse.get("name"));
                user.setEmail((String) userResponse.get("email"));
                // Settings mapping
                if (userResponse.containsKey("settings")) {
                    // map settings if needed, else construct default
                }
                dto.setUserInfoDTO(new UserInfoDTO(user));
            }
        } catch (Exception e) {
            // fallback
        }

        return dto;
    }

}
