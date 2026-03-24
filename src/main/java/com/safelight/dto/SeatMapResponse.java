package com.safelight.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SeatMapResponse {

    private Integer scheduleId;
    private String flightCode;
    private String flightName;
    private String airlineName;
    private LocalDate travelDate;
    private LocalTime travelTime;
    private String fromAirport;
    private String toAirport;
    private String seatMapping;

    private java.util.List<String> bookedSeats;

    public Integer getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Integer scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getFlightCode() {
        return flightCode;
    }

    public void setFlightCode(String flightCode) {
        this.flightCode = flightCode;
    }

    public String getFlightName() {
        return flightName;
    }

    public void setFlightName(String flightName) {
        this.flightName = flightName;
    }

    public String getAirlineName() {
        return airlineName;
    }

    public void setAirlineName(String airlineName) {
        this.airlineName = airlineName;
    }

    public LocalDate getTravelDate() {
        return travelDate;
    }

    public void setTravelDate(LocalDate travelDate) {
        this.travelDate = travelDate;
    }

    public LocalTime getTravelTime() {
        return travelTime;
    }

    public void setTravelTime(LocalTime travelTime) {
        this.travelTime = travelTime;
    }

    public String getFromAirport() {
        return fromAirport;
    }

    public void setFromAirport(String fromAirport) {
        this.fromAirport = fromAirport;
    }

    public String getToAirport() {
        return toAirport;
    }

    public void setToAirport(String toAirport) {
        this.toAirport = toAirport;
    }

    public String getSeatMapping() {
        return seatMapping;
    }

    public void setSeatMapping(String seatMapping) {
        this.seatMapping = seatMapping;
    }

    public java.util.List<String> getBookedSeats() {
        return bookedSeats;
    }

    public void setBookedSeats(java.util.List<String> bookedSeats) {
        this.bookedSeats = bookedSeats;
    }
}

