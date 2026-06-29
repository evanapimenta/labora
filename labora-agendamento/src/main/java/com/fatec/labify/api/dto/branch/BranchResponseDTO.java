package com.fatec.labify.api.dto.branch;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fatec.labify.api.dto.patient.AddressDTO;
import com.fatec.labify.domain.Branch;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BranchResponseDTO {
    private String id;
    private String name;
    private AddressDTO address;
    private String phoneNumber;
    private String email;
    private String openingHours;
    private double distanceKm;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BranchResponseDTO(Branch branch) {
        this.id = branch.getId();
        this.name = branch.getName();
        this.email = branch.getEmail();
        this.phoneNumber = branch.getPhoneNumber();
        this.address = branch.getAddress() != null ? new AddressDTO(branch.getAddress()) : null;
        this.createdAt = branch.getCreatedAt();
        this.updatedAt = branch.getUpdatedAt();
    }
}
