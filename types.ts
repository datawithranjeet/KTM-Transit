
export interface BusStop {
  id: number;
  name: string;
  distanceFromPreviousKm: number; // in km
  typicalTravelTimeMinutes: number; // minutes from previous stop
  landmark?: string;
}

export interface RouteData {
  routeId?: string;
  busNumber: string;
  routeName: string; // e.g., "Ring Road - Clockwise"
  stops: BusStop[];
  frequencyMinutes: number; // e.g., every 10 minutes
  firstBusTime: string; // "05:00"
  lastBusTime: string; // "20:00"
  description: string;
  trafficCondition: 'Light' | 'Moderate' | 'Heavy';
  trafficAnalysis: string;
  sourceUrls?: string[];
}

export interface CrowdData {
  hour: string;
  level: number; // 0-100
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
