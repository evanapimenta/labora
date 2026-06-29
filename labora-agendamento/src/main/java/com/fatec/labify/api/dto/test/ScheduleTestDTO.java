package com.fatec.labify.api.dto.test;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ScheduleTestDTO {

    @NotBlank(message = "Exame não pode estar vazio")
    private String testId;

    @NotBlank(message = "Paciente não pode estar vazio")
    private String patientId;

    @Future(message = "O agendamento deve ser feito para uma data e horário futuros")
    @NotNull(message = "Exame deve ter uma data de realização")
    private LocalDateTime scheduledFor;

    private LocalDateTime scheduledAt;

    @NotBlank(message = "Exame deve ter uma filial vinculada")
    private String branchId;

}
