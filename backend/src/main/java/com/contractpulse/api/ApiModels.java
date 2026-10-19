package com.contractpulse.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class ApiModels {
    private ApiModels() {}

    public record ProgressSnapshotDto(
            String id,
            String date,
            int planned,
            int actual
    ) {}

    public record MilestoneDto(
            String id,
            String name,
            String plannedFinishDate,
            String forecastFinishDate,
            String actualFinishDate,
            String status
    ) {}

    public record ProjectDto(
            String id,
            String name,
            String agency,
            String contractor,
            String budget,
            int progress,
            int plannedProgress,
            String progressAsOfDate,
            List<ProgressSnapshotDto> progressHistory,
            String baselineFinishDate,
            String forecastFinishDate,
            Integer delayRisk,
            Integer costRisk,
            boolean riskScoresAvailable,
            String status,
            String color,
            String initials,
            String milestone,
            String due,
            List<MilestoneDto> milestones
    ) {}

    public record ProjectRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Size(max = 120) String agency,
            @NotBlank @Size(max = 120) String contractor,
            @NotNull @DecimalMin("0.0") BigDecimal budgetCrores,
            @NotNull @Min(0) @Max(100) Integer progress,
            @NotNull @Min(0) @Max(100) Integer plannedProgress,
            @NotNull LocalDate baselineFinishDate,
            @NotNull LocalDate forecastFinishDate,
            @NotBlank @Size(max = 120) String milestoneName,
            @NotNull LocalDate milestoneDueDate
    ) {}

    public record ProgressRequest(
            @NotNull LocalDate date,
            @NotNull @Min(0) @Max(100) Integer planned,
            @NotNull @Min(0) @Max(100) Integer actual
    ) {}

    public record MilestoneRequest(
            @NotBlank @Size(max = 120) String name,
            @NotNull LocalDate plannedFinishDate,
            LocalDate forecastFinishDate,
            LocalDate actualFinishDate,
            @NotBlank String status
    ) {}

    public record ApiError(String message) {}
}
