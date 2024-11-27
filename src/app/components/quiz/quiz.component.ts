import { Component, OnInit } from '@angular/core';
import { PerguntaService } from '../../services/pergunta.service';
import { Pergunta } from '../../model/pergunta/pergunta.module';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table'; // Importa o MatTableModule
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from '../../services/SessionStorageService';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    RouterModule,
    TranslateModule,
  ],
})
export class QuizComponent implements OnInit {
  perguntas: Pergunta[] = [];
  respostasSelecionadas: (string[] | null)[] = [];
  respostasCorretas: boolean[][] = [];
  resultadosAnteriores: any[] = []; // Armazena os resultados anteriores
  respostasVerificadas: boolean[] = []; // Novo estado para verificar se as respostas foram checadas
  simuladoFinalizado: boolean = false; // Novo estado para verificar se as respostas foram checadas
  vereficouPergunta: boolean = false;

  dataSource: any[] = [];
  displayedColumns: string[] = [
    'numero',
    'pergunta',
    'respostaSelecionada',
    'correta',
    'status',
  ];

  domainQuestionCount: { [domain: string]: number } = {};
  currentQuestionIndex = 0; // Índice da pergunta atual para navegação
  acertos = 0;
  erros = 0;

  acertosPorDominioMensagem: any;
  email: string = '';
  resultado: string = '';
  tipoPergunta: string = '';

  msgVereficouPergunta = '';
  msgAlerta = '';
  msgRequirement_approval = '';
  msgVoce_acertou = '';
  msgVoce_errou = '';
  msgPorcentagem_acertos = '';
  msgParabens_voce_passou = '';
  msgVoce_nao_passou = '';

  constructor(
    private perguntaService: PerguntaService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private sessionStorageService: SessionStorageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translate.use(
      this.sessionStorageService.getItem('translateUse') || 'pt'
    );

    this.tipoPergunta = this.sessionStorageService.getItem('tpQuiz');

    this.respostasCorretas = []; // Limpa as respostas corretas antes de verificar
    this.openPerguntas();
    this.carregarIdioma();
  }

  openTituloQuiz(): any {
    if (this.tipoPergunta === 'C012') {
      return 'AWS Certified Cloud Practitioner';
    } else if (this.tipoPergunta === 'AZ_900') {
      return 'Microsoft AZ-900';
    } else {
      return 'AWS Certified Cloud Practitioner';
    }
  }
  openPerguntas(): void {
    const fonteSimulado = this.route.snapshot.queryParamMap.get('tp');

    this.perguntaService
      .getPerguntasAleatorias(3, this.tipoPergunta, fonteSimulado)
      .subscribe((data) => {
        this.perguntas = data;
        this.respostasCorretas = Array(this.perguntas.length)
          .fill(false)
          .map(() => []);

        this.domainQuestionCount = this.getQuestionsCountByDomain();
      });
  }
  // Função para contar perguntas por domínio
  getQuestionsCountByDomain(): { [domain: string]: number } {
    const domainCounts: { [domain: string]: number } = {};

    this.perguntas.forEach((pergunta) => {
      if (domainCounts[pergunta.dominioKey]) {
        domainCounts[pergunta.dominioKey]++;
      } else {
        domainCounts[pergunta.dominioKey] = 1;
      }
    });

    return domainCounts;
  }

  onSelectOption(
    perguntaIndex: number,
    opcao: string,
    multiplaEscolha: boolean
  ): void {
    if (!this.respostasSelecionadas[perguntaIndex]) {
      this.respostasSelecionadas[perguntaIndex] = [];
    }

    if (multiplaEscolha) {
      const selecionadas = this.respostasSelecionadas[perguntaIndex];
      const index = selecionadas.indexOf(opcao);
      if (index > -1) {
        selecionadas.splice(index, 1);
      } else {
        selecionadas.push(opcao);
      }
    } else {
      this.respostasSelecionadas[perguntaIndex] = [opcao];
    }
  }

  isMultipleChoice(respostaCorreta: any): boolean {
    return Array.isArray(respostaCorreta);
  }

