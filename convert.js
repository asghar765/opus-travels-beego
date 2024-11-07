const fs = require('fs');
const csv = require('csv-parse/sync');

// Read the CSV file
const input = fs.readFileSync('airport-codes.csv');

// Parse CSV
const records = csv.parse(input, {
  columns: true,
  skip_empty_lines: true
});

// Transform records
const airports = records.map(record => {
  const [lat, lon] = record.coordinates.replace('"', '').split(' ');
  return {
    ident: record.ident,
    type: record.type,
    name: record.name,
    latitude_deg: parseFloat(lat),
    longitude_deg: parseFloat(lon),
    elevation_ft: parseInt(record.elevation_ft) || 0,
    continent: record.continent,
    iso_country: record.iso_country,
    iso_region: record.iso_region,
    municipality: record.municipality,
    iata_code: record.iata_code
  };
});

// Write to TypeScript file
const tsContent = `// Data converted from airport-codes.csv
export const airports = ${JSON.stringify(airports, null, 2)};`;

fs.writeFileSync('lib/airports.ts', tsContent);
console.log('Conversion complete!');
