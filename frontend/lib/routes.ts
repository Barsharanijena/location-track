/**
 * Predefined simulation routes across Maharashtra.
 * Each route is an array of [lat, lng] waypoints.
 */

import { Coordinates } from "@/types/index";

export interface SimulationRoute {
  id: string;
  label: string;
  waypoints: Coordinates[];
}

export const SIMULATION_ROUTES: SimulationRoute[] = [
  {
    id: "pune-station-to-fc-road",
    label: "Pune Railway Station → FC Road",
    waypoints: [
      { lat: 18.5284, lng: 73.8740 }, // Pune Railway Station
      { lat: 18.5304, lng: 73.8657 },
      { lat: 18.5326, lng: 73.8580 },
      { lat: 18.5355, lng: 73.8480 },
      { lat: 18.5380, lng: 73.8413 }, // Deccan Gymkhana
      { lat: 18.5400, lng: 73.8400 }, // FC Road
    ],
  },
  {
    id: "mumbai-cst-to-bandra",
    label: "Mumbai CST → Bandra",
    waypoints: [
      { lat: 18.9398, lng: 72.8354 }, // CST
      { lat: 18.9640, lng: 72.8252 },
      { lat: 18.9900, lng: 72.8250 },
      { lat: 19.0144, lng: 72.8291 }, // Dadar
      { lat: 19.0443, lng: 72.8415 }, // Bandra
    ],
  },
  {
    id: "nashik-cbs-to-panchavati",
    label: "Nashik CBS → Panchavati",
    waypoints: [
      { lat: 19.9975, lng: 73.7898 }, // CBS Nashik
      { lat: 20.0030, lng: 73.7850 },
      { lat: 20.0120, lng: 73.7820 },
      { lat: 20.0176, lng: 73.7797 }, // Panchavati
    ],
  },
];
