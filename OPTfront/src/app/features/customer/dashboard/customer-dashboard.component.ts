import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Customer, Order } from '../../../core/models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-dashboard.component.html',
})
export class CustomerDashboardComponent implements OnInit {
  profile: { user: any; customer: Customer } | null = null;
  orders: Order[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<{ user: any; customer: Customer }>('/me').subscribe(p => this.profile = p);
    this.api.get<Order[]>('/customer/orders').subscribe(o => this.orders = o);
  }

  statusClass(s: string) {
    return ({ PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700', DELIVERED: 'bg-green-100 text-green-700' } as any)[s] ?? '';
  }
  statusLabel(s: string) {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée' } as any)[s] ?? s;
  }
}


