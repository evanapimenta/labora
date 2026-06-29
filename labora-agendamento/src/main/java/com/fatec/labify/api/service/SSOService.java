package com.fatec.labify.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fatec.labify.api.dto.authentication.TokenData;
import com.fatec.labify.api.dto.authentication.UserTokenDTO;
import com.fatec.labify.client.GoogleClient;
import com.fatec.labify.domain.User;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Map;

@Service
public class SSOService {
    private final ObjectMapper objectMapper;
    private final GoogleClient googleClient;
    private final UserService userService;
    private final TokenService tokenService;

    public SSOService(ObjectMapper objectMapper, GoogleClient googleClient, UserService userService, TokenService tokenService) {
        this.objectMapper = objectMapper;
        this.googleClient = googleClient;
        this.userService = userService;
        this.tokenService = tokenService;
    }

    public TokenData exchangeCodeAndSaveToken(String code) throws JsonProcessingException {
        UserTokenDTO dto = googleClient.getUserToken(code);
        User user = getUser(dto.getIdToken());
        return new TokenData(tokenService.generateToken(user), tokenService.generateRefreshToken(user));
    }

    public User getUser(String idToken) throws JsonProcessingException {
        String email = getUsernameFromToken(idToken);
        return (User) userService.loadUserByUsername(email);
    }

    private String getUsernameFromToken(String idToken) throws JsonProcessingException {
        String[] parts = idToken.split("\\.");

        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT token format");
        }

        String payload = new String(Base64.getDecoder().decode(parts[1]));
        Map<String, Object> payloadToMap = objectMapper.readValue(payload, new TypeReference<>() {});

        return String.valueOf(payloadToMap.get("email"));
    }

}
