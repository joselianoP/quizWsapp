import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AccessCounterService {
  private key = 'accessCount';
  private sessionKey = 'hasAccessed'; // Nova chave para rastrear acesso na sessão

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeCounter();
  }

  private initializeCounter(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem(this.key) === null) {
        localStorage.setItem(this.key, '0');
      }
    }
  }

  public incrementCounter(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Verifica se o usuário já acessou durante a sessão
      if (sessionStorage.getItem(this.sessionKey) === null) {
        const currentCount = Number(localStorage.getItem(this.key));
        localStorage.setItem(this.key, (currentCount + 1).toString());
        sessionStorage.setItem(this.sessionKey, 'true'); // Define que o usuário já acessou
      }
    }
  }

  public getCounter(): number {
    if (isPlatformBrowser(this.platformId)) {
      return Number(localStorage.getItem(this.key));
    }
    return 0; // Retorna 0 se não estiver no navegador
  }
}
