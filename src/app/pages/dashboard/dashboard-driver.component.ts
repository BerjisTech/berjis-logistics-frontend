import { Component, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-driver',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <h2>Driver</h2>
    <div *ngIf="!driver()">
      <p>Apply to be a driver.</p>
      <form (submit)="apply($event)" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <input name="fullName" placeholder="Full name" style="padding:8px; border:1px solid #ddd; border-radius:8px;" />
        <input name="licenseNo" placeholder="License No" style="padding:8px; border:1px solid #ddd; border-radius:8px;" />
        <input name="phone" placeholder="Phone" style="padding:8px; border:1px solid #ddd; border-radius:8px;" />
        <button type="submit">Apply</button>
      </form>
    </div>
    <div *ngIf="driver()">
      <p>Status: <strong>{{driver()?.status}}</strong></p>
      <p>Name: {{driver()?.fullName}} <span *ngIf="driver()?.phone"> — {{driver()?.phone}}</span></p>
      <button (click)="reload()">Refresh</button> <a routerLink="/driver-jobs" style="margin-left:8px;">Job Board</a>
    </div>
  `
})
export class DashboardDriverComponent {
  private http = inject(HttpClient);
  driver = signal<any | null>(null);
  base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'http://localhost:8081';
  constructor(){ this.reload(); }
  reload(){ this.http.get<any>(`${this.base}/v1/drivers/me`).subscribe({ next:r=> this.driver.set(r?.data||null), error:()=> this.driver.set(null) }); }
  apply(ev: Event){ ev.preventDefault(); const f=ev.target as HTMLFormElement; const fullName=(f.elements.namedItem('fullName') as HTMLInputElement).value.trim()||undefined; const licenseNo=(f.elements.namedItem('licenseNo') as HTMLInputElement).value.trim()||undefined; const phone=(f.elements.namedItem('phone') as HTMLInputElement).value.trim()||undefined; this.http.post(`${this.base}/v1/drivers/apply`,{fullName,licenseNo,phone}).subscribe({ next:()=> this.reload() }); }
}




