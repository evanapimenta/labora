package com.fatec.labify.exception;

public class UserNotVerifiedException extends RuntimeException {
    private static final String DEFAULT_MESSAGE = "Usuário não verificado";

    public UserNotVerifiedException() {
        super(DEFAULT_MESSAGE);
    }
}