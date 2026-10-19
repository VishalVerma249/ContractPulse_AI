INSERT INTO projects (id, name, agency, contractor, budget_crores, baseline_finish_date, forecast_finish_date, delay_risk, cost_risk, status, color, initials) VALUES
('CP-2048', 'East River Flood Barrier', 'New York City DOT', 'Granite Construction', 18.46, '2027-03-31', '2027-04-21', 78, 64, 'Action needed', 'coral', 'ER'),
('CP-1932', 'I-405 Sound Wall Expansion', 'Washington State DOT', 'Kiewit Infrastructure', 9.23, '2027-04-30', '2027-05-05', 56, 38, 'Watch closely', 'gold', 'I4'),
('CP-1876', 'Civic Center Modernization', 'City of San Francisco', 'Turner Construction', 6.78, '2026-12-15', '2026-12-15', 22, 19, 'On track', 'green', 'CC'),
('CP-1764', 'South County Water Main', 'King County Public Works', 'Michels Corporation', 3.81, '2027-02-28', '2027-03-14', 34, 47, 'Watch closely', 'gold', 'SW');

INSERT INTO milestones (id, project_id, name, planned_finish_date, forecast_finish_date, actual_finish_date, status) VALUES
('CP-2048-M1', 'CP-2048', 'Utility relocation', '2026-09-20', '2026-09-26', '2026-09-26', 'Complete'),
('CP-2048-M2', 'CP-2048', 'Foundation completion', '2026-10-18', '2026-11-10', NULL, 'In progress'),
('CP-2048-M3', 'CP-2048', 'Flood gate installation', '2027-01-15', '2027-01-22', NULL, 'Not started'),
('CP-1932-M1', 'CP-1932', 'North corridor paving', '2026-11-02', '2026-11-09', NULL, 'In progress'),
('CP-1932-M2', 'CP-1932', 'Noise barrier inspection', '2027-02-14', '2027-02-14', NULL, 'Not started'),
('CP-1876-M1', 'CP-1876', 'Systems commissioning', '2026-10-29', '2026-10-27', NULL, 'In progress'),
('CP-1876-M2', 'CP-1876', 'Final occupancy review', '2026-12-15', '2026-12-15', NULL, 'Not started'),
('CP-1764-M1', 'CP-1764', 'Pressure testing', '2026-12-11', '2026-12-18', NULL, 'Not started'),
('CP-1764-M2', 'CP-1764', 'Restoration and closeout', '2027-02-28', '2027-03-14', NULL, 'Not started');

INSERT INTO progress_snapshots (project_id, snapshot_date, planned_progress, actual_progress) VALUES
('CP-2048', '2026-04-02', 32, 32), ('CP-2048', '2026-05-02', 40, 39), ('CP-2048', '2026-06-02', 48, 45), ('CP-2048', '2026-07-02', 56, 51), ('CP-2048', '2026-08-02', 64, 58), ('CP-2048', '2026-09-02', 72, 65), ('CP-2048', '2026-10-02', 70, 62),
('CP-1932', '2026-10-02', 50, 44),
('CP-1876', '2026-10-02', 78, 81),
('CP-1764', '2026-10-02', 42, 36);
