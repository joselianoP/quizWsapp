// resultado.service.ts
import { Injectable } from '@angular/core';

interface Resultado {
  email: string;
  acertos: number;
  total: number;
  percentual: number;
  mensagem: string;
  data: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ResultadoService {
  private resultadosKey = 'resultados';

  constructor() {}

  // Método para armazenar o resultado
  armazenarResultado(email: string, acertos: number, total: number): void {
    const percentual = (acertos / total) * 100;
    const mensagem = percentual >= 80 ? 'Você passou' : 'Você não passou';
    const data = new Date(); // Adiciona a data atual

    const resultado: Resultado = {
      email,
      acertos,
      total,
      percentual,
      mensagem,
      data,
    };

    // Recupera os resultados armazenados
    const resultados = this.recuperarResultados();

    // Armazena o novo resultado
    resultados.push(resultado);
    localStorage.setItem(this.resultadosKey, JSON.stringify(resultados));
  }

  // Método para recuperar resultados por e-mail
  recuperarResultadosPorEmail(email: string): Resultado[] {
    const resultados = this.recuperarResultados();
    return resultados.filter((resultado) => resultado.email === email);
  }

  // Método para recuperar todos os resultados
  private recuperarResultados(): Resultado[] {
    if (this.isBrowser()) {
      const resultadosJson = localStorage.getItem(this.resultadosKey);
      const resultados: Resultado[] = resultadosJson
        ? JSON.parse(resultadosJson)
        : [];

      // Ordena os resultados por data em ordem decrescente
      return resultados.sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
      );
    } else {
      return [];
    }
  }

  limparTudo(): void {
    if (this.isBrowser()) {
      localStorage.clear(); // Limpa todo o localStorage
    }
  }

  // Verifica se o código está sendo executado no navegador
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
