package com.fatec.labify.api.dto.test;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fatec.labify.domain.TestCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateTestDTO {

    @NotBlank(message = "Nome do exame é obrigatório")
    private String name;

    @NotBlank(message = "Descrição do exame é obrigatório")
    private String description;

    @NotNull(message = "Categoria do exame é obrigatória")
    private TestCategory category;

    private boolean sexSpecific;

    private String sampleType;

    private String estimatedResultTime;

    private String preparationInstructions;

}
