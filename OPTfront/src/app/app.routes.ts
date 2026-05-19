import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';

import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { AdminTrucksComponent } from './features/admin/trucks/trucks.component';
import { AdminOrdersComponent } from './features/admin/orders/orders.component';
import { BonsComponent } from './features/admin/bons/bons.component';
import { GovGroupsComponent } from './features/admin/governorate-groups/gov-groups.component';
import { AdminGovernoratesComponent } from './features/admin/governorates/governorates.component';
import { AdminPlacesComponent } from './features/admin/places/places.component';
import { AdminCustomersComponent } from './features/admin/customers/customers.component';

import { CustomerLayoutComponent } from './features/customer/layout/customer-layout.component';
import { CustomerDashboardComponent } from './features/customer/dashboard/customer-dashboard.component';
import { BrowseTrucksComponent } from './features/customer/browse/browse-trucks.component';
import { MyOrdersComponent } from './features/customer/orders/my-orders.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard('ADMIN')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',          component: DashboardComponent },
      { path: 'trucks',             component: AdminTrucksComponent },
      { path: 'orders',             component: AdminOrdersComponent },
      { path: 'bons',               component: BonsComponent },
      { path: 'governorate-groups', component: GovGroupsComponent },
      { path: 'governorates',       component: AdminGovernoratesComponent },
      { path: 'places',             component: AdminPlacesComponent },
      { path: 'customers',          component: AdminCustomersComponent },
    ],
  },
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [authGuard, roleGuard('CUSTOMER')],
    children: [
      { path: '', redirectTo: 'browse', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'browse',    component: BrowseTrucksComponent },
      { path: 'orders',    component: MyOrdersComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
