package com.example.algostudy.web.submission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateSubmissionRequest {

    @NotBlank(message = "Site is required")
    private String site;

    @NotBlank(message = "Problem ID is required")
    private String problemId;

    private String problemTitle;

    private String language;

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Submitted at is required")
    private LocalDateTime submittedAt;
}
