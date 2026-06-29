package com.fatec.labify.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "scheduled_tests")
public class ScheduledTest {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private TestStatus status;

    private LocalDateTime scheduledAt;

    private LocalDateTime scheduledFor;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    private String resultUrl;

    private LocalDateTime resultReadyAt;

    private LocalDateTime completedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public ScheduledTest(String id, Test test, Patient patient, TestStatus status, Branch branch, LocalDateTime scheduledFor) {
        this.id = id;
        this.test = test;
        this.patient = patient;
        this.status = status;
        this.scheduledAt = LocalDateTime.now();
        this.branch = branch;
        this.scheduledFor = scheduledFor;
    }

}
