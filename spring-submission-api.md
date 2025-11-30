
---

## 3. `spring-submission-api.md` (Spring SubmissionController + Service 기본 코드)

```md
# Spring Boot Submission API 기본 코드

이 문서는 **크롬 확장에서 전송하는 제출 정보**를 수신하여 DB에 저장하는  
Spring Boot API의 기본 구조를 정의한다.

- 엔드포인트: `POST /api/submissions`
- 역할: 제출 기록 저장
- 사용 기술:
  - Spring Web
  - Spring Data JPA
  - Lombok
  - (선택) Spring Security + JWT

---

## 1. 엔티티(Entity)

### 1.1 User 엔티티 (예시)

```java
package com.example.algo.domain.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password; // 해싱된 비밀번호

    // 양방향 매핑이 필요하면 Submission 리스트를 추가할 수 있음
    // @OneToMany(mappedBy = "user")
    // private List<Submission> submissions = new ArrayList<>();
}

---

### 1.2 Submission 엔티티

package com.example.algo.domain.submission;

import com.example.algo.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // baekjoon / programmers 등
    @Column(nullable = false)
    private String site;

    @Column(nullable = false)
    private String problemId;

    private String problemTitle;

    private String language;

    @Lob
    @Column(nullable = false)
    private String code;

    // AC, 등 확장 가능. 현재는 AC만 사용.
    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
2. Repository
package com.example.algo.domain.submission;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    // 필요 시 사용자별, 문제별 조회 메서드 추가
}

package com.example.algo.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

3. DTO 정의
package com.example.algo.web.submission.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateSubmissionRequest {

    private String site;          // "baekjoon" | "programmers"
    private String problemId;
    private String problemTitle;
    private String language;
    private String code;
    private String status;        // "AC"
    private LocalDateTime submittedAt;
}

package com.example.algo.web.submission.dto;

import com.example.algo.domain.submission.Submission;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SubmissionResponse {

    private Long id;
    private String site;
    private String problemId;
    private String problemTitle;
    private String language;
    private String status;
    private LocalDateTime submittedAt;
    private String userName;

    public static SubmissionResponse from(Submission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .site(s.getSite())
                .problemId(s.getProblemId())
                .problemTitle(s.getProblemTitle())
                .language(s.getLanguage())
                .status(s.getStatus())
                .submittedAt(s.getSubmittedAt())
                .userName(s.getUser() != null ? s.getUser().getName() : null)
                .build();
    }
}

4. Service
package com.example.algo.service.submission;

import com.example.algo.domain.submission.Submission;
import com.example.algo.domain.submission.SubmissionRepository;
import com.example.algo.domain.user.User;
import com.example.algo.domain.user.UserRepository;
import com.example.algo.web.submission.dto.CreateSubmissionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    public Submission createSubmission(Long userId, CreateSubmissionRequest req) {
      User user = userRepository.findById(userId)
              .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

      LocalDateTime submittedAt = req.getSubmittedAt() != null
              ? req.getSubmittedAt()
              : LocalDateTime.now();

      Submission submission = Submission.builder()
              .user(user)
              .site(req.getSite())
              .problemId(req.getProblemId())
              .problemTitle(req.getProblemTitle())
              .language(req.getLanguage())
              .code(req.getCode())
              .status(req.getStatus() != null ? req.getStatus() : "AC")
              .submittedAt(submittedAt)
              .build();

      return submissionRepository.save(submission);
    }

    @Transactional(readOnly = true)
    public List<Submission> getRecentSubmissions() {
        return submissionRepository.findAll();
    }
}

5. Controller
package com.example.algo.web.submission;

import com.example.algo.domain.submission.Submission;
import com.example.algo.service.submission.SubmissionService;
import com.example.algo.web.submission.dto.CreateSubmissionRequest;
import com.example.algo.web.submission.dto.SubmissionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 인증이 없다고 가정한 버전.
// JWT/Spring Security를 붙일 경우 @AuthenticationPrincipal 로 userId를 가져오도록 수정 필요.
@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // 크롬 확장에서 호출하는 엔드포인트
    @PostMapping
    public ResponseEntity<Void> createSubmission(
            // 실제로는 인증에서 userId를 꺼내와야 한다.
            @RequestHeader(value = "X-USER-ID", required = false) Long userIdHeader,
            @RequestBody CreateSubmissionRequest request
    ) {
        // 데모용: userId를 하드코딩하거나, 헤더에서 받거나, 임시 계정을 사용
        Long userId = (userIdHeader != null) ? userIdHeader : 1L;

        submissionService.createSubmission(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 대시보드 조회용
    @GetMapping
    public List<SubmissionResponse> listSubmissions() {
        List<Submission> submissions = submissionService.getRecentSubmissions();
        return submissions.stream()
                .map(SubmissionResponse::from)
                .toList();
    }
}

6. CORS 설정
package com.example.algo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
      return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
          registry.addMapping("/api/**")
              .allowedOrigins(
                  "http://localhost:5173",     // Vue 개발 서버
                  "chrome-extension://*"       // 크롬 확장
              )
              .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
              .allowCredentials(true);
        }
      };
    }
}
