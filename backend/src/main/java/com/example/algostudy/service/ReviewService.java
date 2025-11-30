package com.example.algostudy.service;

import com.example.algostudy.domain.review.Review;
import com.example.algostudy.domain.review.ReviewComment;
import com.example.algostudy.domain.review.ReviewCommentRepository;
import com.example.algostudy.domain.review.ReviewRepository;
import com.example.algostudy.domain.submission.Submission;
import com.example.algostudy.domain.submission.SubmissionRepository;
import com.example.algostudy.domain.user.User;
import com.example.algostudy.domain.user.UserRepository;
import com.example.algostudy.web.review.dto.CreateCommentRequest;
import com.example.algostudy.web.review.dto.CreateReviewRequest;
import com.example.algostudy.web.review.dto.UpdateReviewRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    @Transactional
    public Review createReview(Long reviewerId, CreateReviewRequest request) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + reviewerId));

        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + request.getSubmissionId()));

        Review review = Review.builder()
                .submission(submission)
                .reviewer(reviewer)
                .content(request.getContent())
                .rating(request.getRating())
                .build();

        return reviewRepository.save(review);
    }

    @Transactional
    public Review updateReview(Long reviewId, Long reviewerId, UpdateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (!review.getReviewer().getId().equals(reviewerId)) {
            throw new IllegalArgumentException("You are not authorized to update this review");
        }

        review.setContent(request.getContent());
        review.setRating(request.getRating());

        return review;
    }

    @Transactional
    public void deleteReview(Long reviewId, Long reviewerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (!review.getReviewer().getId().equals(reviewerId)) {
            throw new IllegalArgumentException("You are not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }

    public List<Review> getReviewsBySubmissionId(Long submissionId) {
        return reviewRepository.findBySubmissionIdOrderByCreatedAtDesc(submissionId);
    }

    @Transactional
    public ReviewComment createComment(Long reviewId, Long userId, CreateCommentRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        ReviewComment comment = ReviewComment.builder()
                .review(review)
                .user(user)
                .content(request.getContent())
                .build();

        return reviewCommentRepository.save(comment);
    }

    public List<ReviewComment> getCommentsByReviewId(Long reviewId) {
        return reviewCommentRepository.findByReviewIdOrderByCreatedAtAsc(reviewId);
    }
}
