package com.fatec.labify.api.dto.authentication;

import jakarta.validation.constraints.NotBlank;

public record LoginDataDTO(
        @NotBlank String email,
        @NotBlank String password
) {
}
