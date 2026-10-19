package com.contractpulse.api;

import static com.contractpulse.api.ApiModels.MilestoneDto;
import static com.contractpulse.api.ApiModels.MilestoneRequest;
import static com.contractpulse.api.ApiModels.ProgressRequest;
import static com.contractpulse.api.ApiModels.ProgressSnapshotDto;
import static com.contractpulse.api.ApiModels.ProjectDto;
import static com.contractpulse.api.ApiModels.ProjectRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectService {
    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final List<String> MILESTONE_STATUSES = List.of("Not started", "In progress", "Complete");

    private final JdbcTemplate jdbc;

    public ProjectService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ProjectDto> getProjects() {
        return jdbc.queryForList("SELECT id FROM projects ORDER BY name")
                .stream()
                .map(row -> getProject((String) row.get("ID")))
                .toList();
    }

    public ProjectDto getProject(String id) {
        Map<String, Object> project = findProjectRow(id);
        List<ProgressSnapshotDto> history = getProgressHistory(id);
        ProgressSnapshotDto latest = history.isEmpty() ? null : history.get(history.size() - 1);
        List<MilestoneDto> milestones = getMilestones(id);
        MilestoneDto nextMilestone = milestones.stream()
                .filter(milestone -> !"Complete".equals(milestone.status()))
                .findFirst()
                .orElse(milestones.isEmpty() ? null : milestones.get(milestones.size() - 1));

        return new ProjectDto(
                id,
                (String) project.get("NAME"),
                (String) project.get("AGENCY"),
                (String) project.get("CONTRACTOR"),
                formatBudget((BigDecimal) project.get("BUDGET_CRORES")),
                latest == null ? 0 : latest.actual(),
                latest == null ? 0 : latest.planned(),
                latest == null ? "" : latest.date(),
                history,
                project.get("BASELINE_FINISH_DATE").toString(),
                project.get("FORECAST_FINISH_DATE").toString(),
                (Integer) project.get("DELAY_RISK"),
                (Integer) project.get("COST_RISK"),
                project.get("DELAY_RISK") != null && project.get("COST_RISK") != null,
                (String) project.get("STATUS"),
                (String) project.get("COLOR"),
                (String) project.get("INITIALS"),
                nextMilestone == null ? "No milestones" : nextMilestone.name(),
                nextMilestone == null ? "—" : LocalDate.parse(nextMilestone.plannedFinishDate()).format(DISPLAY_DATE),
                milestones
        );
    }

    @Transactional
    public ProjectDto createProject(ProjectRequest request) {
        String id = "CP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String initials = initials(request.name());
        jdbc.update("""
                INSERT INTO projects
                    (id, name, agency, contractor, budget_crores, baseline_finish_date,
                     forecast_finish_date, delay_risk, cost_risk, status, color, initials)
                VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, 'Pending risk review', 'gold', ?)
                """,
                id, request.name().trim(), request.agency().trim(), request.contractor().trim(),
                request.budgetCrores(), request.baselineFinishDate(), request.forecastFinishDate(), initials);
        insertMilestone(id, request.milestoneName(), request.milestoneDueDate(), null, null, "Not started");
        upsertProgress(id, new ProgressRequest(LocalDate.now(), request.plannedProgress(), request.progress()));
        return getProject(id);
    }

    @Transactional
    public ProjectDto updateProject(String id, ProjectRequest request) {
        requireProject(id);
        jdbc.update("""
                UPDATE projects SET name = ?, agency = ?, contractor = ?, budget_crores = ?,
                    baseline_finish_date = ?, forecast_finish_date = ?, status = 'Pending risk review',
                    color = 'gold', delay_risk = NULL, cost_risk = NULL, initials = ?
                WHERE id = ?
                """,
                request.name().trim(), request.agency().trim(), request.contractor().trim(),
                request.budgetCrores(), request.baselineFinishDate(), request.forecastFinishDate(),
                initials(request.name()), id);
        List<MilestoneDto> milestones = getMilestones(id);
        MilestoneDto nextMilestone = milestones.stream()
                .filter(milestone -> !"Complete".equals(milestone.status()))
                .findFirst()
                .orElse(milestones.isEmpty() ? null : milestones.get(0));
        if (nextMilestone == null) {
            insertMilestone(id, request.milestoneName(), request.milestoneDueDate(), null, null, "Not started");
        } else {
            jdbc.update("""
                    UPDATE milestones SET name = ?, planned_finish_date = ?
                    WHERE project_id = ? AND id = ?
                    """, request.milestoneName().trim(), request.milestoneDueDate(), id, nextMilestone.id());
        }
        upsertProgress(id, new ProgressRequest(LocalDate.now(), request.plannedProgress(), request.progress()));
        return getProject(id);
    }

    @Transactional
    public void deleteProject(String id) {
        requireProject(id);
        jdbc.update("DELETE FROM projects WHERE id = ?", id);
    }

    public List<ProgressSnapshotDto> getProgressHistory(String projectId) {
        requireProject(projectId);
        return jdbc.query("""
                SELECT id, snapshot_date, planned_progress, actual_progress
                FROM progress_snapshots WHERE project_id = ? ORDER BY snapshot_date
                """,
                (rs, rowNum) -> new ProgressSnapshotDto(
                        Long.toString(rs.getLong("id")),
                        rs.getDate("snapshot_date").toLocalDate().toString(),
                        rs.getInt("planned_progress"),
                        rs.getInt("actual_progress")),
                projectId);
    }

    @Transactional
    public ProjectDto addProgress(String projectId, ProgressRequest request) {
        requireProject(projectId);
        upsertProgress(projectId, request);
        return getProject(projectId);
    }

    @Transactional
    public ProjectDto updateProgress(String projectId, long snapshotId, ProgressRequest request) {
        requireProject(projectId);
        int changed = jdbc.update("""
                UPDATE progress_snapshots SET snapshot_date = ?, planned_progress = ?, actual_progress = ?
                WHERE project_id = ? AND id = ?
                """, request.date(), request.planned(), request.actual(), projectId, snapshotId);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress snapshot not found");
        return getProject(projectId);
    }

    @Transactional
    public ProjectDto deleteProgress(String projectId, long snapshotId) {
        requireProject(projectId);
        int changed = jdbc.update("DELETE FROM progress_snapshots WHERE project_id = ? AND id = ?", projectId, snapshotId);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress snapshot not found");
        return getProject(projectId);
    }

    public List<MilestoneDto> getMilestones(String projectId) {
        return jdbc.query("""
                SELECT id, name, planned_finish_date, forecast_finish_date, actual_finish_date, status
                FROM milestones WHERE project_id = ? ORDER BY planned_finish_date
                """,
                (rs, rowNum) -> new MilestoneDto(
                        rs.getString("id"),
                        rs.getString("name"),
                        rs.getDate("planned_finish_date").toLocalDate().toString(),
                        dateString(rs.getDate("forecast_finish_date")),
                        dateString(rs.getDate("actual_finish_date")),
                        rs.getString("status")),
                projectId);
    }

    @Transactional
    public ProjectDto addMilestone(String projectId, MilestoneRequest request) {
        requireProject(projectId);
        validateMilestoneStatus(request.status());
        insertMilestone(projectId, request.name().trim(), request.plannedFinishDate(),
                request.forecastFinishDate(), request.actualFinishDate(), request.status());
        return getProject(projectId);
    }

    @Transactional
    public ProjectDto updateMilestone(String projectId, String milestoneId, MilestoneRequest request) {
        requireProject(projectId);
        validateMilestoneStatus(request.status());
        int changed = jdbc.update("""
                UPDATE milestones SET name = ?, planned_finish_date = ?, forecast_finish_date = ?,
                    actual_finish_date = ?, status = ?
                WHERE project_id = ? AND id = ?
                """, request.name().trim(), request.plannedFinishDate(), request.forecastFinishDate(),
                request.actualFinishDate(), request.status(), projectId, milestoneId);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Milestone not found");
        return getProject(projectId);
    }

    @Transactional
    public ProjectDto deleteMilestone(String projectId, String milestoneId) {
        requireProject(projectId);
        int changed = jdbc.update("DELETE FROM milestones WHERE project_id = ? AND id = ?", projectId, milestoneId);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Milestone not found");
        return getProject(projectId);
    }

    private void upsertProgress(String projectId, ProgressRequest request) {
        List<Long> existing = jdbc.query("""
                SELECT id FROM progress_snapshots WHERE project_id = ? AND snapshot_date = ?
                """, (rs, rowNum) -> rs.getLong("id"), projectId, request.date());
        if (existing.isEmpty()) {
            jdbc.update("""
                    INSERT INTO progress_snapshots (project_id, snapshot_date, planned_progress, actual_progress)
                    VALUES (?, ?, ?, ?)
                    """, projectId, request.date(), request.planned(), request.actual());
        } else {
            jdbc.update("""
                    UPDATE progress_snapshots SET planned_progress = ?, actual_progress = ?
                    WHERE id = ?
                    """, request.planned(), request.actual(), existing.get(0));
        }
    }

    private void insertMilestone(
            String projectId,
            String name,
            LocalDate plannedFinishDate,
            LocalDate forecastFinishDate,
            LocalDate actualFinishDate,
            String status
    ) {
        String id = projectId + "-M-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        jdbc.update("""
                INSERT INTO milestones
                    (id, project_id, name, planned_finish_date, forecast_finish_date, actual_finish_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, id, projectId, name, plannedFinishDate, forecastFinishDate, actualFinishDate, status);
    }

    private Map<String, Object> findProjectRow(String id) {
        try {
            return jdbc.queryForMap("SELECT * FROM projects WHERE id = ?", id);
        } catch (org.springframework.dao.EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }
    }

    private void requireProject(String id) {
        findProjectRow(id);
    }

    private static void validateMilestoneStatus(String status) {
        if (!MILESTONE_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be Not started, In progress, or Complete");
        }
    }

    private static String formatBudget(BigDecimal amount) {
        return "₹" + amount.stripTrailingZeros().toPlainString() + " Cr";
    }

    private static String dateString(java.sql.Date date) {
        return date == null ? null : date.toLocalDate().toString();
    }

    private static String initials(String name) {
        return java.util.Arrays.stream(name.trim().split("\\s+"))
                .limit(2)
                .map(part -> part.substring(0, 1).toUpperCase())
                .reduce("", String::concat);
    }
}
