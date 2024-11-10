"use client";

import React from "react";
import { BookingConfirmation } from "components/booking-confirmation";

export default function BookingConfirmationPage() {
  // In a real application, booking details would be fetched from a server or passed via state
  const bookingDetails = {
    reference: "ABC123",
    // Add additional booking details as needed
  };

  return <BookingConfirmation bookingDetails={bookingDetails} />;
}
