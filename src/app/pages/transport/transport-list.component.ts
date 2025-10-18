import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicService } from '../../public.service';

@Component({
  selector: 'app-transport-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transport-list.component.html'
})
export class TransportListPageComponent {
  q = '';
  minCapacity?: number;
  items: any[] = [];
  loading = false;
  constructor(private api: PublicService) { this.search(); }
  search() {
    this.loading = true;
    this.api.searchTransport({ q: this.q || undefined, min_capacity_kg: this.minCapacity }).subscribe({
      next: res => { this.items = res.data || []; this.loading = false; },
      error: () => { this.items = []; this.loading = false; }
    });
  }
}

