package com.fatec.labify.api.dto.patient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fatec.labify.domain.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreatePatientDTO {

    @CPF(message = "CPF inválido")
    @NotBlank(message = "O cpf não pode estar em branco")
    private String cpf;

    @Pattern(regexp = "\\d{10,11}", message = "Número de telefone inválido")
    private String phoneNumber;

    @NotNull
    private Gender gender;

    @NotNull
    private BigDecimal weight;

    @NotNull(message = "A altura é obrigatória")
    private BigDecimal height;

    @Past
    @NotNull(message = "A data de nascimento é obrigatória")
    private LocalDate birthDate;

    @NotBlank(message = "Nome de contato de emergência é obrigatório")
    private String emergencyContactName;

    @NotBlank(message = "Número de contato de emergência é obrigatório")
    private String emergencyContactNumber;

    private AddressDTO addressDTO;
}
