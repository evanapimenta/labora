package com.fatec.labify.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fatec.labify.exception.InvalidTokenException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    private String id;

    private String name;

    private String email;

    private String password;

    private boolean active;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String imagePathUrl;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    private String token;

    private boolean verified;

    private LocalDateTime tokenExpiresIn;

    private LocalDateTime lastLoginAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Patient patient;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings", columnDefinition = "jsonb")
    private UserSettings settings = new UserSettings();

    public User(String name, String email, String password) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.password = password;
        this.active = false;
        this.verified = false;
        this.createdAt = LocalDateTime.now();
        this.token = UUID.randomUUID().toString();
        this.tokenExpiresIn = LocalDateTime.now().plusMinutes(30);
        this.settings = new UserSettings();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) {
            return Collections.emptyList();
        }

        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    public void verify() {
        if (tokenExpiresIn.isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Link de verificação expirado!");
        }
        this.verified = true;
        this.active = true;
        this.token = null;
        this.tokenExpiresIn = null;
    }

}