package com.fatec.labify.exception;

public class ForbiddenOperationException extends BaseException {
    private static final String DEFAULT_MESSAGE = "Acesso não autorizado";

    public ForbiddenOperationException() {
        super(DEFAULT_MESSAGE);
    }
}
