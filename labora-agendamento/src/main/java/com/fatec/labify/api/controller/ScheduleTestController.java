package com.fatec.labify.api.controller;

import com.fatec.labify.api.dto.test.RescheduleTestDTO;
import com.fatec.labify.api.dto.test.ScheduleTestDTO;
import com.fatec.labify.api.dto.test.ScheduledTestResponseDTO;
import com.fatec.labify.api.service.ScheduleTestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedule")
public class ScheduleTestController {
    private final ScheduleTestService scheduleTestService;

    public ScheduleTestController(ScheduleTestService scheduleTestService) {
        this.scheduleTestService = scheduleTestService;
    }

    @PostMapping
    public ResponseEntity<List<ScheduledTestResponseDTO>> scheduleTests(@AuthenticationPrincipal UserDetails userDetails,
                                                                        @RequestBody List<ScheduleTestDTO> scheduleTest) {
        return ResponseEntity.ok(scheduleTestService.scheduleTests(scheduleTest, userDetails.getUsername()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ScheduledTestResponseDTO>> getScheduledTests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(scheduleTestService.findAllScheduledTests(userDetails.getUsername()));
    }

    @GetMapping("/me/completed")
    public ResponseEntity<List<ScheduledTestResponseDTO>> findCompletedTests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(scheduleTestService.findAllCompletedTests(userDetails.getUsername()));
    }

    @GetMapping("/me/all")
    public ResponseEntity<List<ScheduledTestResponseDTO>> getAllTests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(scheduleTestService.findAllTests(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<ScheduledTestResponseDTO>> getScheduledTestsByBranchId(@AuthenticationPrincipal UserDetails userDetails,
                                                                                      @PathVariable String id) {
        return ResponseEntity.ok(scheduleTestService.findScheduledTestsByBranchId(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduledTestResponseDTO> rescheduleTest(@AuthenticationPrincipal UserDetails userDetails,
                                                                   @RequestBody RescheduleTestDTO dto,
                                                                   @PathVariable String id) {
        return ResponseEntity.ok(scheduleTestService.reschedule(dto, id, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelTest(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable String id) {
        scheduleTestService.cancelTest(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
