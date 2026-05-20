import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const BASE = 'https://agil-backend-leq8.onrender.com';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    let p = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
      });
    }
    return this.http.get<T>(`${BASE}${path}`, { params: p });
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${BASE}${path}`, body);
  }

  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(`${BASE}${path}`, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${BASE}${path}`);
  }
}


