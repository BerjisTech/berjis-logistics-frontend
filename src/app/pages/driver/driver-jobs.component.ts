import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-driver-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-jobs.component.html'
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
