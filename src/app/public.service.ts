import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface PublicWarehouse {
  id: string;
  name: string;
  location?: string;
  lat?: number;
  lng?: number;
  kind?: string;
  isMultiUnit: boolean;
  state: string;
  priceAmount?: number;
  currency?: string;
  pricingMode?: string;
  areaSqm?: number;
  distanceKm?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicService {
  constructor(private http: HttpClient) {}
  searchWarehouses(params: { q?: string; near?: string; radius_km?: number; page?: number; limit?: number }) {
    let p = new HttpParams();
    if (params.q) p = p.set('q', params.q);
    if (params.near) p = p.set('near', params.near);
    if (params.radius_km != null) p = p.set('radius_km', String(params.radius_km));
    if (params.page != null) p = p.set('page', String(params.page));
    if (params.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<{success:boolean; data: PublicWarehouse[]}>(`${base}/v1/public/warehouses`, { params: p });
  }
  searchProducts(params: { q?: string; near?: string; radius_km?: number; page?: number; limit?: number }) {
    let p = new HttpParams();
    if (params.q) p = p.set('q', params.q);
    if (params.near) p = p.set('near', params.near);
    if (params.radius_km != null) p = p.set('radius_km', String(params.radius_km));
    if (params.page != null) p = p.set('page', String(params.page));
    if (params.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<{success:boolean; data: any[]}>(`${base}/v1/public/products`, { params: p });
  }
  searchTransport(params: { q?: string; min_capacity_kg?: number; page?: number; limit?: number }) {
    let p = new HttpParams();
    if (params.q) p = p.set('q', params.q);
    if (params.min_capacity_kg != null) p = p.set('min_capacity_kg', String(params.min_capacity_kg));
    if (params.page != null) p = p.set('page', String(params.page));
    if (params.limit != null) p = p.set('limit', String(params.limit));
    return this.http.get<{success:boolean; data: any[]}>(`${base}/v1/public/transport`, { params: p });
  }
}
