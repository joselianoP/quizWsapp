import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pergunta } from '../model/pergunta/pergunta.module';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PerguntaService {
  private jsonUrl = '/assets/perguntas.json';

  constructor(private http: HttpClient) {}

  getPerguntas(): Observable<Pergunta[]> {
    return this.http.get<Pergunta[]>(this.jsonUrl);
  }

  getTotalPerguntas(): Observable<number> {
    return this.http.get<Pergunta[]>(this.jsonUrl).pipe(
      map((perguntas) => perguntas.length) // Retorna o total de perguntas
    );
  }

  getPerguntasAleatorias(quantity: number): Observable<Pergunta[]> {
    const distribuicao: { [dominio: string]: number } = {
      'Conceitos da nuvem': 40,
      'Migração para a nuvem': 30,
      'AWS Framework': 30,
      'Aspectos econômicos da nuvem': 30,
      'Economia de custos da migração': 30,
      'Segurança e conformidade': 30,
      'Faturamento e Preços': 60,
      'Aspectos econômicos da nuvem AWS': 60,
      'Tecnologia e serviços da nuvem': 40,
      'Cobrança, preços e suporte': 30,
    };

    return this.http.get<Pergunta[]>(this.jsonUrl).pipe(
      map((perguntas) => {
        // Organiza as perguntas por domínio
        const perguntasPorDominio: { [key: string]: Pergunta[] } =
          perguntas.reduce((acc, pergunta) => {
            acc[pergunta.dominio] = acc[pergunta.dominio] || [];
            acc[pergunta.dominio].push(pergunta);
            return acc;
          }, {} as { [key: string]: Pergunta[] });

        let perguntasSelecionadas: Pergunta[] = [];

        // Para cada domínio na distribuição de porcentagem
        Object.keys(distribuicao).forEach((dominio: string) => {
          const porcentagem = distribuicao[dominio];

          if (perguntasPorDominio[dominio]) {
            const perguntasDominio = perguntasPorDominio[dominio];
            const quantidadePorDominio = Math.max(
              1,
              Math.floor((porcentagem / 100) * quantity)
            );

            // Embaralha e seleciona as perguntas desse domínio
            const perguntasAleatorias = this.getAleatorias(
              perguntasDominio,
              quantidadePorDominio
            );
            perguntasSelecionadas = [
              ...perguntasSelecionadas,
              ...perguntasAleatorias,
            ];
          }
        });

        // Selecione as perguntas aleatoriamente entre todos os domínios
        return this.embaralhar(perguntasSelecionadas).slice(0, quantity);
      })
    );

    /* return this.http.get<Pergunta[]>(this.jsonUrl).pipe(
      map((perguntas) => {
        // Embaralha as perguntas e seleciona as 70 primeiras
        const shuffled = perguntas.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, quantity);
      })
    );*/
  }

  // Função para embaralhar o array de perguntas
  private embaralhar(perguntas: Pergunta[]): Pergunta[] {
    return perguntas.sort(() => 0.5 - Math.random());
  }

  // Função para pegar perguntas aleatórias dentro de um domínio
  private getAleatorias(perguntas: Pergunta[], quantidade: number): Pergunta[] {
    const shuffled = this.embaralhar(perguntas);
    return shuffled.slice(0, quantidade);
  }
}
