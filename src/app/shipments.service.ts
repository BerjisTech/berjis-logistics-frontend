import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface ShipmentSummary {
  id: string;
  status: string;
  trackingCode?: string;
  trackingEnabled: boolean;
  orderId?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  driverId?: string;
  driverName?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  nextStopSeq?: number;
  nextStopAddress?: string;
  stopCount: number;
}

export interface ShipmentRouteStop {
  id: string;
  seq: number;
  address: string;
  status: string;
  lat?: number;
  lng?: number;
  arrivedAt?: string;
  departedAt?: string;
}

export interface ShipmentPosition {
  lat: number;
  lng: number;
  ts: string;
}

export interface ShipmentDetail {
  delivery: {
    deliveryId: string;
    status: string;
    vehicleId?: string;
    plate?: string;
    lat?: number;
    lng?: number;
    lastSeen?: string;
    trackingCode?: string;
  };
  route: ShipmentRouteStop[];
  positions: ShipmentPosition[];
}

export interface CreateShipmentInput {
  orderId?: string;
  vehicleId?: string;
  driverId?: string;
  route?: { address: string }[];
}

@Injectable({ providedIn: 'root' })
export class ShipmentsService {
  constructor(private http: HttpClient) {}

  list(userId?: string) {
    return this.http.get<{ success: boolean; data: ShipmentSummary[] }>(`${base}/v1/shipments`, { headers: this.headers(userId) });
  }

  create(input: CreateShipmentInput, userId?: string) {
    return this.http.post<{ success: boolean; data: { id: string; status: string } }>(`${base}/v1/shipments`, input, { headers: this.headers(userId) });
  }

  track(id: string, userId?: string) {
    return this.http.get<{ success: boolean; data: ShipmentDetail }>(`${base}/v1/shipments/${encodeURIComponent(id)}/track`, { headers: this.headers(userId) });
  }

  addRouteStop(id: string, address: string, userId?: string) {
    return this.http.post<{ success: boolean; data: { seq: number } }>(`${base}/v1/shipments/${encodeURIComponent(id)}/route`, { address }, { headers: this.headers(userId) });
  }

  setRouteStopCoords(id: string, lat: number, lng: number, userId?: string) {
    return this.http.post<{ success: boolean }>(`${base}/v1/route-stops/${encodeURIComponent(id)}/coords`, { lat, lng }, { headers: this.headers(userId) });
  }

  private headers(userId?: string): HttpHeaders | undefined {
    return userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
  }
}
