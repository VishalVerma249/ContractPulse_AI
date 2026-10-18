package com.contractpulse.controller;

import com.contractpulse.dto.EvidenceResponse;
import com.contractpulse.dto.RiskPredictionRequest;
import com.contractpulse.service.MLEvidenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MLEvidenceController {

    private final MLEvidenceService mlEvidenceService;

    public MLEvidenceController(MLEvidenceService mlEvidenceService) {
        this.mlEvidenceService = mlEvidenceService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "ContractPulse AI Spring Boot Backend");
        status.put("rag_engine", "PostgreSQL + pgvector (1536-dim)");
        status.put("version", "1.0.0");
        return ResponseEntity.ok(status);
    }

    /**
     * MAIN ENDPOINT FOR ML CONNECTION:
     * Receives ML predicted risk parameters and returns connected contract evidence clauses.
     */
    @PostMapping("/ml/connect-evidence")
    public ResponseEntity<List<EvidenceResponse>> connectRiskToEvidence(@RequestBody RiskPredictionRequest request) {
        List<EvidenceResponse> evidence = mlEvidenceService.connectRiskToEvidence(request);
        return ResponseEntity.ok(evidence);
    }
}
