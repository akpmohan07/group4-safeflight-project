package com.safelight.dto;

import java.util.List;

public class CreateBookingRequest {

    private Integer scheduleId;
    private List<SeatRequest> seats;

    public Integer getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Integer scheduleId) {
        this.scheduleId = scheduleId;
    }

    public List<SeatRequest> getSeats() {
        return seats;
    }

    public void setSeats(List<SeatRequest> seats) {
        this.seats = seats;
    }

    public static class SeatRequest {
        private String seatNo;
        private String fname;
        private String lname;
        private String dob;
        private String phone;
        private String email;
        private String passport;
        private Integer baggageQuantity;

        public String getSeatNo() {
            return seatNo;
        }

        public void setSeatNo(String seatNo) {
            this.seatNo = seatNo;
        }

        public String getFname() {
            return fname;
        }

        public void setFname(String fname) {
            this.fname = fname;
        }

        public String getLname() {
            return lname;
        }

        public void setLname(String lname) {
            this.lname = lname;
        }

        public String getDob() {
            return dob;
        }

        public void setDob(String dob) {
            this.dob = dob;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassport() {
            return passport;
        }

        public void setPassport(String passport) {
            this.passport = passport;
        }

        public Integer getBaggageQuantity() {
            return baggageQuantity;
        }

        public void setBaggageQuantity(Integer baggageQuantity) {
            this.baggageQuantity = baggageQuantity;
        }
    }
}

