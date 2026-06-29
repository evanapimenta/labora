package com.fatec.labify.api.dto.patient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fatec.labify.api.dto.user.UserInfoDTO;
import com.fatec.labify.domain.Gender;
import com.fatec.labify.domain.Patient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientResponseDTO {

    private String id;

    private String phoneNumber;

    private String cpf;

    private UserInfoDTO userInfoDTO;

    private Gender gender;

    private BigDecimal weight;

    private BigDecimal height;

    private String emergencyContactName;

    private String emergencyContactNumber;

    private LocalDate birthDate;

    private AddressDTO address;

    public PatientResponseDTO(Patient patient) {
        this.id = patient.getId();
        this.cpf = patient.getCpf();
        this.phoneNumber = patient.getPhoneNumber();
        this.userInfoDTO = new UserInfoDTO(patient.getUser());
        this.gender = patient.getGender();
        this.address = patient.getAddress() != null ? new AddressDTO(patient.getAddress()) : null;
        this.weight = patient.getWeight();
        this.height = patient.getHeight();
        this.emergencyContactName = patient.getEmergencyContactName();
        this.emergencyContactNumber = patient.getEmergencyContactNumber();
        this.birthDate = patient.getBirthDate();
    }
}