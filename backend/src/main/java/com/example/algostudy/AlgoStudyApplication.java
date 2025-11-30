package com.example.algostudy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AlgoStudyApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlgoStudyApplication.class, args);
    }
}
