export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteEstimate {
  distanceKm: number;
  durationMinutes: number;
  estimatedCost: number;
}

export class RoutingService {
  /**
   * Calculates route metrics between pickup and delivery coordinates.
   * Keeps routing provider (e.g. OSRM / Google Maps) abstracted behind this service layer.
   */
  async calculateRoute(origin: Coordinates, destination: Coordinates): Promise<RouteEstimate> {
    // Basic haversine baseline formula for Phase 1 architecture
    const R = 6371; // Earth's radius in km
    const dLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
    const dLon = ((destination.longitude - origin.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.latitude * Math.PI) / 180) *
        Math.cos((destination.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c * 1.2 * 10) / 10; // Approx driving road factor

    const durationMinutes = Math.round((distanceKm / 60) * 60);
    const estimatedCost = Math.round((50 + distanceKm * 1.5) * 100) / 100;

    return {
      distanceKm,
      durationMinutes,
      estimatedCost,
    };
  }
}

export const routingService = new RoutingService();
