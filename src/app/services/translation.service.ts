// translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  constructor(private http: HttpClient) {}

  // Função para carregar o arquivo de traduções
  loadTranslations(language: string): Observable<any> {
    const translationsFile = `${language}.json`; // Ex: 'translations-pt.json'
    const jsonPath = `/assets/i18n/${translationsFile}`; // Caminho correto

    return this.http.get<any>(jsonPath); // Retorna o JSON como um Observable
  }
}
