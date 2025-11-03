import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiclesService, Vehicle } from '../../vehicles.service';
import { ApiService } from '../../api.service';
import { UploadService } from '../../upload.service';
import { ImageCarouselComponent } from '../../shared/image-carousel/image-carousel.component';

@Component({
  selector: 'app-vehicle-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCarouselComponent],
  templateUrl: './vehicle-editor.component.html'
})
export class VehicleEditorComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicles = inject(VehiclesService);
  private uploads = inject(UploadService);
  private core = inject(ApiService);

  id: string | null = null;
  userId?: string;
  plate = '';
  kind = '';
  capacityKg?: number;
  images = signal<string[]>([]);
  pendingFiles: File[] = [];
  loading = false;

  constructor(){
    this.core.verify().subscribe({ next: (r:any)=>{ this.userId = this.core.userIdFrom(r); this.init(); }, error: ()=> this.init() });
  }

  private init(){
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loading = true;
      this.vehicles.get(this.id, this.userId).subscribe({
        next: res => { const v: Vehicle = res.data; this.plate = v.plate; this.kind = v.kind||''; this.capacityKg = v.capacityKg; this.images.set(v.images||[]); this.loading=false; },
        error: ()=> { this.loading=false; }
      });
    }
  }

  onFilePick(ev: Event){
    const input = ev.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.pendingFiles = files.filter(f => f.type.startsWith('image/'));
  }

  removeImage(idx: number){
    const arr = this.images().slice();
    arr.splice(idx,1); this.images.set(arr);
  }

  onDragStart(ev: DragEvent, idx: number){
    ev.dataTransfer?.setData('text/plain', String(idx));
  }
  onDragOver(ev: DragEvent){ ev.preventDefault(); }
  onDrop(ev: DragEvent, targetIdx: number){
    ev.preventDefault();
    const src = Number(ev.dataTransfer?.getData('text/plain'));
    if (isNaN(src)) return;
    const arr = this.images().slice();
    const [item] = arr.splice(src,1);
    arr.splice(targetIdx,0,item);
    this.images.set(arr);
  }

  async save(){
    // Upload new files first if any
    this.loading = true;
    const finish = ()=> this.loading=false;
    const afterUpload = (urls: string[]) => {
      const images = [...this.images(), ...urls];
      if (!this.id) {
        // Create
        this.vehicles.create({ plate: this.plate, kind: this.kind||undefined, capacityKg: this.capacityKg, images }, this.userId)
          .subscribe({ next: ()=> { this.router.navigateByUrl('/dashboard/fleet'); }, error: finish, complete: finish });
      } else {
        // Update
        this.vehicles.update(this.id, { plate: this.plate, kind: this.kind||undefined, capacityKg: this.capacityKg, images }, this.userId)
          .subscribe({ next: ()=> { this.router.navigateByUrl('/dashboard/fleet'); }, error: finish, complete: finish });
      }
    };
    if (this.pendingFiles.length){
      this.uploads.uploadImages(this.pendingFiles, this.userId).subscribe({
        next: res => afterUpload(res.data?.urls||[]),
        error: ()=> finish()
      });
    } else {
      afterUpload([]);
    }
  }
}

