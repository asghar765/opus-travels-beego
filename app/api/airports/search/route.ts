import { NextResponse } from 'next/server';
import { airports } from 'lib/airports';

interface FormattedLocation {
  code: string;
  name: string;
  city: string;
  country: string;
  type: 'airport' | 'city';
}

// Major cities for boosting scores
const MAJOR_CITIES = new Set([
  'london', 'islamabad', 'lahore', 'karachi',
  'dubai', 'new york', 'paris', 'tokyo'
]);

function getMatchScore(str: string | undefined | null, searchStr: string, context: { city?: string; type?: string }): number {
  if (!str) return 0;
  str = str.toLowerCase();
  searchStr = searchStr.toLowerCase();
  
  let score = 0;
  
  // Exact match gets highest score
  if (str === searchStr) score = 100;
  // IATA code match gets very high score
  else if (str.length === 3 && str === searchStr) score = 95;
  // Start of word match gets high score
  else if (str.split(/[\s-]+/).some(word => word.startsWith(searchStr))) score = 90;
  // Start match gets good score
  else if (str.startsWith(searchStr)) score = 80;
  // Contains match gets lower score
  else if (str.includes(searchStr)) score = 60;

  // Boost scores based on context
  if (context.city && MAJOR_CITIES.has(context.city.toLowerCase())) {
    score += 30;
  }
  if (context.type === 'large_airport') {
    score += 20;
  }

  return score;
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

    // Pre-filter airports to reduce the number of iterations
    const filteredAirports = airports.filter(airport => 
      airport.name.toLowerCase().includes(query) ||
      airport.municipality.toLowerCase().includes(query) ||
      airport.iata_code.toLowerCase().includes(query)
    );

    // Score and sort only the filtered airports
    const scoredAirports = filteredAirports
      .map(airport => {
        const context = {
          city: airport.municipality,
          type: airport.type
        };

        const cityScore = getMatchScore(airport.municipality, query, context);
        const nameScore = getMatchScore(airport.name, query, context);
        const codeScore = getMatchScore(airport.iata_code, query, context);
        
        const baseScore = Math.max(cityScore, nameScore, codeScore);
        
        // Additional boost for international airports
        const isInternationalAirport = airport.name.toLowerCase().includes('international');
        const finalScore = baseScore + (isInternationalAirport ? 10 : 0);
        
        if (finalScore > 0) {
          console.log('Match found:', {
            name: airport.name,
            city: airport.municipality,
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
            city: airport.municipality || '',
            country: airport.iso_country,
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
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
