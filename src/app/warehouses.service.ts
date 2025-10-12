import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'http://localhost:8081';

export interface Warehouse { id: string; name: string; location: string; }
export interface CreateWarehouse { name: string; location?: string; }

@Injectable({ providedIn: 'root' })
export class WarehousesService {
  constructor(private http: HttpClient) {}
  list() { return this.http.get<{success:boolean; data: Warehouse[]}>(`${base}/v1/warehouses`); }
  create(input: CreateWarehouse) { return this.http.post<{success:boolean; data: Warehouse}>(`${base}/v1/warehouses`, input); }
  remove(id: string) { return this.http.delete<{success:boolean}>(`${base}/v1/warehouses/${id}`); }
  get(id: string) { return this.http.get<{success:boolean; data: Warehouse}>(`${base}/v1/warehouses/${id}`); }
  update(id: string, input: CreateWarehouse) { return this.http.put<{success:boolean; data: Warehouse}>(`${base}/v1/warehouses/${id}`, input); }
}
