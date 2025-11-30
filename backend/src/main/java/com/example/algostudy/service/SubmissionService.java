package com.example.algostudy.service;

import com.example.algostudy.domain.submission.Submission;
import com.example.algostudy.domain.submission.SubmissionRepository;
import com.example.algostudy.domain.user.User;
import com.example.algostudy.domain.user.UserRepository;
import com.example.algostudy.web.submission.dto.CreateSubmissionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    @Transactional
    public Submission createSubmission(Long userId, CreateSubmissionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        LocalDateTime submittedAt = request.getSubmittedAt() != null
                ? request.getSubmittedAt()
                : LocalDateTime.now();

        Submission submission = Submission.builder()
                .user(user)
                .site(request.getSite())
                .problemId(request.getProblemId())
                .problemTitle(request.getProblemTitle())
                .language(request.getLanguage())
                .code(request.getCode())
                .status(request.getStatus() != null ? request.getStatus() : "AC")
                .submittedAt(submittedAt)
                .build();

        return submissionRepository.save(submission);
    }

    public Page<Submission> getRecentSubmissions(Pageable pageable) {
        return submissionRepository.findAllByOrderBySubmittedAtDesc(pageable);
    }

    public Submission getSubmissionById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + id));
    }

    public List<Submission> getSubmissionsByUserId(Long userId) {
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }

    public List<Submission> getSubmissionsByProblem(String site, String problemId) {
        return submissionRepository.findBySiteAndProblemIdOrderBySubmittedAtDesc(site, problemId);
    }

    public Page<Submission> getSubmissionsByUserIds(List<Long> userIds, Pageable pageable) {
        return submissionRepository.findByUserIdsOrderBySubmittedAtDesc(userIds, pageable);
    }
}
