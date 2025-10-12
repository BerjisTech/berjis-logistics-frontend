import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'http://localhost:8081';

export interface InventoryItem { id: string; warehouseId: string; sku: string; name: string; quantity: number; }
export interface InventoryInput { sku: string; name: string; quantity: number; }

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient) {}
  list(warehouseId: string) { return this.http.get<{success:boolean; data: InventoryItem[]}>(`${base}/v1/warehouses/${warehouseId}/inventory`); }
  create(warehouseId: string, input: InventoryInput) { return this.http.post<{success:boolean; data: InventoryItem}>(`${base}/v1/warehouses/${warehouseId}/inventory`, input); }
  update(warehouseId: string, id: string, input: InventoryInput) { return this.http.put<{success:boolean; data: InventoryItem}>(`${base}/v1/warehouses/${warehouseId}/inventory/${id}`, input); }
  remove(warehouseId: string, id: string) { return this.http.delete<{success:boolean}>(`${base}/v1/warehouses/${warehouseId}/inventory/${id}`); }
}

