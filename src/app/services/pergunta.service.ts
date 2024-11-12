import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pergunta } from '../model/pergunta/pergunta.module';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PerguntaService {
  private jsonUrl = '/assets/perguntas.json';
  private storageKey = 'perguntasSelecionadas'; // Chave para o sessionStorage

  constructor(private http: HttpClient) {
    this.inicializarPerguntasSelecionadas(); // Inicializa as perguntas selecionadas da sessão
  }

  // Inicializa perguntas selecionadas no sessionStorage
  private inicializarPerguntasSelecionadas(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const perguntasSalvas = sessionStorage.getItem(this.storageKey);
      if (!perguntasSalvas) {
        sessionStorage.setItem(this.storageKey, JSON.stringify([]));
      }
    }
  }

  // Obtém as perguntas selecionadas do sessionStorage
  private getPerguntasSelecionadasNaSessao(): Pergunta[] {
    let perguntasSalvas;

    if (typeof window !== 'undefined' && window.sessionStorage) {
      perguntasSalvas = sessionStorage.getItem(this.storageKey);
    }

    return perguntasSalvas ? JSON.parse(perguntasSalvas) : [];
  }

  // Atualiza o sessionStorage com as novas perguntas selecionadas
  private atualizarPerguntasSelecionadasNaSessao(perguntas: Pergunta[]): void {
    try {
      const perguntasSalvas = this.getPerguntasSelecionadasNaSessao();
      const novasPerguntas = [...perguntasSalvas, ...perguntas];
      sessionStorage.setItem(this.storageKey, JSON.stringify(novasPerguntas));
    } catch (error) {}
  }

  getPerguntas(): Observable<Pergunta[]> {
    return this.http.get<Pergunta[]>(this.jsonUrl);
  }

  getTotalPerguntas(): Observable<number> {
    return this.http
      .get<Pergunta[]>(this.jsonUrl)
      .pipe(map((perguntas) => perguntas.length));
  }

  getPerguntasAleatorias(
    quantity: number,
    fonteSimulado: any
  ): Observable<Pergunta[]> {
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
        // Filtra as perguntas pela fonteSimulado
        const perguntasFiltradas = fonteSimulado
          ? perguntas.filter(
              (pergunta) => pergunta.fonteSimulado === fonteSimulado
            )
          : perguntas;

        // Agrupa perguntas filtradas por domínio
        const perguntasPorDominio: { [key: string]: Pergunta[] } =
          perguntasFiltradas.reduce((acc, pergunta) => {
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
    const perguntasSelecionadasNaSessao =
      this.getPerguntasSelecionadasNaSessao();

    console.log(
      'perguntasSelecionadasNaSessao',
      perguntasSelecionadasNaSessao.length
    );
    if (perguntasSelecionadasNaSessao.length > 1000) {
      sessionStorage.clear();
    }

    // Remove perguntas já selecionadas
    const perguntasDisponiveis = perguntas.filter(
      (pergunta) =>
        !perguntasSelecionadasNaSessao.some(
          (p) => p.pergunta === pergunta.pergunta
        )
    );

    const shuffled = this.embaralhar(perguntasDisponiveis);
    const selecionadas = shuffled.slice(0, quantidade);

    // Atualiza o sessionStorage com as perguntas selecionadas
    this.atualizarPerguntasSelecionadasNaSessao(selecionadas);

    return selecionadas;
  }
}
