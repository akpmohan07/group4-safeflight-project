package com.safelight.controller;

import com.safelight.dto.CreateBookingRequest;
import com.safelight.model.*;
import com.safelight.repository.*;
import com.safelight.service.TicketPdfService;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FlightScheduleRepository flightScheduleRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PassengerRepository passengerRepository;

    @Mock
    private BookingPassengerRepository bookingPassengerRepository;

    @Mock
    private TicketPdfService ticketPdfService;

    @Mock
    private HttpSession session;

    @InjectMocks
    private BookingController controller;

    @Test
    void createBookingShouldReturnUnauthorizedWhenNoSessionUser() {
        when(session.getAttribute("USER_ID")).thenReturn(null);

        ResponseEntity<?> response = controller.createBooking(null, session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isEqualTo("Not logged in");
        verifyNoInteractions(userRepository, flightScheduleRepository, bookingRepository);
    }

    @Test
    void createBookingShouldReturnUnauthorizedWhenUserMissing() {
        when(session.getAttribute("USER_ID")).thenReturn(99);
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.createBooking(new CreateBookingRequest(), session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isEqualTo("Not logged in");
        verify(userRepository).findById(99);
        verifyNoInteractions(flightScheduleRepository, bookingRepository);
    }

    @Test
    void createBookingShouldReturnBadRequestWhenScheduleInvalid() {
        when(session.getAttribute("USER_ID")).thenReturn(1);
        User user = new User();
        user.setId(1);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        CreateBookingRequest req = new CreateBookingRequest();
        req.setScheduleId(123);
        req.setSeats(List.of());

        ResponseEntity<?> response = controller.createBooking(req, session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Missing scheduleId or seats");
    }

    @Test
    void createBookingShouldReturnConflictWhenSeatAlreadyBooked() {
        when(session.getAttribute("USER_ID")).thenReturn(1);
        User user = new User();
        user.setId(1);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        FlightSchedule schedule = new FlightSchedule();
        schedule.setId(10);
        when(flightScheduleRepository.findById(10)).thenReturn(Optional.of(schedule));

        BookingPassenger existingBp = new BookingPassenger();
        existingBp.setSeatNo("10B");
        when(bookingPassengerRepository.findByBooking_FlightSchedule_Id(10))
                .thenReturn(List.of(existingBp));

        CreateBookingRequest.SeatRequest seatReq = new CreateBookingRequest.SeatRequest();
        seatReq.setSeatNo("10B");
        seatReq.setFname("Test");
        seatReq.setLname("User");
        seatReq.setDob(LocalDate.of(1990, 1, 1).toString());
        seatReq.setPhone("1234567890");
        seatReq.setEmail("test@example.com");
        seatReq.setPassport("P12345");

        CreateBookingRequest req = new CreateBookingRequest();
        req.setScheduleId(10);
        req.setSeats(List.of(seatReq));

        ResponseEntity<?> response = controller.createBooking(req, session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isEqualTo("Seat already booked: 10B");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void listMyBookingsShouldReturnUnauthorizedWhenNoSessionUser() {
        when(session.getAttribute("USER_ID")).thenReturn(null);

        ResponseEntity<?> response = controller.listMyBookings(session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isEqualTo("Not logged in");
        verifyNoInteractions(bookingRepository);
    }

    @Test
    void getBookingShouldReturnForbiddenWhenUserIsNotOwner() {
        when(session.getAttribute("USER_ID")).thenReturn(2);

        User owner = new User();
        owner.setId(1);

        Booking booking = new Booking();
        booking.setId(5);
        booking.setUser(owner);

        when(bookingRepository.findById(5)).thenReturn(Optional.of(booking));

        ResponseEntity<?> response = controller.getBooking(5, session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}

