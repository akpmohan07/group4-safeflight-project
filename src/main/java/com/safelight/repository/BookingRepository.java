package com.safelight.repository;

import com.safelight.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByUser_IdOrderByBookedTimeDesc(Integer userId);
}

