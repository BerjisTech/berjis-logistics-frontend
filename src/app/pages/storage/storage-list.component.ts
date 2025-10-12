import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehousesService, Warehouse } from '../../warehouses.service';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storage-list.component.html'
})
export class StorageListPageComponent {
  private api = inject(WarehousesService);
  warehouses: Warehouse[] = [];
  constructor() {
    this.api.list().subscribe({ next: res => this.warehouses = res.data, error: () => this.warehouses = [] });
  }
}

