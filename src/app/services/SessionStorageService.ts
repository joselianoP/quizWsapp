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
      typeof sessionStorage !== 'undefined'
    );
  }

  // Save data to sessionStorage
  setItem(key: string, value: any): void {
    if (this.isBrowser() && value) {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Get data from sessionStorage
  getItem(key: string): any {
    if (this.isBrowser()) {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  }

  // Remove an item from sessionStorage
  removeItem(key: string): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem(key);
    }
  }

  // Clear all data in sessionStorage
  clear(): void {
    if (this.isBrowser()) {
      sessionStorage.clear();
    }
  }
}
