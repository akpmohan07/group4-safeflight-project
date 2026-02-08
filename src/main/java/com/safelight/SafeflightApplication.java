package com.safelight;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class SafeflightApplication {

    public static void main(String[] args) {
        log.info("Starting Safeflight Application");
        log.info("Testing to trigger github workflow");
        SpringApplication.run(SafeflightApplication.class, args);
    }
}
