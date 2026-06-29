package com.fatec.labify.exception;

public abstract class BaseException extends RuntimeException {
    public BaseException(String messageTemplate, Object... args) {
        super(String.format(messageTemplate, args));
    }
}