import { LocationResponse } from '@app/models/locations/location-response.model';

export const MOCK_LOCATIONS: LocationResponse[] = [
  {
    id: 'demo-location-1',
    address: '14 Baratashvili Street, Tbilisi',
    description: 'A welcoming restaurant in the heart of Tbilisi.',
    totalCapacity: 48,
    averageOccupancy: '65%',
    imageUrl: 'assets/img/locations/baratashvili-street-14.jpg',
    rating: 4.8,
  },
  {
    id: 'demo-location-2',
    address: '48 Rustaveli Avenue, Tbilisi',
    description: 'Seasonal Georgian cuisine on Rustaveli Avenue.',
    totalCapacity: 36,
    averageOccupancy: '72%',
    imageUrl: 'assets/img/locations/rustaveli-avenue-48.jpg',
    rating: 4.7,
  },
  {
    id: 'demo-location-3',
    address: '9 Abashidze Street, Tbilisi',
    description: 'A relaxed spot for fresh, locally sourced food.',
    totalCapacity: 42,
    averageOccupancy: '58%',
    imageUrl: 'assets/img/locations/abashidze-street-9.jpg',
    rating: 4.9,
  },
];
