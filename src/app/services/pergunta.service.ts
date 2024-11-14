import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pergunta } from '../model/pergunta/pergunta.module';
import { map, Observable } from 'rxjs';
import { SessionStorageService } from './SessionStorageService';

@Injectable({
  providedIn: 'root',
})
export class PerguntaService {
  private storageKey = 'perguntasSelecionadas'; // Chave para o sessionStorage

  constructor(
    private http: HttpClient,
    private sessionStorageService: SessionStorageService
  ) {
    this.inicializarPerguntasSelecionadas(); // Inicializa as perguntas selecionadas da sessão
  }

  // Inicializa perguntas selecionadas no sessionStorage
  private inicializarPerguntasSelecionadas(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const perguntasSalvas = this.sessionStorageService.getItem(
        this.storageKey
      );
      if (!perguntasSalvas) {
        this.sessionStorageService.setItem(this.storageKey, JSON.stringify([]));
      }
    }
  }

  // Obtém as perguntas selecionadas do sessionStorage
  private getPerguntasSelecionadasNaSessao(): Pergunta[] {
    let perguntasSalvas;

    if (typeof window !== 'undefined' && window.sessionStorage) {
      perguntasSalvas = this.sessionStorageService.getItem(this.storageKey);
    }

    return perguntasSalvas ? JSON.parse(perguntasSalvas) : [];
  }

  // Atualiza o sessionStorage com as novas perguntas selecionadas
  private atualizarPerguntasSelecionadasNaSessao(perguntas: Pergunta[]): void {
    try {
      const perguntasSalvas = this.getPerguntasSelecionadasNaSessao();
      const novasPerguntas = [...perguntasSalvas, ...perguntas];
      this.sessionStorageService.setItem(
        this.storageKey,
        JSON.stringify(novasPerguntas)
      );
    } catch (error) {}
  }

  getulrJson() {
    const translateUse =
      this.sessionStorageService.getItem('translateUse') || 'pt';

    return `/assets/perguntas_${translateUse}.json`;
  }

  getPerguntas(): Observable<Pergunta[]> {
    return this.http.get<Pergunta[]>(this.getulrJson()).pipe(
      map((perguntas) => {
        return perguntas.filter(
          (pergunta) =>
            pergunta.dominio === 'Conceitos da nuvem' &&
            pergunta.tipo === 'multiple'
        );
      })
    );
  }

  getTotalPerguntas(): Observable<number> {
    return this.http
      .get<Pergunta[]>(this.getulrJson())
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

    return this.http.get<Pergunta[]>(this.getulrJson()).pipe(
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
              quantidadePorDominio,
              perguntasFiltradas.length
            );

            perguntasSelecionadas = [
              ...perguntasSelecionadas,
              ...perguntasAleatorias,
            ];
          }
        });

        // Embaralha e retorna a quantidade solicitada de perguntas
        return this.embaralharPerguntasComOpcoes(perguntasSelecionadas).slice(
          0,
          quantity
        );
      })
    );
  }

  // Função para embaralhar um array genérico
  private embaralharArray<T>(array: T[]): T[] {
    return array.sort(() => 0.5 - Math.random());
  }

  // Função para embaralhar perguntas e suas opções
  private embaralharPerguntasComOpcoes(perguntas: Pergunta[]): Pergunta[] {
    return this.embaralharArray(perguntas).map((pergunta) => {
      // Embaralha as opções de cada pergunta individualmente
      return {
        ...pergunta,
        opcoes: this.embaralharArray(pergunta.opcoes),
      };
    });
  }

  // Função para pegar perguntas aleatórias dentro de um domínio, sem repetir
  private getAleatoriasSemRepeticao(
    perguntasDominio: Pergunta[],
    quantidade: number,
    perguntaQuantidade: number
  ): Pergunta[] {
    const perguntasSelecionadasNaSessao =
      this.getPerguntasSelecionadasNaSessao();

    if (perguntasSelecionadasNaSessao.length >= perguntaQuantidade) {
      this.sessionStorageService.removeItem('perguntasSelecionadas');
    }

    // Remove perguntas já selecionadas
    const perguntasDisponiveis = perguntasDominio.filter(
      (pergunta) =>
        !perguntasSelecionadasNaSessao.some(
          (p) => p.pergunta === pergunta.pergunta
        )
    );

    // Verifica se há perguntas suficientes
    const quantidadeFinal = Math.min(quantidade, perguntasDisponiveis.length);

    // Embaralha as perguntas disponíveis e seleciona a quantidade final
    const shuffled = this.embaralharPerguntasComOpcoes(perguntasDisponiveis);
    const selecionadas = shuffled.slice(0, quantidadeFinal);

    // Atualiza o sessionStorage com as perguntas selecionadas
    this.atualizarPerguntasSelecionadasNaSessao(selecionadas);

    if (selecionadas.length == 0) {
      this.getAleatoriasSemRepeticao(perguntasDominio, quantidade, 0);
    }
    return selecionadas;
  }
}
