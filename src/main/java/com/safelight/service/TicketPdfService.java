package com.safelight.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.safelight.model.Booking;
import com.safelight.model.BookingPassenger;
import com.safelight.model.Passenger;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class TicketPdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEE, MMM d, yyyy", Locale.US);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a", Locale.US);

    public byte[] generateTicketPdf(Booking booking) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        var s = booking.getFlightSchedule();
        String flightCode = s.getFlight().getFlightCode();
        String airlineName = s.getFlight().getAirline().getName();
        String fromAirport = s.getRoute().getFromDestination().getAirport();
        String toAirport = s.getRoute().getToDestination().getAirport();
        LocalDate travelDate = s.getTravelDate();
        LocalTime travelTime = s.getTravelTime();

        document.add(new Paragraph("Safeflight - Flight Ticket")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20));

        document.add(new Paragraph("Booking #" + booking.getId())
                .setFontSize(14)
                .setBold());
        document.add(new Paragraph("Status: " + (booking.getStatus() != null ? booking.getStatus() : ""))
                .setMarginBottom(2));
        document.add(new Paragraph("Payment: " + (booking.getPaymentStatus() != null ? booking.getPaymentStatus() : ""))
                .setMarginBottom(16));

        document.add(new Paragraph("Flight details").setBold().setMarginBottom(6));
        document.add(new Paragraph(flightCode + "  ·  " + airlineName));
        document.add(new Paragraph(fromAirport + "  →  " + toAirport).setMarginBottom(4));
        document.add(new Paragraph("Date: " + (travelDate != null ? travelDate.format(DATE_FMT) : "")));
        document.add(new Paragraph("Departure: " + (travelTime != null ? travelTime.format(TIME_FMT) : "")).setMarginBottom(12));

        List<String> seats = booking.getBookingPassengers().stream()
                .map(BookingPassenger::getSeatNo)
                .filter(seat -> seat != null && !seat.isBlank())
                .sorted()
                .collect(Collectors.toList());
        document.add(new Paragraph("Seat(s): " + String.join(", ", seats)).setMarginBottom(16));

        document.add(new Paragraph("Passengers").setBold().setMarginBottom(6));
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 1, 2, 2}))
                .useAllAvailableWidth();
        table.addHeaderCell(new Cell().add(new Paragraph("Name")).setBold().setBorder(Border.NO_BORDER));
        table.addHeaderCell(new Cell().add(new Paragraph("Seat")).setBold().setBorder(Border.NO_BORDER));
        table.addHeaderCell(new Cell().add(new Paragraph("DOB")).setBold().setBorder(Border.NO_BORDER));
        table.addHeaderCell(new Cell().add(new Paragraph("Email")).setBold().setBorder(Border.NO_BORDER));
        table.addHeaderCell(new Cell().add(new Paragraph("Passport")).setBold().setBorder(Border.NO_BORDER));

        booking.getBookingPassengers().stream()
                .sorted(Comparator.comparing(bp -> bp.getSeatNo() != null ? bp.getSeatNo() : ""))
                .forEach(bp -> {
                    Passenger p = bp.getPassenger();
                    String name = (p != null && p.getFname() != null ? p.getFname() : "") + " " +
                            (p != null && p.getLname() != null ? p.getLname() : "");
                    table.addCell(new Cell().add(new Paragraph(name.trim().isEmpty() ? "—" : name.trim())).setBorder(Border.NO_BORDER));
                    table.addCell(new Cell().add(new Paragraph(bp.getSeatNo() != null ? bp.getSeatNo() : "—")).setBorder(Border.NO_BORDER));
                    table.addCell(new Cell().add(new Paragraph(p != null && p.getDob() != null ? p.getDob().format(DATE_FMT) : "—")).setBorder(Border.NO_BORDER));
                    table.addCell(new Cell().add(new Paragraph(p != null && p.getEmail() != null ? p.getEmail() : "—")).setBorder(Border.NO_BORDER));
                    table.addCell(new Cell().add(new Paragraph(p != null && p.getPassport() != null ? p.getPassport() : "—")).setBorder(Border.NO_BORDER));
                });
        document.add(table);

        document.add(new Paragraph("\nThank you for choosing Safeflight.")
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY));

        document.close();
        return baos.toByteArray();
    }
}
