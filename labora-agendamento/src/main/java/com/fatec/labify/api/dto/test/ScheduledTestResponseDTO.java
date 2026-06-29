package com.fatec.labify.api.dto.test;

import com.fatec.labify.api.dto.patient.AddressDTO;
import com.fatec.labify.domain.ScheduledTest;
import com.fatec.labify.domain.TestStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ScheduledTestResponseDTO {

    private String id;

    private String testName;

    private String patientName;

    private LocalDateTime scheduledFor;

    private LocalDateTime scheduledAt;

    private String branchName;

    private AddressDTO branchAddress;

    private TestStatus status;

    private String resultUrl;

    private String preparationInstructions;

    public ScheduledTestResponseDTO(ScheduledTest scheduledTest) {
        this.id = scheduledTest.getId();
        this.testName = scheduledTest.getTest().getName();
        this.patientName = scheduledTest.getPatient().getUser().getName();
        this.scheduledFor = scheduledTest.getScheduledFor();
        this.scheduledAt = scheduledTest.getScheduledAt();
        this.branchName = scheduledTest.getBranch().getName();
        this.branchAddress = scheduledTest.getBranch().getAddress() != null
                ? new AddressDTO(scheduledTest.getBranch().getAddress())
                : null;
        this.status = scheduledTest.getStatus();
        this.resultUrl = scheduledTest.getResultUrl();
        this.preparationInstructions = scheduledTest.getTest().getPreparationInstructions();
    }

}