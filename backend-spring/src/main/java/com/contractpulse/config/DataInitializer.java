package com.contractpulse.config;

import com.contractpulse.model.ContractClause;
import com.contractpulse.model.DocumentMetadata;
import com.contractpulse.repository.ContractClauseRepository;
import com.contractpulse.repository.DocumentMetadataRepository;
import com.contractpulse.service.EmbeddingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final ContractClauseRepository clauseRepository;
    private final DocumentMetadataRepository metadataRepository;
    private final EmbeddingService embeddingService;

    public DataInitializer(JdbcTemplate jdbcTemplate,
                           ContractClauseRepository clauseRepository,
                           DocumentMetadataRepository metadataRepository,
                           EmbeddingService embeddingService) {
        this.jdbcTemplate = jdbcTemplate;
        this.clauseRepository = clauseRepository;
        this.metadataRepository = metadataRepository;
        this.embeddingService = embeddingService;
    }

    @Override
    public void run(String... args) {
        try {
            // 1. Enable pgvector extension
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
            System.out.println("[DataInitializer] pgvector extension verified in PostgreSQL.");
        } catch (Exception e) {
            System.err.println("[DataInitializer] Notice on pgvector extension: " + e.getMessage());
        }

        // 2. Seed contract clauses if empty
        try {
            if (clauseRepository.count() == 0) {
                System.out.println("[DataInitializer] Seeding contract clauses into pgvector...");
                seedClauses();
                System.out.println("[DataInitializer] Successfully seeded clauses.");
            }

            if (metadataRepository.count() == 0) {
                seedMetadata();
            }
        } catch (Exception e) {
            System.err.println("[DataInitializer] Seeding deferred: " + e.getMessage());
        }
    }

    private void seedClauses() {
        // CP-2048: East River Flood Barrier
        saveClause("CP-2048", "DOC-ERFB-001", "East River Barrier - General Contract Agreement.pdf",
                "Section 14.2: Environmental Permits & Stop-Work Liability", 42,
                "Foundation construction in the East River intertidal zone shall not proceed without active NYS DEC Article 15 and USACE Section 10 permits. Should environmental review exceed baseline schedule by >15 calendar days, the contractor is entitled to milestone rescheduling without liquidated damages, provided notice was served within 5 business days.");

        saveClause("CP-2048", "DOC-ERFB-002", "East River Barrier - Subcontractor Staffing Plan.pdf",
                "Section 8.4: Subcontractor Capacity & Piling Crew Quotas", 19,
                "The prime contractor shall continuously maintain at least two qualified specialty marine piling crews on-site during Phase 1. Any specialist staffing deficit persisting beyond 5 working days triggers liquidated damages of $12,500 per calendar day.");

        saveClause("CP-2048", "DOC-ERFB-003", "East River Barrier - Weather Protocols.pdf",
                "Section 19.1: Weather Exposure & Tidal Window Protocols", 57,
                "Seasonal rainfall exceeding 1.5 inches per 24 hours or severe tidal surge conditions shall permit suspension of foundation pouring, provided the barrier shoring has been secured and documented in the weekly field report.");

        // CP-1932: I-405 Sound Wall Expansion
        saveClause("CP-1932", "DOC-I405-001", "I-405 Sound Wall - Material Procurement Specifications.pdf",
                "Section 6.3: Material Cost Escalation & Steel Price Index", 31,
                "Precast acoustic panels and structural steel pricing are anchored to the ENR Construction Cost Index. When raw acoustic material prices deviate by >8% from the bid date baseline, cost variance shall be shared under the 60/40 owner-contractor formula.");

        saveClause("CP-1932", "DOC-I405-002", "I-405 Sound Wall - Corridor Work Schedules.pdf",
                "Section 11.2: Highway Corridor Traffic Night Windows", 23,
                "North corridor sound wall installation and paving must strictly occur between 21:00 and 05:00 hours. Unscheduled lane closures will incur a non-refundable delay penalty of $5,000 per 15-minute increment.");

        // CP-1876: Civic Center Modernization
        saveClause("CP-1876", "DOC-CCM-001", "Civic Center - Building Systems Technical Standards.pdf",
                "Section 22.1: Systems Commissioning & LEED Compliance", 78,
                "HVAC, electrical telemetry, and emergency life safety systems must complete continuous 72-hour operational testing prior to certificate of occupancy and system commissioning milestone sign-off.");

        // CP-1764: South County Water Main
        saveClause("CP-1764", "DOC-SCWM-001", "South County Water Main - Pipeline Engineering Specs.pdf",
                "Section 7.5: Hydrostatic Pressure Testing Protocols", 45,
                "The 48-inch ductile iron water main must sustain 4-hour hydrostatic pressure testing at 150 psi. Allowable leakage cannot exceed 0.25 gal/hr/mile of pipe. Any burst or failure requires immediate repair and complete re-test cycle.");

        saveClause("CP-1764", "DOC-SCWM-002", "South County Water Main - Financial Terms.pdf",
                "Section 15.3: Budget Burn Rate & Monthly Allocation Caps", 12,
                "Monthly contractor expenditure exceeding 115% of the projected progress schedule baseline requires formal justification and public works engineering audit before subsequent disbursement release.");
    }

    private void saveClause(String projectId, String docId, String docName, String section, int page, String text) {
        String embedding = embeddingService.getEmbeddingVectorString(section + " " + text);
        ContractClause clause = new ContractClause(projectId, docId, docName, section, text, page, embedding);
        clauseRepository.save(clause);
    }

    private void seedMetadata() {
        metadataRepository.save(new DocumentMetadata("DOC-ERFB-001", "East River Barrier - General Contract Agreement.pdf", "CP-2048", "application/pdf", 4404019L, "minio://contracts/DOC-ERFB-001.pdf", 42, "Jordan Mitchell"));
        metadataRepository.save(new DocumentMetadata("DOC-ERFB-002", "East River Barrier - Subcontractor Staffing Plan.pdf", "CP-2048", "application/pdf", 1887436L, "minio://contracts/DOC-ERFB-002.pdf", 19, "Jordan Mitchell"));
        metadataRepository.save(new DocumentMetadata("DOC-I405-001", "I-405 Sound Wall - Material Procurement Specifications.pdf", "CP-1932", "application/pdf", 3250585L, "minio://contracts/DOC-I405-001.pdf", 31, "Jordan Mitchell"));
        metadataRepository.save(new DocumentMetadata("DOC-CCM-001", "Civic Center - Building Systems Technical Standards.pdf", "CP-1876", "application/pdf", 5872025L, "minio://contracts/DOC-CCM-001.pdf", 78, "Jordan Mitchell"));
        metadataRepository.save(new DocumentMetadata("DOC-SCWM-001", "South County Water Main - Pipeline Engineering Specs.pdf", "CP-1764", "application/pdf", 3040870L, "minio://contracts/DOC-SCWM-001.pdf", 45, "Jordan Mitchell"));
    }
}
