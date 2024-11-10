"use client";

import React from "react";
import { Payment } from "components/payment";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();

  function handlePaymentSubmit(data: any) {
    // Implement payment processing logic here
    console.log("Payment data:", data);
    // Navigate to booking confirmation page
    router.push("/booking-confirmation");
  }

  return <Payment onSubmit={handlePaymentSubmit} />;
}
