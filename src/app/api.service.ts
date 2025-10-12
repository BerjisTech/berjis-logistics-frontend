import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Use same-origin proxy to Core API via Nginx (/api)
const apiBase = '/api';

export interface Me { id: string; email?: string; name?: string }

@Injectable({ providedIn: 'root' })
export class ApiService {
  me: Me | null = null;
  constructor(private http: HttpClient) {}
  verify() { return this.http.post<any>(`${apiBase}/v1/auth/verify`, {}, { withCredentials: true }); }
}
