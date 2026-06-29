package com.fatec.labify.api.dto.test;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fatec.labify.domain.Test;
import com.fatec.labify.domain.TestCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestResponseDTO {

    private String id;

    private String name;

    private String description;

    private String testCategory;

    private boolean sexSpecific;

    private String sampleType;

    private String estimatedResultTime;

    private String preparationInstructions;

    private boolean isActive;

    private Double price;

    private LocalDateTime createdAt;

    public TestResponseDTO(Test test) {
        this.id = String.valueOf(test.getId());
        this.name = test.getName();
        this.description = test.getDescription();
        this.testCategory = test.getCategory() != null ? test.getCategory().name() : null;
        this.sexSpecific = test.isSexSpecific();
        this.sampleType = test.getSampleType();
        this.estimatedResultTime = test.getEstimatedResultTime();
        this.preparationInstructions = test.getPreparationInstructions();
        this.isActive = test.isActive();
        this.createdAt = test.getCreatedAt();
    }

}
