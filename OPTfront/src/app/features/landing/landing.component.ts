import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  activeSpace: 'admin' | 'client' | null = null;
  email = '';
  password = '';
  loading = false;
  error = '';

  private adminHints = [
    { label: 'Admin AGIL', email: 'admin@agil.tn', password: 'Admin123!' },
  ];

  private clientHints = [
    { label: 'Client 1 – Nord',   email: 'client1@agil.tn', password: 'Customer123!' },
    { label: 'Client 2 – Centre', email: 'client2@agil.tn', password: 'Customer123!' },
    { label: 'Client 3 – Sud',    email: 'client3@agil.tn', password: 'Customer123!' },
  ];

  get hints() {
    return this.activeSpace === 'admin' ? this.adminHints : this.clientHints;
  }

  constructor(private auth: AuthService, private router: Router) {}

  selectSpace(space: 'admin' | 'client') {
    this.activeSpace = space;
    this.email = '';
    this.password = '';
    this.error = '';
  }

  quickFill(email: string, password: string) {
    this.email = email;
    this.password = password;
    this.error = '';
  }

  login() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: res => {
        this.loading = false;
        if (res.user.role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else this.router.navigate(['/customer/browse']);
      },
      error: err => {
        const msg = err.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : (msg || 'Identifiants incorrects');
        this.loading = false;
      },
    });
  }
}


