package com.fatec.labify.api.dto.patient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fatec.labify.domain.Gender;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdatePatientDTO {

    @Pattern(regexp = "\\d{10,11}", message = "Número de telefone inválido")
    private String phoneNumber;

    private Gender gender;

    private BigDecimal weight;

    private BigDecimal height;

    private String emergencyContactName;

    private String emergencyContactNumber;

    private AddressDTO addressDTO;

}
