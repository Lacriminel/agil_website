import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Customer, Truck, Compartment, CartItem, GasType } from '../../../core/models';

const GAS_TYPES: GasType[] = ['GASOIL', 'GASOIL_SSP', 'GASOIL_SSF'];

@Component({
  selector: 'app-browse-trucks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './browse-trucks.component.html',
})
export class BrowseTrucksComponent implements OnInit {
  trucks: Truck[] = [];
  cart: CartItem[] = [];
  gasTypes = GAS_TYPES;
  pickingFor: { compartment: Compartment; truck: Truck } | null = null;
  selectedGasType: GasType = 'GASOIL';
  submitting = false;
  success = false;
  error = '';
  customerGroup = '';
  selectedZone = '';
  today = new Date().toISOString().split('T')[0];

  get availableZones(): string[] {
    const zones = this.trucks.map(t => t.governorateGroup?.name ?? '').filter(Boolean);
    return [...new Set(zones)].sort();
  }

  get filteredTrucks(): Truck[] {
    if (!this.selectedZone) return this.trucks;
    return this.trucks.filter(t => t.governorateGroup?.name === this.selectedZone);
  }

  sumCap = (acc: number, c: Compartment) => acc + c.capacity;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.get<Truck[]>('/customer/trucks').subscribe(t => this.trucks = t);
    this.api.get<{ user: any; customer: Customer }>('/me').subscribe(p => {
      this.customerGroup = p.customer.place?.governorate?.governorateGroup?.name ?? '';
    });
  }

  gasLabel(g: GasType) {
    return { GASOIL: 'Carburant diesel standard', GASOIL_SSP: 'Super sans plomb', GASOIL_SSF: 'Gazoil sans soufre' }[g] ?? g;
  }

  isInCart(compartmentId: number) {
    return this.cart.some(i => i.compartment.id === compartmentId);
  }

  openPicker(compartment: Compartment, truck: Truck) {
    if (this.isInCart(compartment.id)) return;
    this.pickingFor = { compartment, truck };
    this.selectedGasType = 'GASOIL';
  }

  addToCart() {
    if (!this.pickingFor) return;
    this.cart.push({ compartment: this.pickingFor.compartment, truck: this.pickingFor.truck, gasType: this.selectedGasType });
    this.pickingFor = null;
  }

  removeFromCart(compartmentId: number) {
    this.cart = this.cart.filter(i => i.compartment.id !== compartmentId);
  }

  get totalUnits() { return this.cart.reduce((s, i) => s + i.compartment.capacity, 0); }

  submit() {
    if (this.cart.length === 0) return;
    this.submitting = true;
    this.error = '';
    const items = this.cart.map(i => ({ compartmentId: i.compartment.id, gasType: i.gasType }));
    this.api.post('/customer/orders', { items }).subscribe({
      next: () => { this.success = true; this.cart = []; setTimeout(() => this.router.navigate(['/customer/orders']), 1800); },
      error: e => { this.error = e.error?.message || 'Échec de la réservation'; this.submitting = false; },
    });
  }
}


