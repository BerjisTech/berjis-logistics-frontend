import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface DashboardAnalytics {
  storageUtilisation: number;
  otifPercentage: number;
  marketplaceVelocity: number;
  fleetAvailable: number;
  invoiceDue: number;
  campaignsRunning: number;
  shipmentsActive: number;
  shipmentsCompleted24h: number;
}

export interface ShipmentsAnalytics {
  active: number;
  running: number;
  delayed: number;
  completed24h: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  private headers(userId?: string): HttpHeaders | undefined {
    return userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
  }

  dashboard(userId?: string) {
    return this.http.get<{ success: boolean; data: DashboardAnalytics }>(`${base}/v1/analytics/dashboard`, { headers: this.headers(userId) });
  }

  shipments(userId?: string) {
    return this.http.get<{ success: boolean; data: ShipmentsAnalytics }>(`${base}/v1/analytics/shipments`, { headers: this.headers(userId) });
  }
}
