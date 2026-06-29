package com.fatec.labify.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_tokens")
@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter
public class UserToken {

    @Id
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT", nullable = false)
    private String refreshToken;

    @Column(name = "id_token", columnDefinition = "TEXT", nullable = false)
    private String idToken;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
