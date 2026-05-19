import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Truck, Order, Customer } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  trucks: Truck[] = [];
  orders: Order[] = [];
  customers: Customer[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    forkJoin({
      trucks: this.api.get<Truck[]>('/admin/trucks'),
      orders: this.api.get<Order[]>('/admin/orders'),
      customers: this.api.get<Customer[]>('/admin/customers'),
    }).subscribe({
      next: ({ trucks, orders, customers }) => {
        this.trucks = trucks;
        this.orders = orders;
        this.customers = customers;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get pendingOrders() { return this.orders.filter(o => o.status === 'PENDING').length; }
  get availableTrucks() { return this.trucks.filter(t => t.status === 'AVAILABLE').length; }
  get maintenanceTrucks() { return this.trucks.filter(t => t.status === 'MAINTENANCE'); }

  availPct(t: Truck) {
    const avail = t.compartments?.filter(c => c.isAvailable).length ?? 0;
    const total = t.compartments?.length ?? 1;
    return Math.round((avail / total) * 100);
  }

  truckStatusClass(s: string) {
    return ({ AVAILABLE: 'pill-green', IN_TRANSIT: 'pill-blue', MAINTENANCE: 'pill-red' } as any)[s] ?? 'pill-gray';
  }
  truckStatusLabel(s: string) {
    return ({ AVAILABLE: 'Disponible', IN_TRANSIT: 'En transit', MAINTENANCE: 'Maintenance' } as any)[s] ?? s;
  }
  statusPillClass(s: string) {
    return ({ PENDING: 'pill-yellow', CONFIRMED: 'pill-blue', DELIVERED: 'pill-green' } as any)[s] ?? 'pill-gray';
  }
  statusLabel(s: string) {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée' } as any)[s] ?? s;
  }
}
