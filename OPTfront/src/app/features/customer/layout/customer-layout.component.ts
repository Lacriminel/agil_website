import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Customer } from '../../../core/models';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './customer-layout.component.html',
})
export class CustomerLayoutComponent implements OnInit {
  pageTitle = 'Réserver des compartiments';
  customerInfo: { place: string; group: string } | null = null;
  showSwitchPanel = false;
  switchEmail = '';
  switchPassword = '';
  switchError = '';
  switchLoading = false;

  navLinks = [
    { path: '/customer/browse', label: 'Réserver', icon: '•' },
    { path: '/customer/orders', label: 'Mes réservations', icon: '•' },
    { path: '/customer/dashboard', label: 'Suivi livraison', icon: '•' },
  ];

  private titles: Record<string, string> = {
    '/customer/browse': 'Réserver des compartiments',
    '/customer/orders': 'Mes réservations',
    '/customer/dashboard': 'Suivi livraison',
  };

  constructor(public auth: AuthService, private api: ApiService, private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.pageTitle = this.titles[e.urlAfterRedirects] ?? 'Espace client';
      this.showSwitchPanel = false;
    });
  }

  ngOnInit() {
    this.api.get<{ user: any; customer: Customer }>('/me').subscribe(p => {
      this.customerInfo = {
        place: p.customer.place?.name ?? '',
        group: p.customer.place?.governorate?.governorateGroup?.name ?? '',
      };
    });
  }

  logout() { this.auth.logout(); }

  openSwitchPanel() {
    this.showSwitchPanel = !this.showSwitchPanel;
    this.switchEmail = '';
    this.switchPassword = '';
    this.switchError = '';
  }

  doSwitch() {
    if (!this.switchEmail || !this.switchPassword) return;
    this.switchLoading = true;
    this.switchError = '';
    this.auth.clearSession();
    this.auth.login(this.switchEmail, this.switchPassword).subscribe({
      next: res => {
        this.switchLoading = false;
        this.showSwitchPanel = false;
        if (res.user.role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else this.router.navigate(['/customer/browse']);
      },
      error: err => {
        const msg = err.error?.message;
        this.switchError = Array.isArray(msg) ? msg.join(', ') : (msg || 'Identifiants incorrects');
        this.switchLoading = false;
      },
    });
  }
}
