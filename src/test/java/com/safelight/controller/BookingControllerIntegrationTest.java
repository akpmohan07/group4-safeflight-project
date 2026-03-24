package com.safelight.controller;

import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private MockHttpSession sessionWithUser(int userId) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_ID", userId);
        return session;
    }

    @Test
    void bookingOwnerCanViewTheirBookingDetails() throws Exception {
        // seeded booking: id=1, user_id=1 in data.sql
        mockMvc.perform(get("/api/bookings/1").session(sessionWithUser(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(1))
                .andExpect(jsonPath("$.flightCode").exists())
                .andExpect(jsonPath("$.fromAirport").exists())
                .andExpect(jsonPath("$.toAirport").exists());
    }

    @Test
    void nonOwnerCannotViewAnotherUsersBooking() throws Exception {
        mockMvc.perform(get("/api/bookings/1").session(sessionWithUser(2)))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidBookingIdReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/bookings/9999").session(sessionWithUser(1)))
                .andExpect(status().isNotFound());
    }

    @Test
    void myBookingsReturnsOnlyCurrentUsersBookings() throws Exception {
        // user 1 has at least one seeded booking; user 2 has none
        mockMvc.perform(get("/api/bookings/me").session(sessionWithUser(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()));

        mockMvc.perform(get("/api/bookings/me").session(sessionWithUser(2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/bookings/me"))
                .andExpect(status().isUnauthorized());
    }





    @Test
    void unauthenticatedUserCannotCreateBooking() throws Exception {
        String body = """
                {
                  "scheduleId": 1,
                  "seats": [
                    {
                      "seatNo": "30A",
                      "fname": "No",
                      "lname": "Auth",
                      "dob": "1990-01-01",
                      "phone": "0000000000",
                      "email": "no.auth@example.com",
                      "passport": "P0000000",
                      "baggageQuantity": 0
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createBookingShouldReturnBadRequestWhenSeatNumberMissing() throws Exception {
        String body = """
                {
                  "scheduleId": 1,
                  "seats": [
                    {
                      "seatNo": "   ",
                      "fname": "NoSeat",
                      "lname": "User",
                      "dob": "1990-01-01",
                      "phone": "9999999999",
                      "email": "noseat.user@example.com",
                      "passport": "P0001111",
                      "baggageQuantity": 1
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/bookings")
                        .session(sessionWithUser(1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Seat number is required"));
    }

    @Test
    void createBookingShouldReturnConflictWhenDuplicateSeatsInSameRequest() throws Exception {
        String body = """
                {
                  "scheduleId": 1,
                  "seats": [
                    {
                      "seatNo": "20a",
                      "fname": "Alice",
                      "lname": "One",
                      "dob": "1992-02-02",
                      "phone": "1111111111",
                      "email": "alice.one@example.com",
                      "passport": "P1111111",
                      "baggageQuantity": 0
                    },
                    {
                      "seatNo": "20A",
                      "fname": "Alice",
                      "lname": "Two",
                      "dob": "1993-03-03",
                      "phone": "2222222222",
                      "email": "alice.two@example.com",
                      "passport": "P2222222",
                      "baggageQuantity": 1
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/bookings")
                        .session(sessionWithUser(1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void createBookingShouldReturnConflictWhenSeatAlreadyBookedForSchedule() throws Exception {
        // data.sql seeds booking id=1 on schedule id=1 with seats 1A and 1B
        String body = """
                {
                  "scheduleId": 1,
                  "seats": [
                    {
                      "seatNo": "1A",
                      "fname": "Existing",
                      "lname": "Seat",
                      "dob": "1990-01-01",
                      "phone": "9999999999",
                      "email": "existing.seat@example.com",
                      "passport": "P9999999",
                      "baggageQuantity": 1
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/bookings")
                        .session(sessionWithUser(1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(content().string("Seat already booked: 1A"));
    }


}

