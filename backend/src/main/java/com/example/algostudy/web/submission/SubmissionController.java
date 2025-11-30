package com.example.algostudy.web.submission;

import com.example.algostudy.domain.submission.Submission;
import com.example.algostudy.service.SubmissionService;
import com.example.algostudy.web.submission.dto.CreateSubmissionRequest;
import com.example.algostudy.web.submission.dto.SubmissionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    /**
     * 크롬 확장에서 호출하는 엔드포인트
     * 제출 기록을 생성합니다.
     */
    @PostMapping
    public ResponseEntity<SubmissionResponse> createSubmission(
            @RequestHeader(value = "X-USER-ID", required = false) Long userIdHeader,
            @Valid @RequestBody CreateSubmissionRequest request
    ) {
        // TODO: JWT 인증 구현 후 @AuthenticationPrincipal로 userId 가져오기
        // 현재는 임시로 헤더에서 받거나 기본값 사용
        Long userId = (userIdHeader != null) ? userIdHeader : 1L;

        Submission submission = submissionService.createSubmission(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SubmissionResponse.from(submission));
    }

    /**
     * 제출 기록 목록을 조회합니다 (페이지네이션)
     */
    @GetMapping
    public ResponseEntity<Page<SubmissionResponse>> listSubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Submission> submissions = submissionService.getRecentSubmissions(pageable);
        return ResponseEntity.ok(submissions.map(SubmissionResponse::fromWithoutCode));
    }

    /**
     * 특정 제출 기록의 상세 정보를 조회합니다
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getSubmission(@PathVariable Long id) {
        Submission submission = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(SubmissionResponse.from(submission));
    }

    /**
     * 특정 사용자의 제출 기록을 조회합니다
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByUser(@PathVariable Long userId) {
        List<Submission> submissions = submissionService.getSubmissionsByUserId(userId);
        return ResponseEntity.ok(submissions.stream()
                .map(SubmissionResponse::fromWithoutCode)
                .toList());
    }

    /**
     * 특정 문제의 제출 기록을 조회합니다
     */
    @GetMapping("/problem/{site}/{problemId}")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByProblem(
            @PathVariable String site,
            @PathVariable String problemId
    ) {
        List<Submission> submissions = submissionService.getSubmissionsByProblem(site, problemId);
        return ResponseEntity.ok(submissions.stream()
                .map(SubmissionResponse::fromWithoutCode)
                .toList());
    }
}
