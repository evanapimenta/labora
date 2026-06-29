package com.fatec.labify.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "branches")
public class Branch {
    @Id
    private String id;

    private String name;

    @Embedded
    private Address address;

    private String phoneNumber;

    private String email;

    private boolean active;

    private String openingHours;

    @ManyToOne
    @JoinColumn(name = "laboratory_id", nullable = false)
    private Laboratory laboratory;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Branch(String name, String email, String phoneNumber, String openingHours, Laboratory laboratory, Address address) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.openingHours = openingHours;
        this.laboratory = laboratory;
        this.address = address;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }
}