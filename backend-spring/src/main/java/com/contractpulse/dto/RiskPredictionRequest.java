package com.contractpulse.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RiskPredictionRequest {

    @JsonProperty("project_id")
    private String projectId;

    @JsonProperty("risk_type")
    private String riskType;

    @JsonProperty("factor_title")
    private String factorTitle;

    @JsonProperty("risk_description")
    private String riskDescription;

    @JsonProperty("risk_score")
    private Double riskScore;

    public RiskPredictionRequest() {}

    public RiskPredictionRequest(String projectId, String riskType, String factorTitle,
                                 String riskDescription, Double riskScore) {
        this.projectId = projectId;
        this.riskType = riskType;
        this.factorTitle = factorTitle;
        this.riskDescription = riskDescription;
        this.riskScore = riskScore;
    }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getRiskType() { return riskType; }
    public void setRiskType(String riskType) { this.riskType = riskType; }

    public String getFactorTitle() { return factorTitle; }
    public void setFactorTitle(String factorTitle) { this.factorTitle = factorTitle; }

    public String getRiskDescription() { return riskDescription; }
    public void setRiskDescription(String riskDescription) { this.riskDescription = riskDescription; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }
}
