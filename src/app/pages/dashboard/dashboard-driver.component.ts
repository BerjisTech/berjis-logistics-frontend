import { Component, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-driver',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-driver.component.html'
})
export class DashboardDriverComponent {
  private http = inject(HttpClient);
  driver = signal<any | null>(null);
  base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'http://localhost:8081';
  constructor(){ this.reload(); }
  reload(){ this.http.get<any>(`${this.base}/v1/drivers/me`).subscribe({ next:r=> this.driver.set(r?.data||null), error:()=> this.driver.set(null) }); }
  apply(ev: Event){ ev.preventDefault(); const f=ev.target as HTMLFormElement; const fullName=(f.elements.namedItem('fullName') as HTMLInputElement).value.trim()||undefined; const licenseNo=(f.elements.namedItem('licenseNo') as HTMLInputElement).value.trim()||undefined; const phone=(f.elements.namedItem('phone') as HTMLInputElement).value.trim()||undefined; this.http.post(`${this.base}/v1/drivers/apply`,{fullName,licenseNo,phone}).subscribe({ next:()=> this.reload() }); }
}





