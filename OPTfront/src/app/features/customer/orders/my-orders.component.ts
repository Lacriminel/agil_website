import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.component.html',
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  selected: Order | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }
  load() { this.api.get<Order[]>('/customer/orders').subscribe(o => this.orders = o); }

  cancel(id: number) {
    if (!confirm('Annuler cette commande ?')) return;
    this.api.delete(`/customer/orders/${id}`).subscribe({
      next: () => { this.selected = null; this.load(); },
      error: e => alert(e.error?.message),
    });
  }

  statusClass(s: string) {
    return ({ PENDING: 'pill-yellow', CONFIRMED: 'pill-blue', DELIVERED: 'pill-green' } as any)[s] ?? 'pill-gray';
  }
  statusPillClass(s: string) { return this.statusClass(s); }
  statusLabel(s: string) {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée' } as any)[s] ?? s;
  }
}


