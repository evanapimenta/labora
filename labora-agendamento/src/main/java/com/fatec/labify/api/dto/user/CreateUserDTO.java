package com.fatec.labify.api.dto.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateUserDTO {

    @NotBlank(message = "O nome não pode estar em branco")
    private String name;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email não pode estar em branco")
    private String email;

    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).+$",
            message = "Senha deve ter letras maiúsculas, minúsculas e números"
    )
    @NotBlank(message = "A senha não pode estar em branco") @Size(min = 8)
    private String password;

}

