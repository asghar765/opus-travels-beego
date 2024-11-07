import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    let airportsResponse;
    
    if (query.length === 3) {
      // If query is 3 characters, try to get by IATA code
      try {
        const airport = await duffel.airports.get(query.toUpperCase());
        airportsResponse = { data: [airport.data] };
      } catch (error) {
        console.error('IATA lookup error:', error);
        airportsResponse = { data: [] };
      }
    } else {
      // Otherwise do a general search
      try {
        airportsResponse = await duffel.airports.list();
        console.log('Airports response:', JSON.stringify(airportsResponse, null, 2));
        
        // Filter results client-side based on the query
        airportsResponse.data = airportsResponse.data.filter(airport => 
          airport.name.toLowerCase().includes(query.toLowerCase()) ||
          airport.city?.name?.toLowerCase().includes(query.toLowerCase()) ||
          airport.iata_code?.toLowerCase().includes(query.toLowerCase())
        );
      } catch (error) {
        console.error('List airports error:', error);
        throw error;
      }
    }

    // Format and return the results
    const formattedAirports = airportsResponse.data
      .filter(airport => airport.iata_code)
      .map(airport => ({
        code: airport.iata_code,
        name: airport.name,
        city: airport.city?.name || '',
        country: airport.city?.name || '', // Using city name as fallback
        type: 'airport' as const
      }))
      .slice(0, 5); // Limit to 5 results

    return NextResponse.json(formattedAirports);
  } catch (error) {
    console.error('Airport search error:', error);
    return NextResponse.json({ 
      error: 'Failed to search airports',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
