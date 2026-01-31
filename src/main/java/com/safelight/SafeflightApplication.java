package com.safelight;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SafeflightApplication {
    private static final Logger logger = LogManager.getLogger(SafeflightApplication.class);
	public static void main(String[] args) {
        logger.info("Starting Safeflight Application");
		SpringApplication.run(SafeflightApplication.class, args);
	}

}
