package com.fatec.labify.api.controller;

import com.fatec.labify.api.dto.laboratory.LaboratoryResponseDTO;
import com.fatec.labify.api.service.LaboratoryService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/labs")
public class LaboratoryController {
    private final LaboratoryService laboratoryService;

    public LaboratoryController(LaboratoryService laboratoryService) {
        this.laboratoryService = laboratoryService;
    }

    @GetMapping
    public ResponseEntity<Page<LaboratoryResponseDTO>> findAll(@ParameterObject Pageable pageable) {
        return ResponseEntity.ok(laboratoryService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LaboratoryResponseDTO> findById(@AuthenticationPrincipal UserDetails userDetails,
                                                          @PathVariable String id) {
        return ResponseEntity.ok(laboratoryService.findById(id, userDetails.getUsername()));
    }
}
