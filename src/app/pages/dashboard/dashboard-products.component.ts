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
  templateUrl: './dashboard-products.component.html'
})
export class DashboardProductsComponent {
  private wh = inject(WarehousesService);
  private inv = inject(InventoryService);
  private core = inject(ApiService);
  userId?: string;
  myWarehouses = signal<Warehouse[]>([]);
  inventory = signal<InventoryItem[]>([]);
  selectedWarehouseId = signal<string>('');
  constructor(){ this.core.verify().subscribe({ next:(r:any)=>{ this.userId = this.core.userIdFrom(r); this.refreshWarehouses(); }, error:()=> this.refreshWarehouses() }); }
  refreshWarehouses(){ this.wh.list(this.userId).subscribe({ next:r=> { const rows=r.data||[]; this.myWarehouses.set(rows); if (!this.selectedWarehouseId() && rows.length) { this.selectedWarehouseId.set(rows[0].id); this.refreshInventory(); } }, error:()=> { this.myWarehouses.set([]); this.inventory.set([]); } }); }
  onSelect(id: string){ this.selectedWarehouseId.set(id); this.refreshInventory(); }
  refreshInventory(){ const wid=this.selectedWarehouseId(); if (!wid) { this.inventory.set([]); return; } this.inv.list(wid, this.userId).subscribe({ next:r=> this.inventory.set(r.data||[]), error:()=> this.inventory.set([]) }); }
  addInventory(ev: Event){ ev.preventDefault(); const f=ev.target as HTMLFormElement; const wid=this.selectedWarehouseId(); if(!wid) return; const sku=(f.elements.namedItem('sku') as HTMLInputElement).value.trim(); const name=(f.elements.namedItem('name') as HTMLInputElement).value.trim(); const qr=(f.elements.namedItem('quantity') as HTMLInputElement).value; const quantity=qr?parseInt(qr,10):0; if(!sku||!name) return; this.inv.create(wid,{sku,name,quantity},this.userId).subscribe({ next:()=>{ f.reset(); this.refreshInventory(); } }); }
  removeInventory(id: string){ const wid=this.selectedWarehouseId(); if(!wid) return; this.inv.remove(wid,id,this.userId).subscribe({ next:()=> this.refreshInventory() }); }
}


