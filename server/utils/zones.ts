export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface Zone {
  name: string;
  bounds: Bounds;
}

const zones: Zone[] = [
  {
    name: "South Dallas",
    bounds: {
      minLat: 32.67,
      maxLat: 32.72,
      minLng: -96.85,
      maxLng: -96.75
    }
  },
  {
    name: "Bangalore",
    bounds: {
      minLat: 12.80,
      maxLat: 13.20,
      minLng: 77.40,
      maxLng: 77.80
    }
  },
];

export default zones;
