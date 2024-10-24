import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pergunta } from '../model/pergunta/pergunta.module';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PerguntaService {
  private jsonUrl = '/assets/perguntas.json';
  private perguntasSelecionadasNaSessao: Set<string> = new Set(); // Armazena perguntas já usadas na sessão

  constructor(private http: HttpClient) {}

  getPerguntas(): Observable<Pergunta[]> {
    return this.http.get<Pergunta[]>(this.jsonUrl);
  }

  getTotalPerguntas(): Observable<number> {
    return this.http
      .get<Pergunta[]>(this.jsonUrl)
      .pipe(map((perguntas) => perguntas.length));
  }

  getPerguntasAleatorias(quantity: number): Observable<Pergunta[]> {
    const distribuicao: { [dominio: string]: number } = {
      'Conceitos da nuvem': 30,
      'Migração para a nuvem': 30,
      'AWS Framework': 30,
      'Aspectos econômicos da nuvem': 30,
      'Economia de custos da migração': 30,
      'Segurança e conformidade': 30,
      'Faturamento e Preços': 60,
      'Aspectos econômicos da nuvem AWS': 60,
      'Tecnologia e serviços da nuvem': 40,
      'Cobrança, preços e suporte': 20,
    };

    return this.http.get<Pergunta[]>(this.jsonUrl).pipe(
      map((perguntas) => {
        // Agrupa perguntas por domínio
        const perguntasPorDominio: { [key: string]: Pergunta[] } =
          perguntas.reduce((acc, pergunta) => {
            acc[pergunta.dominio] = acc[pergunta.dominio] || [];
            acc[pergunta.dominio].push(pergunta);
            return acc;
          }, {} as { [key: string]: Pergunta[] });

        let perguntasSelecionadas: Pergunta[] = [];

        // Para cada domínio, seleciona as perguntas
        Object.keys(distribuicao).forEach((dominio: string) => {
          const porcentagem = distribuicao[dominio];

          if (perguntasPorDominio[dominio]) {
            const perguntasDominio = perguntasPorDominio[dominio];
            const quantidadePorDominio = Math.max(
              1,
              Math.floor((porcentagem / 100) * quantity)
            );

            // Seleciona perguntas aleatórias sem repetição
            const perguntasAleatorias = this.getAleatoriasSemRepeticao(
              perguntasDominio,
              quantidadePorDominio
            );

            perguntasSelecionadas = [
              ...perguntasSelecionadas,
              ...perguntasAleatorias,
            ];
          }
        });

        // Embaralha e retorna a quantidade solicitada de perguntas
        return this.embaralhar(perguntasSelecionadas).slice(0, quantity);
      })
    );
  }

  // Função para embaralhar o array de perguntas
  private embaralhar(perguntas: Pergunta[]): Pergunta[] {
    return perguntas.sort(() => 0.5 - Math.random());
  }

  // Função para pegar perguntas aleatórias dentro de um domínio, sem repetir
  private getAleatoriasSemRepeticao(
    perguntas: Pergunta[],
    quantidade: number
  ): Pergunta[] {
    const perguntasDisponiveis = perguntas.filter(
      (pergunta) => !this.perguntasSelecionadasNaSessao.has(pergunta.pergunta) // Filtra perguntas já usadas
    );
    const shuffled = this.embaralhar(perguntasDisponiveis);
    const selecionadas = shuffled.slice(0, quantidade);

    // Armazena as perguntas selecionadas na sessão
    selecionadas.forEach((pergunta) =>
      this.perguntasSelecionadasNaSessao.add(pergunta.pergunta)
    );

    return selecionadas;
  }
}
