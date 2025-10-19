import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-public-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-tracking.component.html'
})
export class PublicTrackingPageComponent {
  code = '';
  loading = false;
  error: string | null = null;
  result: any = null;

  constructor(private http: HttpClient) {}

  track() {
    this.error = null; this.result = null; this.loading = true;
    const code = (this.code || '').trim();
    if (!code) { this.loading = false; this.error = 'Enter a tracking code'; return; }
    this.http.get(`/v1/public/track/${encodeURIComponent(code)}`).subscribe({
      next: (res: any) => { this.result = res?.data || res; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Not found'; this.loading = false; }
    });
  }
}