package com.safelight.repository;

import com.safelight.model.FlightSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FlightScheduleRepository extends JpaRepository<FlightSchedule, Integer> {

    List<FlightSchedule> findByRoute_FromDestination_IdAndRoute_ToDestination_IdAndTravelDateOrderByTravelTime(
            Integer fromDestinationId, Integer toDestinationId, LocalDate travelDate);
}
