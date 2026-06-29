package com.fatec.labify.exception;

import com.fasterxml.jackson.databind.ser.Serializers;

public class UserNotInRoleException extends BaseException {
    public UserNotInRoleException(String message) {
        super(message);
    }
}
