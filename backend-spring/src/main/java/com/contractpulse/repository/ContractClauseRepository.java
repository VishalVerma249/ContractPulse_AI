package com.contractpulse.repository;

import com.contractpulse.model.ContractClause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractClauseRepository extends JpaRepository<ContractClause, Long> {

    List<ContractClause> findByProjectId(String projectId);

    List<ContractClause> findByDocumentId(String documentId);

    @Query(value = "SELECT * FROM contract_clauses c WHERE (:projectId IS NULL OR c.project_id = :projectId) ORDER BY c.embedding <=> cast(:embedding as vector) ASC LIMIT :limit", nativeQuery = true)
    List<ContractClause> findNearestClauses(@Param("projectId") String projectId, @Param("embedding") String embedding, @Param("limit") int limit);

    @Query(value = "SELECT * FROM contract_clauses c ORDER BY c.embedding <=> cast(:embedding as vector) ASC LIMIT :limit", nativeQuery = true)
    List<ContractClause> findNearestClausesGlobal(@Param("embedding") String embedding, @Param("limit") int limit);

    @Query(value = "SELECT c.id as clause_id, (1.0 - (c.embedding <=> cast(:embedding as vector))) as similarity FROM contract_clauses c WHERE c.id = :clauseId", nativeQuery = true)
    Double calculateCosineSimilarity(@Param("clauseId") Long clauseId, @Param("embedding") String embedding);
}
