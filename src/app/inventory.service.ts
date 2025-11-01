import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface InventoryItem { id: string; warehouseId: string; sku: string; name: string; quantity: number; }
export interface InventoryInput { sku: string; name: string; quantity: number; }

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient) {}
  list(warehouseId: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.get<{success:boolean; data: InventoryItem[]}>(`${base}/v1/warehouses/${warehouseId}/inventory`, { headers });
  }
  create(warehouseId: string, input: InventoryInput, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.post<{success:boolean; data: InventoryItem}>(`${base}/v1/warehouses/${warehouseId}/inventory`, input, { headers });
  }
  update(warehouseId: string, id: string, input: InventoryInput, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.put<{success:boolean; data: InventoryItem}>(`${base}/v1/warehouses/${warehouseId}/inventory/${id}`, input, { headers });
  }
  remove(warehouseId: string, id: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.delete<{success:boolean}>(`${base}/v1/warehouses/${warehouseId}/inventory/${id}`, { headers });
  }
}
