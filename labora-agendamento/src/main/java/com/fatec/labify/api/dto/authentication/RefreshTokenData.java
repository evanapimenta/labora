package com.fatec.labify.api.dto.authentication;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenData(@NotBlank String refreshToken) {
}
