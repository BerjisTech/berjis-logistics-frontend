import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiclesService, Vehicle } from '../../vehicles.service';
import { ApiService } from '../../api.service';
import { UploadService } from '../../upload.service';

@Component({
  selector: 'app-dashboard-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-fleet.component.html'
})
export class DashboardFleetComponent {
  private api = inject(VehiclesService);
  private core = inject(ApiService);
  private uploads = inject(UploadService);
  vehicles: Vehicle[] = [];
  userId?: string;
  private imagesToUpload: File[] = [];
  constructor(){ this.core.verify().subscribe({ next: (r:any)=>{ this.userId = this.core.userIdFrom(r); this.refresh(); }, error:()=> this.refresh() }); }
  refresh(){ this.api.list(this.userId).subscribe({ next: r=> this.vehicles = r.data||[], error: ()=> this.vehicles=[] }); }
  onImagesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.imagesToUpload = input.files ? Array.from(input.files).filter(f => f.type.startsWith('image/')) : [];
  }
  addVehicle(ev: Event) {
    ev.preventDefault(); const f = ev.target as HTMLFormElement;
    const plate = (f.elements.namedItem('plate') as HTMLInputElement).value.trim();
    const kind = (f.elements.namedItem('kind') as HTMLInputElement).value.trim() || undefined;
    const capRaw = (f.elements.namedItem('capacityKg') as HTMLInputElement).value;
    const capacityKg = capRaw ? parseFloat(capRaw) : undefined;
    if (!plate) return;
    if (this.imagesToUpload.length < 5) { alert('Please upload at least 5 images.'); return; }
    this.uploads.uploadImages(this.imagesToUpload, this.userId).subscribe({
      next: (res) => {
        const urls = res.data?.urls || [];
        if (urls.length < 5) { alert('Upload failed: need at least 5 valid images.'); return; }
        this.api.create({ plate, kind, capacityKg, images: urls }, this.userId).subscribe({ next: ()=> { f.reset(); this.imagesToUpload = []; this.refresh(); } });
      },
      error: () => alert('Upload failed. Please try again.')
    });
  }
  removeVehicle(id: string){ this.api.remove(id, this.userId).subscribe({ next: ()=> this.refresh() }); }
}


