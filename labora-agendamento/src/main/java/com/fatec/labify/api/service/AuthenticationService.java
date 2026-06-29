package com.fatec.labify.api.service;

import com.fatec.labify.api.dto.authentication.TokenData;
import com.fatec.labify.domain.User;
import com.fatec.labify.exception.UserNotVerifiedException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Component
public class AuthenticationService {

    private final RestClient restClient;
    private final TokenService tokenService;

    public AuthenticationService(RestClient restClient, TokenService tokenService) {
        this.restClient = restClient;
        this.tokenService = tokenService;
    }

    public TokenData login(User user) {
        validateVerified(user);

        String accessToken = tokenService.generateToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        user.updateLastLogin();
        updateLastLoginInApi(user);
        return new TokenData(accessToken, refreshToken);
    }

    public TokenData requestRefreshToken(String refreshToken) {
        User user = tokenService.validateAndGetUserFromToken(refreshToken);

        String newAccessToken = tokenService.generateToken(user);
        String newRefreshToken = tokenService.generateRefreshToken(user);

        user.updateLastLogin();
        updateLastLoginInApi(user);
        return new TokenData(newAccessToken, newRefreshToken);
    }

    private void updateLastLoginInApi(User user) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);

            restClient.put()
                    .uri("/api/users/{id}", user.getId())
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            // Log or ignore if the update fails so login doesn't block entirely
        }
    }

    public void validateVerified(User user) {
        if (!user.isVerified()) {
            throw new UserNotVerifiedException();
        }
    }

}