  verificarResposta() {
    const pergunta = this.perguntas[this.currentQuestionIndex];
    const respostaSelecionada =
      this.respostasSelecionadas[this.currentQuestionIndex];

    if (respostaSelecionada === undefined) {
      alert(this.msgAlerta);
      return;
    } else {
      this.respostasVerificadas[this.currentQuestionIndex] = true;

      const respostaCorreta = Array.isArray(pergunta.respostaCorreta)
        ? pergunta.respostaCorreta.sort()
        : [pergunta.respostaCorreta];

      const respSelecionada = Array.isArray(respostaSelecionada)
        ? respostaSelecionada.sort()
        : [respostaSelecionada];

      // Armazena as informações de corretude
      this.respostasCorretas[this.currentQuestionIndex] = pergunta.opcoes.map(
        (opcao) =>
          Array.isArray(respostaCorreta)
            ? respostaCorreta.includes(opcao.texto)
            : opcao.texto === respostaCorreta
      );

      if (JSON.stringify(respostaCorreta) === JSON.stringify(respSelecionada)) {
        this.acertos++;
      } else {
        this.erros++;
      }

      const totalPerguntas = this.perguntas.length;
      const percentualAcertos = (this.acertos / totalPerguntas) * 100; // Cálculo da porcentagem de acertos

      this.resultado = `<b>${this.msgRequirement_approval}:</b>`;
      this.resultado += `<br>${this.msgVoce_acertou} ${this.acertos}`;
      this.resultado += `<br>${this.msgVoce_errou} ${this.erros}`;
      this.resultado += `<br>${
        this.msgPorcentagem_acertos
      }: ${percentualAcertos.toFixed(2)}%`;

      this.vereficouPergunta = true;
    }
  }

  finalizar() {
    const totalPerguntas = this.perguntas.length;

    const todasRespondidas = this.perguntas.every((_, index) => {
      const respostaSelecionada = this.respostasSelecionadas[index];
      return (
        respostaSelecionada && respostaSelecionada.length > 0 // Para múltipla escolha, deve haver pelo menos uma opção
      );
    });

    if (!todasRespondidas) {
      alert(this.msgAlerta);
      return;
    } else {
      this.verificarResposta();

      const percentualAcertos = (this.acertos / totalPerguntas) * 100;
      const passou = percentualAcertos >= 80;

      this.resultado = `<b>${this.msgRequirement_approval}:</b><br>`;
      this.resultado += `${this.msgVoce_acertou} ${this.acertos} de ${totalPerguntas} perguntas!`;
      this.resultado += ` <br>${
        this.msgPorcentagem_acertos
      }: ${percentualAcertos.toFixed(2)}%`;
      this.resultado += passou
        ? ` <br><b>${this.msgParabens_voce_passou}</b>`
        : ` <br><b>${this.msgVoce_nao_passou}</b>`;

      this.simuladoFinalizado = true;
      this.listarResultados();
    }
  }

  // Navega para a próxima pergunta
  nextQuestion(): void {
    const respostaSelecionada =
      this.respostasSelecionadas[this.currentQuestionIndex];

    if (!this.vereficouPergunta) {
      alert(this.msgVereficouPergunta);
      return;
    }

    if (respostaSelecionada === undefined) {
      alert(this.msgAlerta);
      return;
    } else {
      if (this.currentQuestionIndex < this.perguntas.length - 1) {
        this.currentQuestionIndex++;
      }
      this.vereficouPergunta = false;
    }
  }

  // Navega para a pergunta anterior
  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  navigateToQuiz() {
    window.location.reload();
  }

  carregarIdioma() {
    const language = this.sessionStorageService.getItem('translateUse') || 'pt';

    this.translationService.loadTranslations(language).subscribe(
      (translations) => {
        this.msgAlerta = translations.please_answer_the_question;
        this.msgRequirement_approval = translations.requirement_for_approval;
        this.msgVoce_acertou = translations.you_got_it_right;
        this.msgVoce_errou = translations.you_got_it_wrong;
        this.msgPorcentagem_acertos =
          translations.percentage_of_correct_answers;
        this.msgParabens_voce_passou = translations.congratulations_you_passed;
        this.msgVoce_nao_passou = translations.you_didn_pass_try_again;

        this.msgVereficouPergunta = translations.check_question;
      },
      (error) => {
        console.error('Erro ao carregar as traduções:', error);
      }
    );
  }
  listarResultados() {
    if (!this.simuladoFinalizado) {
      alert('Finalize o simulado antes de listar os resultados.');
      return;
    }

    this.dataSource = this.perguntas.map((pergunta, index) => {
      const respostaSelecionada = this.respostasSelecionadas[index];
      const acertou =
        JSON.stringify(respostaSelecionada) ===
        JSON.stringify(pergunta.respostaCorreta);

      return {
        numero: index + 1,
        pergunta: pergunta.pergunta,
        respostaSelecionada: Array.isArray(respostaSelecionada)
          ? respostaSelecionada.join(', ')
          : respostaSelecionada || 'Nenhuma',
        correta: Array.isArray(pergunta.respostaCorreta)
          ? pergunta.respostaCorreta.join(', ')
          : pergunta.respostaCorreta,
        status: acertou ? 'Acertou' : 'Errou',
      };
    });
  }
}
