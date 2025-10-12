import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { HomePageComponent } from './app/pages/home/home.component';
import { StorageListPageComponent } from './app/pages/storage/storage-list.component';
import { StorageManagePageComponent } from './app/pages/storage-manage/storage-manage.component';
import { authGuard } from './app/auth.guard';
import { AppComponent } from './app/app.component';
import { DashboardPageComponent } from './app/pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'storage', component: StorageListPageComponent },
  { path: 'storage/manage', component: StorageManagePageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideRouter(routes)]
}).catch(err => console.error(err));
