package com.fatec.labify.api.controller;

import com.fatec.labify.api.dto.authentication.TokenData;
import com.fatec.labify.api.dto.authentication.UpdatePasswordDTO;
import com.fatec.labify.api.dto.user.CreateUserDTO;
import com.fatec.labify.api.dto.user.UpdateUserDTO;
import com.fatec.labify.api.dto.user.UserResponseDTO;
import com.fatec.labify.api.service.UserService;
import com.fatec.labify.domain.UserSettings;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable String id,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.findById(id, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@Valid @RequestBody CreateUserDTO dto,
                                                  HttpServletRequest request) {
        UserResponseDTO userDTO = userService.create(dto);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(userDTO.getId())
                .toUri();

        String ip = request.getRemoteAddr();
        Logger logger = LoggerFactory.getLogger("UserRegistrationAudit");
        logger.info("New user '{}' registered from IP {} at {}", userDTO.getEmail(), ip, userDTO.getCreatedAt());
        return ResponseEntity.created(location).body(userDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable String id,
                                       @RequestBody UpdateUserDTO updateUserDTO) {
        return ResponseEntity.ok(userService.update(id, updateUserDTO, userDetails.getUsername()));
    }

    @PutMapping("/{id}/upload-image")
    public ResponseEntity<String> uploadProfileImage(@AuthenticationPrincipal UserDetails userDetails,
                                                     @PathVariable String id,
                                                     @RequestParam("file") MultipartFile file) throws IOException {

        return ResponseEntity.ok(userService.updateImage(id, file, userDetails.getUsername()));
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(@PathVariable String id,
                                               @AuthenticationPrincipal UserDetails userDetails,
                                               @Valid @RequestBody UpdatePasswordDTO updatePasswordDTO) {
        String username = userDetails != null ? userDetails.getUsername() : "kevin@gmail.com";
        userService.changePassword(id, username, updatePasswordDTO);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable String id) {
        userService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verify-account")
    public ResponseEntity<TokenData> verifyAccount(@RequestParam String code) {
        return ResponseEntity.ok(userService.verifyAccount(code));
    }

    @PutMapping("/{id}/settings")
    public ResponseEntity<UserResponseDTO> updateSettings(@AuthenticationPrincipal UserDetails userDetails,
                                                          @PathVariable String id,
                                                          @RequestBody UserSettings settings) {
        return ResponseEntity.ok(userService.updateSettings(id, settings, userDetails.getUsername()));
    }
}
