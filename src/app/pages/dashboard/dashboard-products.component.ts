import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehousesService, Warehouse } from '../../warehouses.service';
import { InventoryService, InventoryItem } from '../../inventory.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-dashboard-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Products & Inventory</h2>
    <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
      <label>Warehouse
        <select [ngModel]="selectedWarehouseId()" (ngModelChange)="onSelect($event)" style="margin-left:8px; padding:6px; border:1px solid #ddd; border-radius:6px;">
          <option *ngFor="let w of myWarehouses()" [ngValue]="w.id">{{w.name}}</option>
        </select>
      </label>
    </div>
    <form (submit)="addInventory($event)" *ngIf="selectedWarehouseId()" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;">
      <input name="sku" placeholder="SKU" required style="padding:8px; border:1px solid #ddd; border-radius:8px;" />
      <input name="name" placeholder="Name" required style="padding:8px; border:1px solid #ddd; border-radius:8px; min-width:220px;" />
      <input name="quantity" type="number" placeholder="Qty" style="padding:8px; border:1px solid #ddd; border-radius:8px; width:120px;" />
      <button type="submit">Add Item</button>
    </form>
    <table *ngIf="selectedWarehouseId()" style="width:100%; border-collapse: collapse;">
      <thead>
        <tr style="text-align:left; border-bottom:1px solid #eee;">
          <th style="padding:8px;">SKU</th><th style="padding:8px;">Name</th><th style="padding:8px;">Qty</th><th style="padding:8px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let it of inventory()" style="border-bottom:1px solid #f5f5f5;">
          <td style="padding:8px;">{{it.sku}}</td>
          <td style="padding:8px;">{{it.name}}</td>
          <td style="padding:8px;">{{it.quantity}}</td>
          <td style="padding:8px;">
            <button (click)="removeInventory(it.id)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class DashboardProductsComponent {
  private wh = inject(WarehousesService);
  private inv = inject(InventoryService);
  private core = inject(ApiService);
  userId?: string;
  myWarehouses = signal<Warehouse[]>([]);
  inventory = signal<InventoryItem[]>([]);
  selectedWarehouseId = signal<string>('');
  constructor(){ this.core.verify().subscribe({ next:(r:any)=>{ this.userId = r?.data?.uid?.toString(); this.refreshWarehouses(); }, error:()=> this.refreshWarehouses() }); }
  refreshWarehouses(){ this.wh.list(this.userId).subscribe({ next:r=> { const rows=r.data||[]; this.myWarehouses.set(rows); if (!this.selectedWarehouseId() && rows.length) { this.selectedWarehouseId.set(rows[0].id); this.refreshInventory(); } }, error:()=> { this.myWarehouses.set([]); this.inventory.set([]); } }); }
  onSelect(id: string){ this.selectedWarehouseId.set(id); this.refreshInventory(); }
  refreshInventory(){ const wid=this.selectedWarehouseId(); if (!wid) { this.inventory.set([]); return; } this.inv.list(wid, this.userId).subscribe({ next:r=> this.inventory.set(r.data||[]), error:()=> this.inventory.set([]) }); }
  addInventory(ev: Event){ ev.preventDefault(); const f=ev.target as HTMLFormElement; const wid=this.selectedWarehouseId(); if(!wid) return; const sku=(f.elements.namedItem('sku') as HTMLInputElement).value.trim(); const name=(f.elements.namedItem('name') as HTMLInputElement).value.trim(); const qr=(f.elements.namedItem('quantity') as HTMLInputElement).value; const quantity=qr?parseInt(qr,10):0; if(!sku||!name) return; this.inv.create(wid,{sku,name,quantity},this.userId).subscribe({ next:()=>{ f.reset(); this.refreshInventory(); } }); }
  removeInventory(id: string){ const wid=this.selectedWarehouseId(); if(!wid) return; this.inv.remove(wid,id,this.userId).subscribe({ next:()=> this.refreshInventory() }); }
}

