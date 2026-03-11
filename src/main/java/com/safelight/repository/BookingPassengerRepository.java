package com.safelight.repository;

import com.safelight.model.BookingPassenger;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingPassengerRepository extends JpaRepository<BookingPassenger, Integer> {

    List<BookingPassenger> findByBooking_FlightSchedule_Id(Integer scheduleId);
}

