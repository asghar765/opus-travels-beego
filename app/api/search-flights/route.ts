import { NextResponse } from 'next/server';
import { duffel } from 'lib/duffel';
import { z } from 'zod';

const searchParamsSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  adults: z.number().int().min(1).default(1),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = searchParamsSchema.parse(body);

    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin: params.origin,
          destination: params.destination,
          departure_date: params.departureDate,
        },
        ...(params.returnDate
          ? [
              {
                origin: params.destination,
                destination: params.origin,
                departure_date: params.returnDate,
              },
            ]
          : []),
      ],
      passengers: [{ type: 'adult' }],
      cabin_class: params.cabinClass,
      return_offers: true
    });

    const offers = await duffel.offers.list({ 
      offer_request_id: offerRequest.data.id,
      sort: 'total_amount',
      limit: 50
    });

    return NextResponse.json({
      success: true,
      requestId: offerRequest.data.id,
      offers: offers.data
    });
  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    );
  }
}
