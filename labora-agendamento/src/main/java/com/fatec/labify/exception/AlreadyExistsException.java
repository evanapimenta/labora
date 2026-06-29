package com.fatec.labify.exception;

public class AlreadyExistsException extends BaseException {

    private static final String TEMPLATE = "%s já existe com %s %s.";

    public AlreadyExistsException(String resourceName,
                                  String propertyName,
                                  String identifier)
    { super(TEMPLATE, resourceName, propertyName, identifier); }
}
