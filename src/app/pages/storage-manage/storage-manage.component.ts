import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehousesService, Warehouse } from '../../warehouses.service';
import { InventoryService } from '../../inventory.service';
import { ApiService } from '../../api.service';
import { MapPickerComponent } from '../../components/map-picker/map-picker.component';

@Component({
  selector: 'app-storage-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, MapPickerComponent],
  templateUrl: './storage-manage.component.html'
})
export class StorageManagePageComponent {
  private wh = inject(WarehousesService);
  private inv = inject(InventoryService);
  private core = inject(ApiService);
  warehouses: Warehouse[] = [];
  selected: Warehouse | null = null;
  units: any[] = [];
  staff: any[] = [];
  userId: string | undefined;
  lat?: number; lng?: number;

  constructor() {
    this.core.verify().subscribe({ next: (r: any) => this.userId = r?.data?.uid?.toString(), error: () => {} });
    this.wh.list().subscribe({ next: r => this.warehouses = r.data, error: () => this.warehouses = [] });
  }

  onMapSelected(p: {lat:number; lng:number}) {
    this.lat = p.lat; this.lng = p.lng;
    const latInput = document.querySelector('input[name="lat"]') as HTMLInputElement;
    const lngInput = document.querySelector('input[name="lng"]') as HTMLInputElement;
    if (latInput) latInput.value = p.lat.toFixed(6);
    if (lngInput) lngInput.value = p.lng.toFixed(6);
  }

  onCreateWarehouse(ev: Event) {
    ev.preventDefault(); const f = ev.target as HTMLFormElement;
    const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim();
    const location = (f.elements.namedItem('location') as HTMLInputElement).value.trim();
    const state = (f.elements.namedItem('state') as HTMLSelectElement)?.value || 'available';
    const isMultiUnit = (f.elements.namedItem('isMultiUnit') as HTMLInputElement)?.checked || false;
    if (!name) return;
    this.wh.create({ name, location, lat: this.lat as any, lng: this.lng as any, state: state as any, isMultiUnit: isMultiUnit as any } as any, this.userId)
      .subscribe({ next: () => { f.reset(); this.wh.list().subscribe(r => this.warehouses = r.data); }, error: () => {} });
  }

  select(w: Warehouse) { this.selected = w; this.refreshUnits(); this.refreshStaff(); }

  onCreateUnit(ev: Event) {
    ev.preventDefault(); if (!this.selected) return; const f = ev.target as HTMLFormElement;
    const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim();
    const areaRaw = (f.elements.namedItem('areaSqm') as HTMLInputElement).value;
    const state = (f.elements.namedItem('state') as HTMLSelectElement).value || 'available';
    const area = areaRaw ? parseFloat(areaRaw) : undefined;
    fetch(`/svc/v1/warehouses/${this.selected.id}/units`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, areaSqm: area, state }) })
      .then(() => this.refreshUnits());
  }

  onInviteStaff(ev: Event) {
    ev.preventDefault(); if (!this.selected) return; const f = ev.target as HTMLFormElement;
    const uid = (f.elements.namedItem('userId') as HTMLInputElement).value.trim();
    const role = (f.elements.namedItem('role') as HTMLSelectElement).value || 'staff';
    fetch(`/svc/v1/warehouses/${this.selected.id}/staff`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, role }) })
      .then(() => this.refreshStaff());
  }

  refreshUnits() { if (!this.selected) return; fetch(`/svc/v1/warehouses/${this.selected.id}/units`).then(r => r.json()).then(r => this.units = r?.data || []); }
  refreshStaff() { if (!this.selected) return; fetch(`/svc/v1/warehouses/${this.selected.id}/staff`).then(r => r.json()).then(r => this.staff = r?.data || []); }
}
