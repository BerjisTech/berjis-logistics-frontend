import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehousesService, Warehouse } from './warehouses.service';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div style="font-family: Inter, Arial, sans-serif; padding: 32px; max-width: 960px; margin: 0 auto;">
    <h2>Storage</h2>
    <p>Browse available warehouses and storage locations.</p>
    <ul>
      <li *ngFor="let w of warehouses">
        <strong>{{w.name}}</strong>
        <span *ngIf="w.location">— {{w.location}}</span>
        <small *ngIf="w['state']"> — {{w['state']}}</small>
      </li>
    </ul>
  </div>
  `
})
export class StorageListComponent {
  private api = inject(WarehousesService);
  warehouses: Warehouse[] = [];
  constructor() {
    this.api.list().subscribe({ next: res => this.warehouses = res.data, error: () => this.warehouses = [] });
  }
}

