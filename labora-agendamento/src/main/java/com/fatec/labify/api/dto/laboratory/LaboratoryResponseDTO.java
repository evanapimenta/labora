package com.fatec.labify.api.dto.laboratory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fatec.labify.api.dto.branch.BranchResponseDTO;
import com.fatec.labify.api.dto.patient.AddressDTO;
import com.fatec.labify.domain.Laboratory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LaboratoryResponseDTO {

    private String id;
    private String name;
    private AddressDTO address;
    private String cnpj;
    private String phoneNumber;
    private String email;
    private String createdAt;
    private String updatedAt;
    private List<BranchResponseDTO> branches;

    public LaboratoryResponseDTO(Laboratory lab) {
        this.id = lab.getId();
        this.name = lab.getName();
        this.address = lab.getAddress() != null ? new AddressDTO(lab.getAddress()) : null;
        this.cnpj = lab.getCnpj();
        this.phoneNumber = lab.getPhoneNumber();
        this.email = lab.getEmail();
        this.createdAt = lab.getCreatedAt() != null ? lab.getCreatedAt().toString() : null;
        this.updatedAt = lab.getUpdatedAt() != null ? lab.getUpdatedAt().toString() : null;
        this.branches = lab.getBranches() != null ? lab.getBranches().stream().map(BranchResponseDTO::new).toList() : null;
    }

}
