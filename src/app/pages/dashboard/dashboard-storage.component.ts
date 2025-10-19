import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageManagePageComponent } from '../storage-manage/storage-manage.component';

@Component({
  selector: 'app-dashboard-storage',
  standalone: true,
  imports: [CommonModule, StorageManagePageComponent],
  template: `
    <h2>Storage</h2>
    <app-storage-manage></app-storage-manage>
  `
})
export class DashboardStorageComponent {}

