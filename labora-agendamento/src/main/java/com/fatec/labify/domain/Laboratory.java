package com.fatec.labify.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "laboratories")
public class Laboratory {

    @Id
    private String id;

    private String name;

    @Embedded
    private Address address;

    private String phoneNumber;

    private boolean active;

    private String email;

    private String cnpj;

    @OneToMany(mappedBy = "laboratory")
    private List<Branch> branches;

    @ManyToOne
    @JoinColumn(name = "super_admin_id")
    private User superAdmin;

    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Laboratory(String name, Address address, String phoneNumber, String email, String cnpj) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.cnpj = cnpj;
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
