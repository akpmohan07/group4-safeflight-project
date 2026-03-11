package com.safelight.controller;

import com.safelight.dto.DestinationResponse;
import com.safelight.dto.FlightSearchResultDto;
import com.safelight.model.Destination;
import com.safelight.model.FlightSchedule;
import com.safelight.repository.DestinationRepository;
import com.safelight.repository.FlightScheduleRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class FlightSearchController {

    private final DestinationRepository destinationRepository;
    private final FlightScheduleRepository flightScheduleRepository;

    public FlightSearchController(DestinationRepository destinationRepository,
                                  FlightScheduleRepository flightScheduleRepository) {
        this.destinationRepository = destinationRepository;
        this.flightScheduleRepository = flightScheduleRepository;
    }

    @GetMapping("/destinations")
    public List<DestinationResponse> listDestinations() {
        return destinationRepository.findAll().stream()
                .map(this::toDestinationResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/flights/search")
    public ResponseEntity<?> searchFlights(
            @RequestParam("fromId") Integer fromId,
            @RequestParam("toId") Integer toId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<FlightSchedule> schedules = flightScheduleRepository
                .findByRoute_FromDestination_IdAndRoute_ToDestination_IdAndTravelDateOrderByTravelTime(
                        fromId, toId, date);

        List<FlightSearchResultDto> results = schedules.stream()
                .map(this::toSearchResult)
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    private DestinationResponse toDestinationResponse(Destination d) {
        DestinationResponse r = new DestinationResponse();
        r.setId(d.getId());
        r.setCountry(d.getCountry());
        r.setCity(d.getCity());
        r.setAirport(d.getAirport());
        return r;
    }

    private FlightSearchResultDto toSearchResult(FlightSchedule s) {
        FlightSearchResultDto dto = new FlightSearchResultDto();
        dto.setScheduleId(s.getId());
        dto.setTravelDate(s.getTravelDate());
        dto.setTravelTime(s.getTravelTime());
        dto.setFlightCode(s.getFlight().getFlightCode());
        dto.setFlightName(s.getFlight().getFlightName());
        dto.setAirlineName(s.getFlight().getAirline().getName());
        dto.setFromAirport(s.getRoute().getFromDestination().getAirport());
        dto.setToAirport(s.getRoute().getToDestination().getAirport());
        return dto;
    }
}
