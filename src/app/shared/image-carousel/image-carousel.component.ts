import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative select-none">
      <div class="flex snap-x snap-mandatory overflow-x-auto rounded-xl border border-slate-200">
        <img *ngFor="let src of images; let i = index"
             [src]="src"
             loading="lazy"
             class="h-32 w-full max-w-none snap-center object-cover"
             [alt]="'image '+(i+1)" />
      </div>
    </div>
  `
})
export class ImageCarouselComponent {
  @Input() images: string[] = [];
}

