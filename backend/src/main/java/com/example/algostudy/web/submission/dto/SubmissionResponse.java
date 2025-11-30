package com.example.algostudy.web.submission.dto;

import com.example.algostudy.domain.submission.Submission;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SubmissionResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String site;
    private String problemId;
    private String problemTitle;
    private String language;
    private String code;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;

    public static SubmissionResponse from(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .userId(submission.getUser() != null ? submission.getUser().getId() : null)
                .userName(submission.getUser() != null ? submission.getUser().getName() : null)
                .site(submission.getSite())
                .problemId(submission.getProblemId())
                .problemTitle(submission.getProblemTitle())
                .language(submission.getLanguage())
                .code(submission.getCode())
                .status(submission.getStatus())
                .submittedAt(submission.getSubmittedAt())
                .createdAt(submission.getCreatedAt())
                .build();
    }

    public static SubmissionResponse fromWithoutCode(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .userId(submission.getUser() != null ? submission.getUser().getId() : null)
                .userName(submission.getUser() != null ? submission.getUser().getName() : null)
                .site(submission.getSite())
                .problemId(submission.getProblemId())
                .problemTitle(submission.getProblemTitle())
                .language(submission.getLanguage())
                .status(submission.getStatus())
                .submittedAt(submission.getSubmittedAt())
                .createdAt(submission.getCreatedAt())
                .build();
    }
}
