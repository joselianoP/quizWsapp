// session-storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  constructor() {}

  private isBrowser(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.sessionStorage !== 'undefined'
    );
  }

  // Save data to sessionStorage
  setItem(key: string, value: any): void {
    if (this.isBrowser() && value) {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Get data from sessionStorage
  getItem(key: string): any {
    if (this.isBrowser()) {
      const value = window.sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  }

  // Remove an item from sessionStorage
  removeItem(key: string): void {
    if (this.isBrowser()) {
      window.sessionStorage.removeItem(key);
    }
  }

  // Clear all data in sessionStorage
  clear(): void {
    if (this.isBrowser()) {
      window.sessionStorage.clear();
    }
  }
}
