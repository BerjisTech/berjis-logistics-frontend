import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiclesService, Vehicle } from '../../vehicles.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-dashboard-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-fleet.component.html'
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


