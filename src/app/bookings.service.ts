import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface Booking {
  id: string;
  warehouseId: string;
  tenantUserId: string;
  spaceReserved?: number;
  startDate: string;
  endDate?: string;
  pricePerDay?: number;
  status: string;
}

export interface BookingInput {
  startDate: string;
  endDate?: string;
  spaceReserved?: number;
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  constructor(private http: HttpClient) {}
  listMine(userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
    return this.http.get<{success:boolean; data: Booking[]}>(`${base}/v1/bookings`, { headers });
  }
  listForWarehouse(warehouseId: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
    return this.http.get<{success:boolean; data: Booking[]}>(`${base}/v1/warehouses/${warehouseId}/bookings`, { headers });
  }
  create(warehouseId: string, input: BookingInput, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
    return this.http.post<{success:boolean; data: Booking}>(`${base}/v1/warehouses/${warehouseId}/bookings`, input, { headers });
  }
  cancel(id: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
    return this.http.delete<{success:boolean}>(`${base}/v1/bookings/${id}`, { headers });
  }
}

