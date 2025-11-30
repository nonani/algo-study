package com.example.algostudy.domain.studygroup;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyMemberRepository extends JpaRepository<StudyMember, Long> {
    List<StudyMember> findByStudyGroupId(Long studyGroupId);
    List<StudyMember> findByUserId(Long userId);
    Optional<StudyMember> findByStudyGroupIdAndUserId(Long studyGroupId, Long userId);
    boolean existsByStudyGroupIdAndUserId(Long studyGroupId, Long userId);
}
