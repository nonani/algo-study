package com.example.algostudy.web.review;

import com.example.algostudy.domain.review.Review;
import com.example.algostudy.domain.review.ReviewComment;
import com.example.algostudy.service.ReviewService;
import com.example.algostudy.web.review.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 리뷰를 작성합니다
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @RequestHeader(value = "X-USER-ID", required = false) Long userIdHeader,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        // TODO: JWT 인증 구현 후 @AuthenticationPrincipal로 userId 가져오기
        Long reviewerId = (userIdHeader != null) ? userIdHeader : 1L;

        Review review = reviewService.createReview(reviewerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReviewResponse.from(review));
    }

    /**
     * 특정 제출에 대한 리뷰 목록을 조회합니다
     */
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsBySubmission(@PathVariable Long submissionId) {
        List<Review> reviews = reviewService.getReviewsBySubmissionId(submissionId);
        return ResponseEntity.ok(reviews.stream()
                .map(ReviewResponse::from)
                .toList());
    }

    /**
     * 리뷰를 수정합니다
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @RequestHeader(value = "X-USER-ID", required = false) Long userIdHeader,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        // TODO: JWT 인증 구현 후 @AuthenticationPrincipal로 userId 가져오기
        Long reviewerId = (userIdHeader != null) ? userIdHeader : 1L;

        Review review = reviewService.updateReview(id, reviewerId, request);
        return ResponseEntity.ok(ReviewResponse.from(review));
    }

    /**
     * 리뷰를 삭제합니다
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @RequestHeader(value = "X-USER-ID", required = false) Long userIdHeader
    ) {
        // TODO: JWT 인증 구현 후 @AuthenticationPrincipal로 userId 가져오기
        Long reviewerId = (userIdHeader != null) ? userIdHeader : 1L;

        reviewService.deleteReview(id, reviewerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 리뷰에 댓글을 작성합니다
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<ReviewCommentResponse> createComment(
            @PathVariable Long id,
            @RequestHeader(value = "X-USER-ID", required = false) Long userIdHeader,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        // TODO: JWT 인증 구현 후 @AuthenticationPrincipal로 userId 가져오기
        Long userId = (userIdHeader != null) ? userIdHeader : 1L;

        ReviewComment comment = reviewService.createComment(id, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReviewCommentResponse.from(comment));
    }

    /**
     * 리뷰의 댓글 목록을 조회합니다
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<ReviewCommentResponse>> getCommentsByReview(@PathVariable Long id) {
        List<ReviewComment> comments = reviewService.getCommentsByReviewId(id);
        return ResponseEntity.ok(comments.stream()
                .map(ReviewCommentResponse::from)
                .toList());
    }
}
