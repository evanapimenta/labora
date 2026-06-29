package com.fatec.labify.api.service;

import com.fatec.labify.api.dto.authentication.TokenData;
import com.fatec.labify.api.dto.authentication.UpdatePasswordDTO;
import com.fatec.labify.api.dto.user.CreateUserDTO;
import com.fatec.labify.api.dto.user.UpdateUserDTO;
import com.fatec.labify.api.dto.user.UserResponseDTO;
import com.fatec.labify.domain.Role;
import com.fatec.labify.domain.User;
import com.fatec.labify.domain.UserSettings;
import com.fatec.labify.exception.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService implements UserDetailsService {

    private final RestClient restClient;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TokenService tokenService;

    public UserService(RestClient restClient, PasswordEncoder passwordEncoder, EmailService emailService, TokenService tokenService) {
        this.restClient = restClient;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.tokenService = tokenService;
    }

    public Page<UserResponseDTO> findAll(Pageable pageable) {
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();

        String url = UriComponentsBuilder.fromPath("/api/users")
                .queryParam("page", page)
                .queryParam("size", size)
                .toUriString();

        Map<String, Object> response = restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("content")) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        List<Map<String, Object>> contentList = (List<Map<String, Object>>) response.get("content");
        long total = ((Number) response.getOrDefault("totalElements", 0)).longValue();

        List<UserResponseDTO> content = contentList.stream()
                .map(this::mapToDTO)
                .toList();

        return new PageImpl<>(content, pageable, total);
    }

    public UserResponseDTO findById(String id, String username) {
        return new UserResponseDTO(validateUser(id, username));
    }

    public UserResponseDTO create(CreateUserDTO dto) {
        validateEmail(dto.getEmail());

        User user = new User(dto.getName(), dto.getEmail().toLowerCase(), passwordEncoder.encode(dto.getPassword()));

        Map<String, Object> body = new HashMap<>();
        body.put("id", user.getId());
        body.put("name", user.getName());
        body.put("email", user.getEmail());
        body.put("password", user.getPassword());
        body.put("active", user.isActive());
        body.put("role", user.getRole() != null ? user.getRole().name() : null);
        body.put("verified", user.isVerified());
        body.put("token", user.getToken());
        body.put("tokenExpiresIn", user.getTokenExpiresIn() != null ? user.getTokenExpiresIn().toString() : null);

        restClient.post()
                .uri("/api/users")
                .body(body)
                .retrieve()
                .toBodilessEntity();

        emailService.sendVerificationEmail(user);
        return new UserResponseDTO(user);
    }

    public TokenData verifyAccount(String token) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/verify-account?code={code}", token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
                throw new InvalidTokenException("Link de verificação inválido ou expirado!");
            }

            Map<String, Object> userMap = (Map<String, Object>) response.get("user");
            User user = new User();
            user.setId((String) userMap.get("id"));
            user.setEmail((String) userMap.get("email"));
            user.setName((String) userMap.get("name"));
            String roleStr = (String) userMap.get("role");
            if (roleStr != null) {
                user.setRole(Role.valueOf(roleStr));
            }
            user.setVerified(true);
            user.setActive(true);

            return new TokenData(tokenService.generateToken(user), tokenService.generateRefreshToken(user));
        } catch (Exception e) {
            throw new InvalidTokenException("Link de verificação inválido ou expirado!");
        }
    }

    public UserResponseDTO update(String id, UpdateUserDTO updateUserDTO, String username) {
        User user = validateUser(id, username);

        Map<String, Object> body = new HashMap<>();
        if (updateUserDTO.getName() != null) {
            body.put("name", updateUserDTO.getName());
            user.setName(updateUserDTO.getName());
        }

        if (updateUserDTO.getEmail() != null) {
            validateEmail(updateUserDTO.getEmail());
            body.put("email", updateUserDTO.getEmail());
            user.setEmail(updateUserDTO.getEmail());
        }

        restClient.put()
                .uri("/api/users/{id}", id)
                .body(body)
                .retrieve()
                .toBodilessEntity();

        return new UserResponseDTO(user);
    }

    public String updateImage(String id, MultipartFile file, String username) throws IOException {
        User user = validateUser(id, username);
        Path path = Paths.get("uploads/profile-images/");

        if (user.getImagePathUrl() != null) {
            Path oldFile = path.resolve(
                    Paths.get(user.getImagePathUrl()).getFileName());
            Files.deleteIfExists(oldFile);
        }

        String originalName = file.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
        String fileName = UUID.randomUUID() + "-" + originalName;
        Path uploadPath = path;
        Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(fileName);
        file.transferTo(filePath);

        String urlPath = "/images/profile/" + fileName;

        Map<String, Object> body = new HashMap<>();
        body.put("imagePathUrl", urlPath);

        restClient.put()
                .uri("/api/users/{id}/upload-image", id)
                .body(body)
                .retrieve()
                .toBodilessEntity();

        return urlPath;
    }

    public void changePassword(String id, String username, UpdatePasswordDTO updatePasswordDTO) {
        validateUser(id, username);

        Map<String, Object> body = new HashMap<>();
        body.put("password", passwordEncoder.encode(updatePasswordDTO.getPassword()));

        restClient.put()
                .uri("/api/users/{id}/change-password", id)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    public void delete(String id, String username) {
        validateUser(id, username);

        // First delete associated patient profile
        try {
            restClient.delete()
                    .uri("/api/pacientes/{id}", id)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            // patient profile might not exist, ignore
        }

        // Then delete user
        restClient.delete()
                .uri("/api/users/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/{id}", username)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null) {
                throw new NotFoundException("Usuário", username);
            }

            User user = new User();
            user.setId((String) response.get("id"));
            user.setName((String) response.get("name"));
            user.setEmail((String) response.get("email"));
            user.setPassword((String) response.get("password"));
            user.setActive(Boolean.TRUE.equals(response.get("active")));
            user.setVerified(Boolean.TRUE.equals(response.get("verified")));

            String roleStr = (String) response.get("role");
            if (roleStr != null) {
                user.setRole(Role.valueOf(roleStr.toUpperCase()));
            }

            return user;
        } catch (Exception e) {
            throw new NotFoundException("Usuário", username);
        }
    }

    public User validateUser(String id, String username) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/{id}", id)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null) {
                throw new NotFoundException("Usuário", id);
            }

            User user = new User();
            user.setId((String) response.get("id"));
            user.setName((String) response.get("name"));
            user.setEmail((String) response.get("email"));
            user.setPassword((String) response.get("password"));
            user.setActive(Boolean.TRUE.equals(response.get("active")));
            user.setVerified(Boolean.TRUE.equals(response.get("verified")));
            user.setImagePathUrl((String) response.get("imagePathUrl"));

            String roleStr = (String) response.get("role");
            if (roleStr != null) {
                user.setRole(Role.valueOf(roleStr.toUpperCase()));
            }

            if (!user.isVerified()) {
                throw new UserNotVerifiedException();
            }
            if (username != null && !Objects.equals(username, user.getUsername())) {
                throw new ForbiddenOperationException();
            }
            return user;
        } catch (Exception e) {
            if (e instanceof UserNotVerifiedException || e instanceof ForbiddenOperationException) {
                throw e;
            }
            throw new NotFoundException("Usuário", id);
        }
    }

    public UserResponseDTO updateSettings(String id, UserSettings settings, String username) {
        validateUser(id, username);

        Map<String, Object> body = new HashMap<>();
        body.put("settings", settings);

        Map<String, Object> response = restClient.put()
                .uri("/api/users/{id}/settings", id)
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        User user = new User();
        user.setId(id);
        user.setEmail(username);
        user.setSettings(settings);
        return new UserResponseDTO(user);
    }

    private void validateEmail(String email) {
        try {
            restClient.get()
                    .uri("/api/users/{id}", email)
                    .retrieve()
                    .toBodilessEntity();
            throw new AlreadyExistsException("Usuário", "email", email);
        } catch (Exception e) {
            // Email does not exist, safe to proceed
        }
    }

    private UserResponseDTO mapToDTO(Map<String, Object> map) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId((String) map.get("id"));
        dto.setName((String) map.get("name"));
        dto.setEmail((String) map.get("email"));
        dto.setImagePathUrl((String) map.get("imagePathUrl"));
        return dto;
    }
}
