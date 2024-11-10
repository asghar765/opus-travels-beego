"use client";

import React from "react";
import { Button } from "components/ui/button";
import { useRouter } from "next/navigation";

interface BookingConfirmationProps {
  bookingDetails: {
    reference: string;
    [key: string]: any;
  };
}

export function BookingConfirmation({ bookingDetails }: BookingConfirmationProps) {
  const router = useRouter();

  function handleViewItinerary() {
    // Implement navigation to itinerary page if applicable
    router.push("/itinerary");
  }

  return (
    <div className="container py-12 text-center">
      <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
      <p className="mb-6">Your flight has been booked successfully.</p>
      <div className="mb-6">
        <p>
          Booking Reference: <strong>{bookingDetails.reference}</strong>
        </p>
        {/* Add more booking details as needed */}
      </div>
      <Button onClick={handleViewItinerary}>View Itinerary</Button>
    </div>
  );
}
