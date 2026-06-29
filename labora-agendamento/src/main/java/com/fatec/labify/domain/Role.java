package com.fatec.labify.domain;

import org.springframework.security.core.GrantedAuthority;

import java.util.Arrays;
import java.util.Optional;

public enum Role implements GrantedAuthority {
    SYSTEM,
    LAB,
    BRANCH,
    PATIENT;

    public static Optional<Role> fromString(String roleName) {
        if (roleName == null) return Optional.empty();

        return Arrays.stream(values())
                .filter(r -> r.name().equalsIgnoreCase(roleName))
                .findFirst();
    }
    @Override
    public String getAuthority() {
        return "ROLE_" + name();
    }

}
