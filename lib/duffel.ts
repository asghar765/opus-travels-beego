import { Duffel } from '@duffel/api';

if (!process.env.NEXT_PUBLIC_DUFFEL_API_KEY) {
  throw new Error('NEXT_PUBLIC_DUFFEL_API_KEY is not defined');
}

const duffel = new Duffel({
  token: process.env.NEXT_PUBLIC_DUFFEL_API_KEY
});

// Set API version
duffel.apiVersion = 'v1';

export { duffel };
