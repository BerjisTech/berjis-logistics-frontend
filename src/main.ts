import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { devUserInterceptor } from './app/dev-user.interceptor';
import { errorsInterceptor } from './app/errors.interceptor';
import { authTokenInterceptor } from './app/auth-token.interceptor';
import { provideRouter, Routes } from '@angular/router';
import { HomePageComponent } from './app/pages/home/home.component';
import { StorageListPageComponent } from './app/pages/storage/storage-list.component';
import { StorageManagePageComponent } from './app/pages/storage-manage/storage-manage.component';
import { ProductsListPageComponent } from './app/pages/products/products-list.component';
import { TransportListPageComponent } from './app/pages/transport/transport-list.component';

import { DriverJobsPageComponent } from './app/pages/driver/driver-jobs.component';

import { StoreLandingPageComponent } from './app/pages/store/store-landing.component';
import { authGuard } from './app/auth.guard';
import { AppComponent } from './app/app.component';
import { DashboardPageComponent } from './app/pages/dashboard/dashboard.component';
import { DashboardHomeComponent } from './app/pages/dashboard/dashboard-home.component';
import { DashboardStorageComponent } from './app/pages/dashboard/dashboard-storage.component';
import { DashboardFleetComponent } from './app/pages/dashboard/dashboard-fleet.component';
import { DashboardProductsComponent } from './app/pages/dashboard/dashboard-products.component';
import { DashboardCrmComponent } from './app/pages/dashboard/dashboard-crm.component';
import { DashboardDriverComponent } from './app/pages/dashboard/dashboard-driver.component';
import { PublicTrackingPageComponent } from './app/pages/public-tracking/public-tracking.component';

import { DashboardStoresComponent } from './app/pages/dashboard/dashboard-stores.component';
import { StoreManagePageComponent } from './app/pages/dashboard/store-manage.component';
import { ShipmentsCenterComponent } from './app/pages/shipments/shipments-center.component';
import { TrackingDemoPageComponent } from './app/pages/tracking/tracking-demo.component';
import { FinanceCenterComponent } from './app/pages/finance/finance-center.component';
import { MarketingCenterComponent } from './app/pages/marketing/marketing-center.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard], children: [

      { path: 'stores', component: DashboardStoresComponent },
      { path: 'stores/:id/manage', component: StoreManagePageComponent },
      { path: 'storage', component: DashboardStorageComponent },
      { path: 'fleet', component: DashboardFleetComponent },
      { path: 'products', component: DashboardProductsComponent },
      { path: 'crm', component: DashboardCrmComponent },
      { path: 'driver', component: DashboardDriverComponent },
      { path: 'shipments', component: ShipmentsCenterComponent },
      { path: 'finance', component: FinanceCenterComponent },
      { path: 'marketing', component: MarketingCenterComponent },
      { path: 'storage/manage', component: StorageManagePageComponent },
      { path: 'fleet/new', loadComponent: () => import('./app/pages/transport/vehicle-editor.component').then(m => m.VehicleEditorComponent) },
      { path: 'fleet/vehicle/:id', loadComponent: () => import('./app/pages/transport/vehicle-editor.component').then(m => m.VehicleEditorComponent) },
    ]
  },
  { path: 'driver-jobs', component: DriverJobsPageComponent, canActivate: [authGuard] },
  { path: 'tracking-demo', component: TrackingDemoPageComponent, canActivate: [authGuard] },
  { path: 'storage', component: StorageListPageComponent },
  { path: 'products', component: ProductsListPageComponent },
  { path: 'transport', component: TransportListPageComponent },
  { path: 'track', component: PublicTrackingPageComponent },
  { path: 'store/:slug', component: StoreLandingPageComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([devUserInterceptor, authTokenInterceptor, errorsInterceptor])),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));






