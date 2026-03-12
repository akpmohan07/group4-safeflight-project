package com.safelight.controller;

import com.safelight.dto.DestinationResponse;
import com.safelight.dto.FlightSearchResultDto;
import com.safelight.dto.SeatMapResponse;
import com.safelight.model.BookingPassenger;
import com.safelight.model.Destination;
import com.safelight.model.FlightSchedule;
import com.safelight.repository.DestinationRepository;
import com.safelight.repository.FlightScheduleRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
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

    @GetMapping("/flights/{scheduleId}/seatmap")
    public ResponseEntity<?> getSeatMap(@PathVariable Integer scheduleId) {
        Optional<FlightSchedule> scheduleOpt = flightScheduleRepository.findById(scheduleId);
        if (scheduleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FlightSchedule schedule = scheduleOpt.get();
        SeatMapResponse dto = new SeatMapResponse();
        dto.setScheduleId(schedule.getId());
        dto.setTravelDate(schedule.getTravelDate());
        dto.setTravelTime(schedule.getTravelTime());
        dto.setFlightCode(schedule.getFlight().getFlightCode());
        dto.setFlightName(schedule.getFlight().getFlightName());
        dto.setAirlineName(schedule.getFlight().getAirline().getName());
        dto.setFromAirport(schedule.getRoute().getFromDestination().getAirport());
        dto.setToAirport(schedule.getRoute().getToDestination().getAirport());
        dto.setSeatMapping(schedule.getFlight().getFlightModel().getSeatMapping());

        java.util.List<String> bookedSeats = schedule.getBookings().stream()
                .filter(b -> b.getStatus() == null || !b.getStatus().equalsIgnoreCase("CANCELLED"))
                .flatMap(b -> b.getBookingPassengers().stream())
                .map(BookingPassenger::getSeatNo)
                .filter(seatNo -> seatNo != null && !seatNo.isBlank())
                .distinct()
                .toList();
        dto.setBookedSeats(bookedSeats);

        return ResponseEntity.ok(dto);
    }

    private DestinationResponse toDestinationResponse(Destination d) {
        DestinationResponse r = new DestinationResponse();
        r.setId(d.getId());
        r.setCountry(d.getCountry());
        r.setCity(d.getCity());
        r.setAirport(d.getAirport());
        return r;
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

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
        if (s.getFlight() != null && s.getFlight().getFlightModel() != null) {
            dto.setPriceFrom(extractPriceFrom(s.getFlight().getFlightModel().getSeatMapping()));
        }
        return dto;
    }

    private Integer extractPriceFrom(String seatMappingJson) {
        if (seatMappingJson == null || seatMappingJson.isBlank()) return null;
        try {
            JsonNode root = objectMapper.readTree(seatMappingJson);
            JsonNode pricing = root.path("seatPricing");
            if (!pricing.isObject()) return null;
            int min = Integer.MAX_VALUE;
            for (JsonNode value : pricing) {
                if (value.isNumber()) {
                    int p = value.asInt();
                    if (p < min) min = p;
                }
            }
            return min == Integer.MAX_VALUE ? null : min;
        } catch (Exception e) {
            return null;
        }
    }
}
