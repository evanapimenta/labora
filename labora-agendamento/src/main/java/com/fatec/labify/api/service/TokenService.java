package com.fatec.labify.api.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fatec.labify.domain.User;
import com.fatec.labify.domain.Role;
import com.fatec.labify.exception.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${jwt.secret}")
    private String secret;

    public TokenService() {
    }

    public String generateToken(User user) throws BaseException {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("Labify")
                    .withSubject(user.getUsername())
                    .withClaim("id", user.getId())
                    .withClaim("role", user.getRole() != null ? user.getRole().name() : null)
                    .withExpiresAt(accessTokenExpiration())
                    .sign(algorithm);
        } catch (JWTCreationException exception){
            throw new TokenGenerationException("Erro ao gerar o token. Tente novamente");
        }
    }

    public String generateRefreshToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("Labify")
                    .withSubject(user.getUsername())
                    .withClaim("id", user.getId())
                    .withClaim("role", user.getRole() != null ? user.getRole().name() : null)
                    .withExpiresAt(refreshTokenExpiration())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new TokenGenerationException("Erro ao gerar token. Tente novamente");
        }
    }

    public User validateAndGetUserFromToken(String jwtToken) throws BaseException {
        DecodedJWT decodedJWT;
        Algorithm algorithm = Algorithm.HMAC256(secret);
        JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer("Labify")
                .build();

        decodedJWT = verifier.verify(jwtToken);
        String userId = decodedJWT.getClaim("id").asString();

        if (userId == null) {
            throw new TokenVerificationException("ID do usuário não encontrado no token.");
        }

        String email = decodedJWT.getSubject();
        String roleStr = decodedJWT.getClaim("role").asString();
        String name = decodedJWT.getClaim("name").asString();

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setName(name);
        user.setVerified(true);
        user.setActive(true);

        if (roleStr != null) {
            try {
                user.setRole(Role.valueOf(roleStr));
            } catch (IllegalArgumentException e) {
                // Fallback
            }
        }

        return user;
    }

    private Instant accessTokenExpiration() {
        return LocalDateTime.now().plusMinutes(5).toInstant(ZoneOffset.of("-03:00"));
    }

    private Instant refreshTokenExpiration() {
        return LocalDateTime.now().plusMinutes(100000).toInstant(ZoneOffset.of("-03:00"));
    }

}
