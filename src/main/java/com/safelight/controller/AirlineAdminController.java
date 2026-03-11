package com.safelight.controller;

import com.safelight.dto.AirlineRequest;
import com.safelight.model.Airline;
import com.safelight.model.User;
import com.safelight.repository.AirlineRepository;
import com.safelight.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/airlines")
public class AirlineAdminController {

    private final AirlineRepository airlineRepository;
    private final UserRepository userRepository;

    public AirlineAdminController(AirlineRepository airlineRepository, UserRepository userRepository) {
        this.airlineRepository = airlineRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createAirline(@RequestParam("adminEmail") String adminEmail,
                                           @RequestBody AirlineRequest request) {
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin user not found");
        }

        User admin = adminOpt.get();
        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not an admin");
        }

        Airline airline = new Airline();
        airline.setName(request.getName());
        airline.setCountry(request.getCountry());

        Airline saved = airlineRepository.save(airline);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}

