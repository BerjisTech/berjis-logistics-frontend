import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  state?: string;
  lat?: number;
  lng?: number;
  isMultiUnit?: boolean;
  priceAmount?: number;
  currency?: string;
  pricingMode?: string;
  areaSqm?: number;
}
export interface CreateWarehouse {
  name: string;
  location?: string;
  state?: string;
  lat?: number;
  lng?: number;
  isMultiUnit?: boolean;
  priceAmount?: number;
  currency?: string;
  pricingMode?: string;
  areaSqm?: number;
}

@Injectable({ providedIn: 'root' })
export class WarehousesService {
  constructor(private http: HttpClient) {}
  list(userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.get<{success:boolean; data: Warehouse[]}>(`${base}/v1/warehouses`, { headers });
  }
  create(input: CreateWarehouse, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.post<{success:boolean; data: Warehouse}>(`${base}/v1/warehouses`, input, { headers });
  }
  remove(id: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.delete<{success:boolean}>(`${base}/v1/warehouses/${id}`, { headers });
  }
  get(id: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.get<{success:boolean; data: Warehouse}>(`${base}/v1/warehouses/${id}`, { headers });
  }
  update(id: string, input: CreateWarehouse, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.put<{success:boolean; data: Warehouse}>(`${base}/v1/warehouses/${id}`, input, { headers });
  }
}
