import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-driver-jobs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="font-family: Inter, Arial, sans-serif; padding: 24px; max-width: 1100px; margin: 0 auto;">
      <h2>Driver Job Board</h2>
      <div style="display:flex; gap:12px; align-items:center;">
        <button (click)="reload()">Refresh</button>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-top:16px;">
        <div style="grid-column: 1 / -1;"><h3 style="margin:8px 0;">Available Jobs</h3></div>
        <div *ngFor="let j of posted()" style="border:1px solid #eee; border-radius:10px; padding:12px;">
          <div><strong>{{ j.cargoDesc || 'Job' }}</strong></div>
          <div>From: {{ j.pickupAddress || '-' }}</div>
          <div>To: {{ j.deliveryAddress || '-' }}</div>
          <div>Vehicle: {{ j.vehicleKind || 'any' }} — {{ j.capacityKg || '-' }} kg</div>
          <div>Payment: {{ j.payment || '-' }} {{ j.currency || '' }}</div>
          <div style="margin-top:8px;"><button (click)="accept(j.id)">Accept</button></div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-top:24px;">
        <div style="grid-column: 1 / -1;"><h3 style="margin:8px 0;">My Jobs</h3></div>
        <div *ngFor="let j of mine()" style="border:1px solid #eee; border-radius:10px; padding:12px;">
          <div><strong>{{ j.cargoDesc || 'Job' }}</strong> — <em>{{ j.status }}</em></div>
          <div>From: {{ j.pickupAddress || '-' }}</div>
          <div>To: {{ j.deliveryAddress || '-' }}</div>
        </div>
      </div>
    </div>
  `
})
export class DriverJobsPageComponent {
  private http = inject(HttpClient);
  base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'http://localhost:8081';
  posted = signal<any[]>([]);
  mine = signal<any[]>([]);

  constructor(){ this.reload(); }

  reload(){
    this.http.get<any>(`${this.base}/v1/transport/jobs`).subscribe({ next: r => this.posted.set(r?.data || []) });
    this.http.get<any>(`${this.base}/v1/transport/jobs?mine=1`).subscribe({ next: r => this.mine.set(r?.data || []) });
  }

  accept(id: string){
    this.http.put(`${this.base}/v1/transport/jobs/${encodeURIComponent(id)}/assign`, {}).subscribe({ next: () => this.reload() });
  }
}