"use client";

import React from "react";
import { PassengerInfo } from "components/passenger-info";
import { useRouter } from "next/navigation";

export default function PassengerInfoPage() {
  const router = useRouter();

  function handlePassengerInfoSubmit(data: any) {
    // Implement navigation to payment or next step
    console.log("Passenger Info:", data);
    router.push("/payment");
  }

  return <PassengerInfo onSubmit={handlePassengerInfoSubmit} />;
}
