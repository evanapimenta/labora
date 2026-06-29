package com.fatec.labify.api.dto.patient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fatec.labify.domain.Patient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreatePatientResponseDTO {

    private String id;
    private LocalDateTime createdAt;

    public CreatePatientResponseDTO(Patient patient) {
        this.id = patient.getId();
        this.createdAt = patient.getCreatedAt();
    }
}
