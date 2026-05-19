import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthUser, LoginResponse } from '../models';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthUser | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('user');
    if (stored) this.currentUser.set(JSON.parse(stored));
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
      }),
    );
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/']);
  }

  clearSession() {
    localStorage.clear();
    this.currentUser.set(null);
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  isAdmin() {
    return this.currentUser()?.role === 'ADMIN';
  }

  isCustomer() {
    return this.currentUser()?.role === 'CUSTOMER';
  }

  refresh() {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string }>(`${API}/auth/refresh`, { refreshToken }).pipe(
      tap(res => localStorage.setItem('accessToken', res.accessToken)),
    );
  }
}


