package com.contractpulse.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DocumentUploadResponse {

    @JsonProperty("document_id")
    private String documentId;

    @JsonProperty("document_name")
    private String documentName;

    @JsonProperty("project_id")
    private String projectId;

    @JsonProperty("clause_count")
    private Integer clauseCount;

    @JsonProperty("file_size")
    private Long fileSize;

    @JsonProperty("storage_url")
    private String storageUrl;

    @JsonProperty("message")
    private String message;

    public DocumentUploadResponse() {}

    public DocumentUploadResponse(String documentId, String documentName, String projectId,
                                  Integer clauseCount, Long fileSize, String storageUrl, String message) {
        this.documentId = documentId;
        this.documentName = documentName;
        this.projectId = projectId;
        this.clauseCount = clauseCount;
        this.fileSize = fileSize;
        this.storageUrl = storageUrl;
        this.message = message;
    }

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public Integer getClauseCount() { return clauseCount; }
    public void setClauseCount(Integer clauseCount) { this.clauseCount = clauseCount; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getStorageUrl() { return storageUrl; }
    public void setStorageUrl(String storageUrl) { this.storageUrl = storageUrl; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
