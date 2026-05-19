import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterLinkActive, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  pageTitle = 'Tableau de bord';
  navigating = false;
  showSwitchPanel = false;
  switchEmail = '';
  switchPassword = '';
  switchError = '';
  switchLoading = false;
  pendingCount = 0;
  private lastPendingCount = 0;
  private pollTimer: any;

  navLinks = [
    { path: '/admin/dashboard', label: 'Tableau de bord',   icon: '•', badge: false },
    { path: '/admin/trucks',    label: 'Camions',            icon: '•', badge: false },
    { path: '/admin/orders',    label: 'Validations',        icon: '•', badge: true  },
    { path: '/admin/bons',      label: 'Bons de livraison',  icon: '•', badge: false },
    { path: '/admin/governorate-groups', label: 'Groupes',   icon: '•', badge: false },
    { path: '/admin/governorates',  label: 'Gouvernorats',   icon: '•', badge: false },
    { path: '/admin/places',    label: 'Sites',              icon: '•', badge: false },
    { path: '/admin/customers', label: 'Clients',            icon: '•', badge: false },
  ];

  private titles: Record<string, string> = {
    '/admin/dashboard':          'Tableau de bord',
    '/admin/trucks':             'Gestion des camions',
    '/admin/orders':             'Validations des commandes',
    '/admin/bons':               'Bons de livraison',
    '/admin/governorate-groups': 'Groupes de gouvernorats',
    '/admin/governorates':       'Gouvernorats',
    '/admin/places':             'Sites de livraison',
    '/admin/customers':          'Clients',
  };

  constructor(public auth: AuthService, private api: ApiService, public router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe(() => {
      this.navigating = true;
    });
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.navigating = false;
      this.pageTitle = this.titles[e.urlAfterRedirects] ?? 'Administration';
      this.showSwitchPanel = false;
    });
  }

  ngOnInit() {
    this.checkPending();
    this.pollTimer = setInterval(() => this.checkPending(), 10000);
  }

  ngOnDestroy() {
    clearInterval(this.pollTimer);
  }

  private checkPending() {
    this.api.get<any[]>('/admin/orders', { status: 'PENDING' }).subscribe({
      next: orders => {
        const count = orders.length;
        if (count > this.lastPendingCount && this.lastPendingCount !== -1) {
          this.playSound();
        }
        this.lastPendingCount = count;
        this.pendingCount = count;
      },
      error: () => {},
    });
  }

  private playSound() {
    try {
      const ctx = new AudioContext();
      const times = [0, 0.18];
      times.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.25);
      });
    } catch {}
  }

  clearNotification() { this.pendingCount = 0; }

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
