package com.example.algostudy.web.review.dto;

import com.example.algostudy.domain.review.ReviewComment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewCommentResponse {

    private Long id;
    private Long reviewId;
    private Long userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;

    public static ReviewCommentResponse from(ReviewComment comment) {
        return ReviewCommentResponse.builder()
                .id(comment.getId())
                .reviewId(comment.getReview() != null ? comment.getReview().getId() : null)
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .userName(comment.getUser() != null ? comment.getUser().getName() : null)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
