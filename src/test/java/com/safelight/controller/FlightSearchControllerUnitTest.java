package com.safelight.controller;

import com.safelight.dto.FlightSearchResultDto;
import com.safelight.dto.SeatMapResponse;
import com.safelight.model.*;
import com.safelight.repository.DestinationRepository;
import com.safelight.repository.FlightScheduleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlightSearchControllerUnitTest {

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private FlightScheduleRepository flightScheduleRepository;

    @InjectMocks
    private FlightSearchController controller;

    private FlightSchedule buildSampleSchedule(int scheduleId) {
        Destination from = new Destination();
        from.setId(1);
        from.setAirport("SYD");

        Destination to = new Destination();
        to.setId(2);
        to.setAirport("MEL");

        Route route = new Route();
        route.setId(10);
        route.setFromDestination(from);
        route.setToDestination(to);

        Airline airline = new Airline();
        airline.setId(5);
        airline.setName("Safe Air");

        FlightModel model = new FlightModel();
        model.setId(3);
        model.setSeatMapping("""
                {"seatPricing":{"Economy Class":300,"Business Class":1500}}
                """);

        Flight flight = new Flight();
        flight.setId(7);
        flight.setFlightCode("SF101");
        flight.setFlightName("Safe Air Test");
        flight.setAirline(airline);
        flight.setFlightModel(model);

        FlightSchedule schedule = new FlightSchedule();
        schedule.setId(scheduleId);
        schedule.setRoute(route);
        schedule.setFlight(flight);
        schedule.setTravelDate(LocalDate.of(2026, 3, 20));
        schedule.setTravelTime(LocalTime.of(8, 30));

        return schedule;
    }

    @Test
    void toSearchResultShouldMapScheduleAndComputeMinPrice() {
        FlightSchedule schedule = buildSampleSchedule(1001);

        // call private logic indirectly via public method
        when(flightScheduleRepository
                .findByRoute_FromDestination_IdAndRoute_ToDestination_IdAndTravelDateOrderByTravelTime(
                        eq(1), eq(2), any(LocalDate.class)))
                .thenReturn(List.of(schedule));

        ResponseEntity<?> response = controller.searchFlights(1, 2, LocalDate.of(2026, 3, 20));

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        @SuppressWarnings("unchecked")
        List<FlightSearchResultDto> body = (List<FlightSearchResultDto>) response.getBody();
        assertThat(body).hasSize(1);
        FlightSearchResultDto dto = body.get(0);
        assertThat(dto.getScheduleId()).isEqualTo(1001);
        assertThat(dto.getFlightCode()).isEqualTo("SF101");
        assertThat(dto.getFromAirport()).isEqualTo("SYD");
        assertThat(dto.getToAirport()).isEqualTo("MEL");
        // min of 300 and 1500
        assertThat(dto.getPriceFrom()).isEqualTo(300);
    }

    @Test
    void searchFlightsShouldReturnEmptyListWhenNoSchedules() {
        when(flightScheduleRepository
                .findByRoute_FromDestination_IdAndRoute_ToDestination_IdAndTravelDateOrderByTravelTime(
                        any(), any(), any()))
                .thenReturn(Collections.emptyList());

        ResponseEntity<?> response = controller.searchFlights(1, 2, LocalDate.of(2026, 3, 21));

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        @SuppressWarnings("unchecked")
        List<FlightSearchResultDto> body = (List<FlightSearchResultDto>) response.getBody();
        assertThat(body).isEmpty();
    }

    @Test
    void getSeatMapShouldReturnSeatMapResponseForValidSchedule() {
        FlightSchedule schedule = buildSampleSchedule(2001);
        when(flightScheduleRepository.findById(2001)).thenReturn(Optional.of(schedule));

        ResponseEntity<?> response = controller.getSeatMap(2001);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        SeatMapResponse dto = (SeatMapResponse) response.getBody();
        assertThat(dto).isNotNull();
        assertThat(dto.getScheduleId()).isEqualTo(2001);
        assertThat(dto.getFlightCode()).isEqualTo("SF101");
        assertThat(dto.getAirlineName()).isEqualTo("Safe Air");
        assertThat(dto.getFromAirport()).isEqualTo("SYD");
        assertThat(dto.getToAirport()).isEqualTo("MEL");
    }

    @Test
    void getSeatMapShouldReturnNotFoundForMissingSchedule() {
        when(flightScheduleRepository.findById(9999)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.getSeatMap(9999);

        assertThat(response.getStatusCode().value()).isEqualTo(404);
        assertThat(response.getBody()).isNull();
    }
}

