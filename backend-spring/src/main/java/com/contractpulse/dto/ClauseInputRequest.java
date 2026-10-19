package com.contractpulse.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ClauseInputRequest {

    @JsonProperty("project_id")
    private String projectId;

    @JsonProperty("document_id")
    private String documentId;

    @JsonProperty("document_name")
    private String documentName;

    @JsonProperty("section_title")
    private String sectionTitle;

    @JsonProperty("clause_text")
    private String clauseText;

    @JsonProperty("page_number")
    private Integer pageNumber;

    public ClauseInputRequest() {}

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getSectionTitle() { return sectionTitle; }
    public void setSectionTitle(String sectionTitle) { this.sectionTitle = sectionTitle; }

    public String getClauseText() { return clauseText; }
    public void setClauseText(String clauseText) { this.clauseText = clauseText; }

    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }
}
