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
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

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

        Booking existingBooking = new Booking();
        existingBooking.setStatus("CONFIRMED");
        existingBooking.setPaymentStatus("SUCCESS");
        
        BookingPassenger existingBp = new BookingPassenger();
        existingBp.setSeatNo("10B");
        existingBp.setBooking(existingBooking);
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
    void createBookingShouldReturnBadRequestWhenSeatNumberMissing() {
        when(session.getAttribute("USER_ID")).thenReturn(1);
        User user = new User();
        user.setId(1);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        FlightSchedule schedule = new FlightSchedule();
        schedule.setId(20);
        when(flightScheduleRepository.findById(20)).thenReturn(Optional.of(schedule));
        when(bookingPassengerRepository.findByBooking_FlightSchedule_Id(20))
                .thenReturn(List.of());

        CreateBookingRequest.SeatRequest seatReq = new CreateBookingRequest.SeatRequest();
        seatReq.setSeatNo("  "); // blank seat number
        seatReq.setFname("NoSeat");
        seatReq.setLname("User");

        CreateBookingRequest req = new CreateBookingRequest();
        req.setScheduleId(20);
        req.setSeats(List.of(seatReq));

        ResponseEntity<?> response = controller.createBooking(req, session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Seat number is required");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBookingShouldReturnConflictWhenDuplicateSeatsInSameRequest() {
        when(session.getAttribute("USER_ID")).thenReturn(1);
        User user = new User();
        user.setId(1);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        FlightSchedule schedule = new FlightSchedule();
        schedule.setId(30);
        when(flightScheduleRepository.findById(30)).thenReturn(Optional.of(schedule));
        // no existing bookings, conflict comes purely from duplicate seats in the request
        when(bookingPassengerRepository.findByBooking_FlightSchedule_Id(30))
                .thenReturn(List.of());

        CreateBookingRequest.SeatRequest seatReq1 = new CreateBookingRequest.SeatRequest();
        seatReq1.setSeatNo("20a");
        seatReq1.setFname("Alice");
        seatReq1.setLname("One");

        CreateBookingRequest.SeatRequest seatReq2 = new CreateBookingRequest.SeatRequest();
        seatReq2.setSeatNo("20A"); // same seat, different case
        seatReq2.setFname("Alice");
        seatReq2.setLname("Two");

        CreateBookingRequest req = new CreateBookingRequest();
        req.setScheduleId(30);
        req.setSeats(List.of(seatReq1, seatReq2));

        ResponseEntity<?> response = controller.createBooking(req, session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isEqualTo("Duplicate seat in request: 20A");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBookingShouldNormalizeSeatAndBaggageAndPassengerDob() {
        when(session.getAttribute("USER_ID")).thenReturn(1);
        User user = new User();
        user.setId(1);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        FlightSchedule schedule = new FlightSchedule();
        schedule.setId(40);
        // minimal graph to avoid NPEs when building BookingSummaryResponse
        Destination from = new Destination();
        from.setAirport("FROM");
        Destination to = new Destination();
        to.setAirport("TO");
        Route route = new Route();
        route.setFromDestination(from);
        route.setToDestination(to);
        Airline airline = new Airline();
        airline.setName("Test Airline");
        Flight flight = new Flight();
        flight.setFlightCode("TST100");
        flight.setAirline(airline);
        schedule.setRoute(route);
        schedule.setFlight(flight);
        schedule.setTravelDate(LocalDate.of(2030, 1, 1));
        schedule.setTravelTime(java.time.LocalTime.of(10, 0));
        when(flightScheduleRepository.findById(40)).thenReturn(Optional.of(schedule));
        when(bookingPassengerRepository.findByBooking_FlightSchedule_Id(40))
                .thenReturn(List.of());

        Booking persistedBooking = new Booking();
        persistedBooking.setId(100);
        persistedBooking.setUser(user);
        persistedBooking.setFlightSchedule(schedule);
        when(bookingRepository.save(any(Booking.class))).thenReturn(persistedBooking);

        // echo back the same Passenger / BookingPassenger instances that are passed in
        when(passengerRepository.save(any(Passenger.class)))
                .thenAnswer(invocation -> invocation.getArgument(0, Passenger.class));
        when(bookingPassengerRepository.save(any(BookingPassenger.class)))
                .thenAnswer(invocation -> invocation.getArgument(0, BookingPassenger.class));

        CreateBookingRequest.SeatRequest seatReq1 = new CreateBookingRequest.SeatRequest();
        seatReq1.setSeatNo("10a"); // will be uppercased
        seatReq1.setFname("John");
        seatReq1.setLname("Doe");
        seatReq1.setDob("1990-01-01");
        seatReq1.setPhone("1111111111");
        seatReq1.setEmail("john@example.com");
        seatReq1.setPassport("P111");
        seatReq1.setBaggageQuantity(-1); // will be normalized to 0

        CreateBookingRequest.SeatRequest seatReq2 = new CreateBookingRequest.SeatRequest();
        seatReq2.setSeatNo("11b"); // will be uppercased
        seatReq2.setFname("Jane");
        seatReq2.setLname("Roe");
        seatReq2.setDob("not-a-date"); // invalid, will be parsed as null
        seatReq2.setPhone("2222222222");
        seatReq2.setEmail("jane@example.com");
        seatReq2.setPassport("P222");
        seatReq2.setBaggageQuantity(null); // will be normalized to 0

        CreateBookingRequest req = new CreateBookingRequest();
        req.setScheduleId(40);
        req.setSeats(List.of(seatReq1, seatReq2));

        ResponseEntity<?> response = controller.createBooking(req, session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // verify passengers persisted with correct DOB handling
        var passengerCaptor = org.mockito.ArgumentCaptor.forClass(Passenger.class);
        verify(passengerRepository, org.mockito.Mockito.times(2)).save(passengerCaptor.capture());
        List<Passenger> savedPassengers = passengerCaptor.getAllValues();
        assertThat(savedPassengers.get(0).getDob()).isEqualTo(LocalDate.of(1990, 1, 1));
        assertThat(savedPassengers.get(1).getDob()).isNull();

        // verify booking passengers persisted with normalized seat and baggage quantity
        var bookingPassengerCaptor = org.mockito.ArgumentCaptor.forClass(BookingPassenger.class);
        verify(bookingPassengerRepository, org.mockito.Mockito.times(2)).save(bookingPassengerCaptor.capture());
        List<BookingPassenger> savedBookingPassengers = bookingPassengerCaptor.getAllValues();

        assertThat(savedBookingPassengers.get(0).getSeatNo()).isEqualTo("10A");
        assertThat(savedBookingPassengers.get(1).getSeatNo()).isEqualTo("11B");
        assertThat(savedBookingPassengers.get(0).getBaggageQuantity()).isEqualTo(0);
        assertThat(savedBookingPassengers.get(1).getBaggageQuantity()).isEqualTo(0);
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

