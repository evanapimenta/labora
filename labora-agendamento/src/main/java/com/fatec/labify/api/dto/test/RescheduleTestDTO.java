package com.fatec.labify.api.dto.test;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Future;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class RescheduleTestDTO {

    @Future(message = "O agendamento deve ser feito para uma data e horário futuros")
    LocalDateTime scheduledFor;

    String branchId;

}
