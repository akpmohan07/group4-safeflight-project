package com.safelight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SafeflightApplication {

	public static void main(String[] args) {
        System.out.println("Starting Safeflight Application");
		SpringApplication.run(SafeflightApplication.class, args);
	}

}
