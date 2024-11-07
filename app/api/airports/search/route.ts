import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';
import type { Airport } from '@duffel/api/types';

interface FormattedLocation {
  code: string;
  name: string;
  city: string;
  country: string;
  type: 'airport' | 'city';
}

function getMatchScore(str: string | undefined | null, searchStr: string): number {
  if (!str) return 0;
  str = str.toLowerCase();
  searchStr = searchStr.toLowerCase();
  
  // Exact match gets highest score
  if (str === searchStr) return 100;
  // IATA code match gets very high score
  if (str.length === 3 && str === searchStr) return 95;
  // Start of word match gets high score
  const words = str.split(/[\s-]+/);
  if (words.some(word => word.startsWith(searchStr))) return 90;
  // Start match gets good score
  if (str.startsWith(searchStr)) return 80;
  // Contains match gets lower score
  if (str.includes(searchStr)) return 60;
  // No match gets zero
  return 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParam = searchParams.get('query');

  if (!queryParam) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const query = queryParam.toLowerCase();

  try {
    console.log(`Starting location search with query: ${query}`);

    // Try to get specific airport first if it's a 3-letter code
    if (query.length === 3) {
      try {
        const response = await duffel.airports.get(query.toUpperCase());
        if (response.data && response.data.iata_code) {
          const result = {
            code: response.data.iata_code,
            name: response.data.name,
            city: response.data.city_name || '',
            country: response.data.iata_country_code || '',
            type: 'airport' as const
          };
          console.log('Found exact match:', result);
          return NextResponse.json([result]);
        }
      } catch (error) {
        console.log('Specific airport lookup failed, falling back to search');
      }
    }

    // Get airports list with maximum limit
    const response = await duffel.airports.list({
      limit: 200
    });

    console.log(`Fetched ${response.data.length} airports`);

    // Filter and score airports
    const scoredAirports = response.data
      .filter(airport => airport.iata_code && airport.name)
      .map(airport => {
        const cityScore = getMatchScore(airport.city_name, query);
        const nameScore = getMatchScore(airport.name, query);
        const codeScore = getMatchScore(airport.iata_code, query);
        const cityIataScore = airport.city?.iata_code ? 
          getMatchScore(airport.city.iata_code, query) : 0;
        
        // Boost score for major airports and exact city matches
        const isMajorAirport = airport.name.toLowerCase().includes('international');
        const isExactCityMatch = airport.city_name?.toLowerCase() === query;
        const baseScore = Math.max(cityScore, nameScore, codeScore, cityIataScore);
        const finalScore = baseScore + 
          (isMajorAirport ? 5 : 0) + 
          (isExactCityMatch ? 10 : 0);
        
        if (finalScore > 0) {
          console.log('Match found:', {
            name: airport.name,
            city: airport.city_name,
            code: airport.iata_code,
            score: finalScore,
            matchType: finalScore >= 90 ? 'word start' : 
                      finalScore >= 80 ? 'start' : 
                      finalScore >= 60 ? 'contains' : 'exact'
          });
        }

        return {
          score: finalScore,
          location: {
            code: airport.iata_code,
            name: airport.name,
            city: airport.city_name || '',
            country: airport.iata_country_code || '',
            type: 'airport' as const
          }
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    console.log(`Found ${scoredAirports.length} matches`);

    // Get top 5 results
    const results = scoredAirports
      .map(item => item.location)
      .slice(0, 5);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Location search error:', error);
    return NextResponse.json({ 
      error: 'Failed to search locations',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        // @ts-ignore
        meta: error.meta,
        // @ts-ignore
        errors: error.errors
      } : String(error)
    }, { status: 500 });
  }
}
