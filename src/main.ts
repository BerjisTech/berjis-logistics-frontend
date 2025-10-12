import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { HomeComponent } from './app/home.component';
import { StorageListComponent } from './app/storage-list.component';
import { StorageManageComponent } from './app/storage-manage.component';
import { authGuard } from './app/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'storage', component: StorageListComponent },
  { path: 'storage/manage', component: StorageManageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(HomeComponent, {
  providers: [provideHttpClient(), provideRouter(routes)]
}).catch(err => console.error(err));
