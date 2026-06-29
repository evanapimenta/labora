package com.fatec.labify.exception;

import jakarta.validation.constraints.NotBlank;

public class NotFoundException extends BaseException {
    public NotFoundException(String resourceName, String identifier) {
        super(String.format("%s não encontrado: %s", resourceName, identifier));
    }

    public NotFoundException(String resourceName, Long identifier) {
        super(String.format("%s não encontrado: %s", resourceName, identifier));
    }

    public NotFoundException(String resourceName) {
        super(String.format("%s não encontrado", resourceName));
    }

}
