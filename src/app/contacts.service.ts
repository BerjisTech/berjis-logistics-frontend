import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'http://localhost:8081';

export interface Contact {
  id: string;
  kind: 'client' | 'supplier' | 'wholesaler' | 'other';
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export interface ContactInput {
  kind: 'client' | 'supplier' | 'wholesaler' | 'other';
  name: string;
  email?: string; phone?: string; company?: string; notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {
  constructor(private http: HttpClient) {}
  list(userId?: string, kind?: string) {
    let headers = userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
    let params = new HttpParams(); if (kind) params = params.set('kind', kind);
    return this.http.get<{success:boolean; data: Contact[]}>(`${base}/v1/contacts`, { headers, params });
  }
  create(input: ContactInput, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
    return this.http.post<{success:boolean; data: Contact}>(`${base}/v1/contacts`, input, { headers });
  }
  update(id: string, input: Partial<ContactInput>, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
    return this.http.put<{success:boolean; data: Contact}>(`${base}/v1/contacts/${id}`, input, { headers });
  }
  remove(id: string, userId?: string) {
    const headers = userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
    return this.http.delete<{success:boolean}>(`${base}/v1/contacts/${id}`, { headers });
  }
}

