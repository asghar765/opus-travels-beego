"use client";

import React from "react";
import { Button } from "./ui/button";

interface FlightOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: Array<{
    origin_name: string;
    destination_name: string;
    duration: string;
    segments: Array<{
      departing_at: string;
      arriving_at: string;
      origin: {
        iata_code: string;
        name: string;
      };
      destination: {
        iata_code: string;
        name: string;
      };
      marketing_carrier: {
        name: string;
        iata_code: string;
      };
      operating_carrier: {
        name: string;
      };
      aircraft: {
        name: string;
      };
    }>;
  }>;
}

interface FlightResultsProps {
  offers: FlightOffer[];
  onSelectOffer: (offer: FlightOffer) => void;
}

export function FlightResults({ offers, onSelectOffer }: FlightResultsProps) {
  return (
    <div className="container py-12">
      <h2 className="text-2xl font-bold mb-4">Flight Results</h2>
      {offers.length === 0 ? (
        <p>No flights found.</p>
      ) : (
        <ul className="space-y-4">
          {offers.map((offer) => (
            <li key={offer.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-semibold">
                    Price: {offer.total_amount} {offer.total_currency}
                  </p>
                  {offer.slices.map((slice, index) => (
                    <div key={index} className="mt-2">
                      <p className="font-bold">
                        {slice.segments[0].origin.name} (
                        {slice.segments[0].origin.iata_code}) to{" "}
                        {
                          slice.segments[slice.segments.length - 1].destination
                            .name
                        } (
                        {
                          slice.segments[slice.segments.length - 1].destination
                            .iata_code
                        })
                      </p>
                      <p>Duration: {slice.duration}</p>
                      <ul className="ml-4 mt-2 list-disc">
                        {slice.segments.map((segment, idx) => (
                          <li key={idx}>
                            {new Date(segment.departing_at).toLocaleString()} -{" "}
                            {new Date(segment.arriving_at).toLocaleString()} |{" "}
                            {segment.origin.iata_code} to{" "}
                            {segment.destination.iata_code} |{" "}
                            {segment.marketing_carrier.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Button onClick={() => onSelectOffer(offer)}>Select Flight</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
