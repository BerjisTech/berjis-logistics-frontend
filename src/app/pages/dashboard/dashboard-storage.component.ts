import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WarehousesService, Warehouse } from '../../warehouses.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-dashboard-storage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-storage.component.html'
})
export class DashboardStorageComponent {
  private api = inject(WarehousesService);
  private core = inject(ApiService);
  userId?: string;
  warehouses: Warehouse[] = [];
  loading = true;
  constructor(){
    this.core.verify().subscribe({ next: (r:any)=>{ this.userId = this.core.userIdFrom(r); this.load(); }, error: ()=> this.load() });
  }
  load(){
    this.api.list(this.userId).subscribe({ next: r=> { this.warehouses = r.data||[]; this.loading=false; }, error: ()=> { this.warehouses=[]; this.loading=false; } });
  }
}


