package com.fatec.labify.api.controller;


import com.fatec.labify.api.dto.test.TestResponseDTO;
import com.fatec.labify.api.service.TestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tests")
public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping
    public ResponseEntity<Page<TestResponseDTO>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            Pageable pageable) {
        return ResponseEntity.ok(testService.findAll(search, category, pageable));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(testService.getCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(testService.findById(id));
    }
}
