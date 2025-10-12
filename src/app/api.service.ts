import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const apiBase = (typeof window !== 'undefined' && (window as any).__BERJIS_API__) || 'http://localhost:8080';

export interface Me { id: string; email?: string; name?: string }

@Injectable({ providedIn: 'root' })
export class ApiService {
  me: Me | null = null;
  constructor(private http: HttpClient) {}
  verify() { return this.http.post<any>(`${apiBase}/v1/auth/verify`, {}, { withCredentials: true }); }
}
