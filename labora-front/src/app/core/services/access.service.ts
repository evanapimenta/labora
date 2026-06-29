import { Injectable } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccessService {
  constructor() {}

  private authSubject = new Subject<boolean>();
  authState$ = this.authSubject.asObservable();
  _authenticated = false;

  public isRefreshing = false;
  public refreshTokenSubject = new BehaviorSubject<string | null>(null);

  get access() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const access = localStorage.getItem('access');
      return access ? JSON.parse(access) : null;
    }
    return null;
  }

  set access(value: any) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('access', JSON.stringify(value));
    }
  }

  get userId(): string | null {
    const accessData = this.access;
    if (!accessData || !accessData.accessToken) {
      return null;
    }
    try {
      const parts = accessData.accessToken.split('.');
      if (parts.length !== 3) return null;
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad) {
        payload += '='.repeat(4 - pad);
      }
      const decodedStr = typeof atob !== 'undefined'
        ? atob(payload)
        : Buffer.from(payload, 'base64').toString('binary');
      const decoded = JSON.parse(decodedStr);
      return decoded.id || null;
    } catch (e) {
      return null;
    }
  }

  get role(): string | null {
    const accessData = this.access;
    if (!accessData || !accessData.accessToken) {
      return null;
    }
    try {
      const parts = accessData.accessToken.split('.');
      if (parts.length !== 3) return null;
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad) {
        payload += '='.repeat(4 - pad);
      }
      const decodedStr = typeof atob !== 'undefined'
        ? atob(payload)
        : Buffer.from(payload, 'base64').toString('binary');
      const decoded = JSON.parse(decodedStr);
      return decoded.role || null;
    } catch (e) {
      return null;
    }
  }
}
