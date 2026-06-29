package com.fatec.labify.api.dto.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fatec.labify.domain.User;
import com.fatec.labify.domain.UserSettings;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserResponseDTO {

    private String id;

    private String email;

    private String name;

    private String imagePathUrl;

    private LocalDateTime createdAt;

    private UserSettings settings;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.imagePathUrl = user.getImagePathUrl();
        this.createdAt = user.getCreatedAt();
        this.settings = user.getSettings();
    }

}
