package com.fatec.labify.api.controller;

import com.fatec.labify.api.dto.branch.BranchResponseDTO;
import com.fatec.labify.api.service.BranchService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/branches")
public class BranchController {
    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping("/{labId}")
    public ResponseEntity<Page<BranchResponseDTO>> findAll(@AuthenticationPrincipal UserDetails userDetails,
                                                           @PathVariable String labId,
                                                           @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(branchService.findByLabId(userDetails.getUsername(), labId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchResponseDTO> findById(@AuthenticationPrincipal UserDetails userDetails,
                                                       @PathVariable String id) {
        return ResponseEntity.ok(branchService.findById(userDetails.getUsername(), id));
    }

    @GetMapping("/by-area")
    public ResponseEntity<Page<BranchResponseDTO>> findByArea(@AuthenticationPrincipal UserDetails userDetails,
                                                              @RequestParam double lat,
                                                              @RequestParam double lon,
                                                              @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(branchService.getClosestBranches(userDetails.getUsername(), lat, lon, limit));
    }
}
