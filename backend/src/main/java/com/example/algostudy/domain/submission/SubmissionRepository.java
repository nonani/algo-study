package com.example.algostudy.domain.submission;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId);

    Page<Submission> findAllByOrderBySubmittedAtDesc(Pageable pageable);

    List<Submission> findBySiteAndProblemIdOrderBySubmittedAtDesc(String site, String problemId);

    @Query("SELECT s FROM Submission s WHERE s.user.id IN :userIds ORDER BY s.submittedAt DESC")
    Page<Submission> findByUserIdsOrderBySubmittedAtDesc(@Param("userIds") List<Long> userIds, Pageable pageable);
}
