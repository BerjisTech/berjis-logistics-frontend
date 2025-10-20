import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageManagePageComponent } from '../storage-manage/storage-manage.component';

@Component({
  selector: 'app-dashboard-storage',
  standalone: true,
  imports: [CommonModule, StorageManagePageComponent],
  templateUrl: './dashboard-storage.component.html'
})
export class DashboardStorageComponent {}


