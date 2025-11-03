import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}
  uploadImages(files: File[] | FileList, userId?: string) {
    const arr: File[] = Array.from(files as any);
    const fd = new FormData();
    for (const f of arr) fd.append('files', f, f.name);
    const headers = userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
    return this.http.post<{success:boolean; data:{urls:string[]}}>(`${base}/v1/uploads/images`, fd, { headers });
  }
}

