package com.fatec.labify.api.dto.test;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateTestDTO {

    private String name;

    private String description;

    private String estimatedResultTime;

    private String preparationInstructions;

}
