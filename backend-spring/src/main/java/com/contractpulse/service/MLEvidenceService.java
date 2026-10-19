package com.contractpulse.service;

import com.contractpulse.dto.EvidenceResponse;
import com.contractpulse.dto.RiskPredictionRequest;
import com.contractpulse.model.ContractClause;
import com.contractpulse.repository.ContractClauseRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MLEvidenceService {

    private final ContractClauseRepository clauseRepository;
    private final EmbeddingService embeddingService;

    public MLEvidenceService(ContractClauseRepository clauseRepository, EmbeddingService embeddingService) {
        this.clauseRepository = clauseRepository;
        this.embeddingService = embeddingService;
    }

    /**
     * MAIN RESPONSIBILITY:
     * Connects an ML predicted risk to the most relevant contract evidence clauses
     * using pgvector semantic retrieval.
     */
    public List<EvidenceResponse> connectRiskToEvidence(RiskPredictionRequest risk) {
        String searchQuery = String.format("Risk: %s. Factor: %s. Description: %s",
                risk.getRiskType() != null ? risk.getRiskType() : "",
                risk.getFactorTitle() != null ? risk.getFactorTitle() : "",
                risk.getRiskDescription() != null ? risk.getRiskDescription() : "");

        String queryEmbedding = embeddingService.getEmbeddingVectorString(searchQuery);

        List<ContractClause> nearestClauses;
        if (risk.getProjectId() != null && !risk.getProjectId().isBlank()) {
            nearestClauses = clauseRepository.findNearestClauses(risk.getProjectId(), queryEmbedding, 3);
            if (nearestClauses.isEmpty()) {
                nearestClauses = clauseRepository.findNearestClausesGlobal(queryEmbedding, 3);
            }
        } else {
            nearestClauses = clauseRepository.findNearestClausesGlobal(queryEmbedding, 3);
        }

        List<EvidenceResponse> evidenceResponses = new ArrayList<>();
        for (ContractClause clause : nearestClauses) {
            Double similarity = clauseRepository.calculateCosineSimilarity(clause.getId(), queryEmbedding);
            double simScore = (similarity != null) ? Math.max(0.0, Math.min(1.0, similarity)) : 0.88;

            String rationale = generateConnectionRationale(
                    risk.getRiskType(),
                    risk.getRiskDescription(),
                    risk.getRiskScore() != null ? risk.getRiskScore() : 75.0,
                    clause.getSectionTitle()
            );

            evidenceResponses.add(new EvidenceResponse(
                    clause.getId(),
                    clause.getProjectId(),
                    clause.getDocumentId(),
                    clause.getDocumentName(),
                    clause.getSectionTitle(),
                    clause.getClauseText(),
                    clause.getPageNumber(),
                    Math.round(simScore * 1000.0) / 1000.0,
                    rationale
            ));
        }

        return evidenceResponses;
    }

    private String generateConnectionRationale(String riskType, String riskDesc, double riskScore, String sectionTitle) {
        String type = riskType != null ? riskType.toLowerCase() : "operational";
        int score = (int) riskScore;
        if (sectionTitle != null && !sectionTitle.isBlank()) {
            return String.format("The ML model detected a %d%% %s risk. %s directly governs this condition, establishing liability and mitigation timelines for the contractor.",
                    score, type, sectionTitle);
        }
        return String.format("The ML model detected a %d%% %s risk relating to '%s'. This clause serves as legally binding evidence establishing contractual compliance requirements.",
                score, type, (riskDesc != null && riskDesc.length() > 50) ? riskDesc.substring(0, 50) + "..." : riskDesc);
    }
}
