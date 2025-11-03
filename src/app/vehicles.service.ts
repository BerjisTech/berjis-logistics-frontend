import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface Vehicle { id: string; plate: string; kind?: string; capacityKg?: number; images?: string[] }
export interface VehicleInput { plate: string; kind?: string; capacityKg?: number; images?: string[] }

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  constructor(private http: HttpClient) {}
  list(userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.get<{success:boolean; data: Vehicle[]}>(`${base}/v1/vehicles`, { headers });
  }
  get(id: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.get<{success:boolean; data: Vehicle}>(`${base}/v1/vehicles/${id}`, { headers });
  }
  create(input: VehicleInput, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.post<{success:boolean; data: Vehicle}>(`${base}/v1/vehicles`, input, { headers });
  }
  update(id: string, input: Partial<VehicleInput>, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.put<{success:boolean; data: Vehicle}>(`${base}/v1/vehicles/${id}`, input, { headers });
  }
  remove(id: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.delete<{success:boolean}>(`${base}/v1/vehicles/${id}`, { headers });
  }
}
