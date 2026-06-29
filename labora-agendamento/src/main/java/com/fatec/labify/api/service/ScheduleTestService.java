package com.fatec.labify.api.service;

import com.fatec.labify.api.dto.patient.AddressDTO;
import com.fatec.labify.api.dto.patient.PatientResponseDTO;
import com.fatec.labify.api.dto.test.RescheduleTestDTO;
import com.fatec.labify.api.dto.test.ScheduleTestDTO;
import com.fatec.labify.api.dto.test.ScheduledTestResponseDTO;
import com.fatec.labify.domain.*;
import com.fatec.labify.exception.NotFoundException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ScheduleTestService {

    private final RestClient restClient;
    private final UserService userService;
    private final PatientService patientService;

    public ScheduleTestService(RestClient restClient, UserService userService, PatientService patientService) {
        this.restClient = restClient;
        this.userService = userService;
        this.patientService = patientService;
    }

    public List<ScheduledTestResponseDTO> findAllCompletedTests(String username) {
        User user = (User) userService.loadUserByUsername(username);
        PatientResponseDTO patient = patientService.findById(user.getId(), username);

        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/agendamentos")
                        .queryParam("cpf", patient.getCpf())
                        .queryParam("status", "Concluído")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("data")) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        return data.stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<ScheduledTestResponseDTO> findAllScheduledTests(String username) {
        User user = (User) userService.loadUserByUsername(username);
        PatientResponseDTO patient = patientService.findById(user.getId(), username);

        // Fetch all agendamentos for this CPF and we will filter for confirmed status
        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/agendamentos")
                        .queryParam("cpf", patient.getCpf())
                        .queryParam("status", "Confirmado")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("data")) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        return data.stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<ScheduledTestResponseDTO> findAllTests(String username) {
        User user = (User) userService.loadUserByUsername(username);
        PatientResponseDTO patient = patientService.findById(user.getId(), username);

        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/agendamentos")
                        .queryParam("cpf", patient.getCpf())
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("data")) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        return data.stream()
                .map(this::mapToDTO)
                .toList();
    }

    public ScheduledTestResponseDTO schedule(ScheduleTestDTO scheduleTestDTO, String username) {
        User user = (User) userService.loadUserByUsername(username);
        PatientResponseDTO patient = patientService.findById(user.getId(), username);

        Map<String, Object> body = new HashMap<>();
        body.put("patient", user.getId());
        body.put("cpf", patient.getCpf());
        body.put("date", scheduleTestDTO.getScheduledFor().toLocalDate().toString());
        body.put("time", scheduleTestDTO.getScheduledFor().toLocalTime().toString().substring(0, 5));
        body.put("examId", scheduleTestDTO.getTestId());
        body.put("branchId", scheduleTestDTO.getBranchId());

        Map<String, Object> response = restClient.post()
                .uri("/api/agendamentos")
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null) {
            throw new RuntimeException("Erro ao agendar exame");
        }

        return mapToDTO(response);
    }

    public List<ScheduledTestResponseDTO> scheduleTests(List<ScheduleTestDTO> scheduledTests, String username) {
        return scheduledTests.stream()
                .map(dto -> schedule(dto, username))
                .toList();
    }

    public List<ScheduledTestResponseDTO> findScheduledTestsByBranchId(String id, String username) {
        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/agendamentos")
                        .queryParam("branchId", id)
                        .queryParam("status", "Confirmado")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("data")) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        return data.stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<ScheduledTestResponseDTO> findCompletedTestsByBranchId(String id, String username) {
        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/agendamentos")
                        .queryParam("branchId", id)
                        .queryParam("status", "Concluído")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("data")) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        return data.stream()
                .map(this::mapToDTO)
                .toList();
    }

    public ScheduledTestResponseDTO reschedule(RescheduleTestDTO dto, String id, String username) {
        Map<String, Object> body = new HashMap<>();
        if (dto.getScheduledFor() != null) {
            body.put("date", dto.getScheduledFor().toLocalDate().toString());
            body.put("time", dto.getScheduledFor().toLocalTime().toString().substring(0, 5));
        }
        if (dto.getBranchId() != null) {
            body.put("branchId", dto.getBranchId());
        }

        Map<String, Object> response = restClient.put()
                .uri("/api/agendamentos/{id}", id)
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null) {
            throw new NotFoundException("Agendamento", id);
        }

        // The put response in Node returns full populated appointment details, let's fetch to map properly
        return getScheduledTestById(id);
    }

    public void cancelTest(String id, String username) {
        restClient.delete()
                .uri("/api/agendamentos/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    private ScheduledTestResponseDTO getScheduledTestById(String id) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/agendamentos/{id}", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
            if (response != null) {
                return mapToDTO(response);
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    private ScheduledTestResponseDTO mapToDTO(Map<String, Object> map) {
        ScheduledTestResponseDTO dto = new ScheduledTestResponseDTO();
        dto.setId((String) map.get("id"));

        Map<String, Object> examMap = (Map<String, Object>) map.get("exam");
        if (examMap != null) {
            dto.setTestName((String) examMap.get("name"));
            if (examMap.get("preparationInstructions") != null) {
                dto.setPreparationInstructions((String) examMap.get("preparationInstructions"));
            }
        } else {
            dto.setTestName("Exame Indefinido");
        }

        dto.setPatientName((String) map.get("patient"));

        String date = (String) map.get("date");
        String time = (String) map.get("time");
        if (date != null && time != null) {
            try {
                dto.setScheduledFor(LocalDateTime.parse(date + "T" + time + ":00"));
            } catch (Exception e) {
                // ignore
            }
        }

        String createdAtStr = (String) map.get("createdAt");
        if (createdAtStr != null) {
            try {
                dto.setScheduledAt(LocalDateTime.parse(createdAtStr.substring(0, 19), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                // ignore
            }
        }

        Map<String, Object> branchMap = (Map<String, Object>) map.get("branch");
        if (branchMap != null) {
            dto.setBranchName((String) branchMap.get("name"));
            if (branchMap.get("address") != null) {
                dto.setBranchAddress(mapAddress((Map<String, Object>) branchMap.get("address")));
            }
        }

        String statusStr = (String) map.get("status");
        if (statusStr != null) {
            dto.setStatus(mapStatus(statusStr));
        }

        dto.setResultUrl((String) map.get("resultUrl"));
        return dto;
    }

    private TestStatus mapStatus(String statusStr) {
        if (statusStr == null) return TestStatus.AGENDADO;
        switch (statusStr.toLowerCase()) {
            case "concluído":
            case "concluido":
                return TestStatus.CONCLUIDO;
            case "cancelado":
                return TestStatus.CANCELADO;
            case "realizado":
            case "check-in":
                return TestStatus.REALIZADO;
            case "aguardando resultado":
            case "aguardando_resultado":
                return TestStatus.AGUARDANDO_RESULTADOS;
            default:
                return TestStatus.AGENDADO;
        }
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