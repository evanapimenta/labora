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
@Table(name = "tests")
public class Test {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private TestCategory category;

    private boolean sexSpecific;

    private String sampleType;

    private String estimatedResultTime;

    private String preparationInstructions;

    private boolean isActive;

    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Test(String name, String description, TestCategory category, boolean sexSpecific, String sampleType,
                String estimatedResultTime, String preparationInstructions) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.sexSpecific = sexSpecific;
        this.sampleType = sampleType;
        this.estimatedResultTime = estimatedResultTime;
        this.preparationInstructions = preparationInstructions;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }

    public void deactivate() {
        this.isActive = false;
    }

}
