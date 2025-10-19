import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiclesService, Vehicle } from '../../vehicles.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-dashboard-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Fleet</h2>
    <form (submit)="addVehicle($event)" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;">
      <input name="plate" placeholder="Plate (e.g., KAA 123A)" required style="padding:8px; border:1px solid #ddd; border-radius:8px;" />
      <input name="kind" placeholder="Kind (truck, van, bike)" style="padding:8px; border:1px solid #ddd; border-radius:8px;" />
      <input name="capacityKg" type="number" placeholder="Capacity (kg)" style="padding:8px; border:1px solid #ddd; border-radius:8px; width:160px;" />
      <button type="submit">Add Vehicle</button>
    </form>
    <ul>
      <li *ngFor="let v of vehicles">
        <strong>{{v.plate}}</strong>
        <small *ngIf="v.kind"> — {{v.kind}}</small>
        <small *ngIf="v.capacityKg"> — {{v.capacityKg | number:'1.0-0'}} kg</small>
        <button (click)="removeVehicle(v.id)" style="margin-left:8px;">Remove</button>
      </li>
    </ul>
  `
})
export class DashboardFleetComponent {
  private api = inject(VehiclesService);
  private core = inject(ApiService);
  vehicles: Vehicle[] = [];
  userId?: string;
  constructor(){ this.core.verify().subscribe({ next: (r:any)=>{ this.userId = r?.data?.uid?.toString(); this.refresh(); }, error:()=> this.refresh() }); }
  refresh(){ this.api.list(this.userId).subscribe({ next: r=> this.vehicles = r.data||[], error: ()=> this.vehicles=[] }); }
  addVehicle(ev: Event) {
    ev.preventDefault(); const f = ev.target as HTMLFormElement;
    const plate = (f.elements.namedItem('plate') as HTMLInputElement).value.trim();
    const kind = (f.elements.namedItem('kind') as HTMLInputElement).value.trim() || undefined;
    const capRaw = (f.elements.namedItem('capacityKg') as HTMLInputElement).value;
    const capacityKg = capRaw ? parseFloat(capRaw) : undefined;
    if (!plate) return;
    this.api.create({ plate, kind, capacityKg }, this.userId).subscribe({ next: ()=> { f.reset(); this.refresh(); } });
  }
  removeVehicle(id: string){ this.api.remove(id, this.userId).subscribe({ next: ()=> this.refresh() }); }
}

