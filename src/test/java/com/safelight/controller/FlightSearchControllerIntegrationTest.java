package com.safelight.controller;

import com.safelight.model.Airline;
import com.safelight.model.Destination;
import com.safelight.model.Flight;
import com.safelight.model.FlightModel;
import com.safelight.model.FlightSchedule;
import com.safelight.model.Route;
import com.safelight.repository.DestinationRepository;
import com.safelight.repository.FlightScheduleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FlightSearchController.class)
class FlightSearchControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DestinationRepository destinationRepository;

    @MockitoBean
    private FlightScheduleRepository flightScheduleRepository;

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
        // simple seatPricing with two cabins
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
    void searchFlightsShouldReturnResultsForValidOneWaySearch() throws Exception {
        LocalDate date = LocalDate.of(2026, 3, 20);
        FlightSchedule schedule = buildSampleSchedule(1001);

        when(flightScheduleRepository
                .findByRoute_FromDestination_IdAndRoute_ToDestination_IdAndTravelDateOrderByTravelTime(
                        eq(1), eq(2), eq(date)))
                .thenReturn(List.of(schedule));

        mockMvc.perform(get("/api/flights/search")
                        .param("fromId", "1")
                        .param("toId", "2")
                        .param("date", "2026-03-20")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].scheduleId", is(1001)))
                .andExpect(jsonPath("$[0].airlineName", is("Safe Air")))
                .andExpect(jsonPath("$[0].flightCode", is("SF101")))
                .andExpect(jsonPath("$[0].fromAirport", is("SYD")))
                .andExpect(jsonPath("$[0].toAirport", is("MEL")))
                // priceFrom should be the minimum of seatPricing (300)
                .andExpect(jsonPath("$[0].priceFrom", is(300)));
    }

    @Test
    void searchFlightsShouldReturnEmptyListWhenNoSchedules() throws Exception {
        when(flightScheduleRepository
                .findByRoute_FromDestination_IdAndRoute_ToDestination_IdAndTravelDateOrderByTravelTime(
                        any(), any(), any()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/flights/search")
                        .param("fromId", "1")
                        .param("toId", "2")
                        .param("date", "2026-03-21")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getSeatMapShouldReturnDetailsForValidSchedule() throws Exception {
        FlightSchedule schedule = buildSampleSchedule(2001);
        when(flightScheduleRepository.findById(2001)).thenReturn(Optional.of(schedule));

        mockMvc.perform(get("/api/flights/2001/seatmap")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scheduleId", is(2001)))
                .andExpect(jsonPath("$.flightCode", is("SF101")))
                .andExpect(jsonPath("$.airlineName", is("Safe Air")))
                .andExpect(jsonPath("$.fromAirport", is("SYD")))
                .andExpect(jsonPath("$.toAirport", is("MEL")));
    }

    @Test
    void getSeatMapShouldReturnNotFoundForInvalidSchedule() throws Exception {
        when(flightScheduleRepository.findById(9999)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/flights/9999/seatmap")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}

