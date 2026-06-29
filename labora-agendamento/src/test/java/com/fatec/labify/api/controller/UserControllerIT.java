package com.fatec.labify.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fatec.labify.api.dto.user.CreateUserDTO;
import com.fatec.labify.api.dto.user.UpdateUserDTO;
import com.fatec.labify.domain.UserSettings;
import com.fatec.labify.api.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = "/sql/beforeTestRunUserControllerIT.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/afterTestRunUserControllerIT.sql", executionPhase =  Sql.ExecutionPhase.AFTER_TEST_METHOD)
public class UserControllerIT {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    private EmailService emailService;

    @Test
    @WithMockUser(username = "system@agendaexame.com", roles = "SYSTEM")
    public void shouldListUsers() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.content[0].email").value("system@agendaexame.com"))
                .andExpect(jsonPath("$.content[0].name").value("SYSTEM"))
                .andExpect(jsonPath("$.content[1].email").value("email@email.com"))
                .andExpect(jsonPath("$.content[1].name").value("Fulano"))
                .andReturn();
    }

    @Test
    @WithMockUser(username = "email@email.com", roles = "PATIENT")
    public void shouldGetUserById() throws Exception {
        String userId = "e13dce78-e2bc-4fbb-bd5b-15ab5585e2a7";
        mockMvc.perform(get("/users/" + userId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.email").value("email@email.com"))
                .andExpect(jsonPath("$.name").value("Fulano"))
                .andExpect(jsonPath("$.createdAt").value("2025-08-14T18:56:29.12"));
    }

    @Test
    @WithMockUser(username = "outroemail@email.com", roles = "PATIENT")
    public void shouldReturnForbiddenGetUserById() throws Exception {
        String userId = "e13dce78-e2bc-4fbb-bd5b-15ab5585e2a7";
        mockMvc.perform(get("/users/" + userId))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType("text/plain;charset=UTF-8"))
                .andExpect(content().string("Acesso não autorizado"));
    }

    @Test
    public void shouldCreateUser() throws Exception {
        CreateUserDTO createUserDTO = new CreateUserDTO();
        createUserDTO.setName("Ciclano");
        createUserDTO.setEmail("ciclano@email.com");
        createUserDTO.setPassword("Password*13");

        String requestBody = objectMapper.writeValueAsString(createUserDTO);
        doNothing().when(emailService).sendEmail(anyString(), anyString(), anyString());

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.email").value(createUserDTO.getEmail()))
                .andExpect(jsonPath("$.name").value(createUserDTO.getName()));
    }

    @Test
    @WithMockUser(username = "outroemail@email.com", roles = "PATIENT")
    public void shouldUpdateUser() throws Exception {
        String userId = "5165dada-fca0-45eb-be19-cde2853f7e81";

        UpdateUserDTO updateUserDTO = new UpdateUserDTO();
        updateUserDTO.setName("Ciclano de Tal");
        updateUserDTO.setEmail("anotheremail@email.com");

        String requestBody = objectMapper.writeValueAsString(updateUserDTO);

        mockMvc.perform(put("/users/" + userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.email").value(updateUserDTO.getEmail()))
                .andExpect(jsonPath("$.name").value(updateUserDTO.getName()));
    }

    @Test
    @WithMockUser(username = "email@email.com", roles = "PATIENT")
    public void shouldReturnForbiddenUpdateUser() throws Exception {
        String userId = "5165dada-fca0-45eb-be19-cde2853f7e81";

        UpdateUserDTO updateUserDTO = new UpdateUserDTO();
        updateUserDTO.setName("Ciclano de Tal");
        updateUserDTO.setEmail("anotheremail@email.com");

        String requestBody = objectMapper.writeValueAsString(updateUserDTO);

        mockMvc.perform(put("/users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType("text/plain;charset=UTF-8"))
                .andExpect(content().string("Acesso não autorizado"));
    }

    @Test
    @WithMockUser(username = "email@email.com", roles = "PATIENT")
    public void shouldDeleteUser() throws Exception {
        String userId = "e13dce78-e2bc-4fbb-bd5b-15ab5585e2a7";

        mockMvc.perform(delete("/users/" + userId))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser(username = "outroemail@email.com", roles = "PATIENT")
    public void shouldReturnForbiddenDeleteUser() throws Exception {
        String userId = "e13dce78-e2bc-4fbb-bd5b-15ab5585e2a7";

        mockMvc.perform(delete("/users/" + userId))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType("text/plain;charset=UTF-8"))
                .andExpect(content().string("Acesso não autorizado"));
    }



    @Test
    @WithMockUser(username = "email@email.com", roles = "PATIENT")
    public void shouldUpdateUserSettings() throws Exception {
        String userId = "e13dce78-e2bc-4fbb-bd5b-15ab5585e2a7";
        UserSettings settings = new UserSettings("dark", true);
        String requestBody = objectMapper.writeValueAsString(settings);

        mockMvc.perform(put("/users/" + userId + "/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.settings.theme").value("dark"))
                .andExpect(jsonPath("$.settings.sidebarCollapsed").value(true));
    }

    //verify
    //change password
}
