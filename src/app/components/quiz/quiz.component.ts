import { Opcao } from './../../model/pergunta/pergunta.module';
import { Component, OnInit } from '@angular/core';
import { PerguntaService } from '../../services/pergunta.service';
import { Pergunta } from '../../model/pergunta/pergunta.module';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule, Routes } from '@angular/router';
import { EmailConfirmationDialogComponent } from '../email-confirmation-dialog/email-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ResultadoService } from '../../services/resultado.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    RouterModule,
  ],
})
export class QuizComponent implements OnInit {
  perguntas: Pergunta[] = [];
  respostasSelecionadas: string[][] = [];
  respostasCorretas: boolean[][] = [];
  resultadosAnteriores: any[] = []; // Armazena os resultados anteriores
  respostasVerificadas: boolean[] = []; // Novo estado para verificar se as respostas foram checadas
  simuladoFinalizado: boolean = false; // Novo estado para verificar se as respostas foram checadas

  domainQuestionCount: { [domain: string]: number } = {};
  currentQuestionIndex = 0; // Índice da pergunta atual para navegação
  acertos = 0;

  acertosPorDominioMensagem: any;
  email: string = '';
  resultado: string = '';

  constructor(
    private perguntaService: PerguntaService,
    private dialog: MatDialog,
    private router: Router,
    private resultadoService: ResultadoService
  ) {}

  ngOnInit(): void {
    this.respostasCorretas = []; // Limpa as respostas corretas antes de verificar
    this.openEmailConfirmationDialog();
  }

  openEmailConfirmationDialog(): void {
    /* const dialogRef = this.dialog.open(EmailConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((email) => {
      if (email) {
        this.email = email;
        this.openPerguntas(); // Carrega as perguntas apenas após a confirmação do e-mail
        this.resultadosAnteriores =
          this.resultadoService.recuperarResultadosPorEmail(email);
      } else {
        this.router.navigate(['/home']);
      }
    });*/
    this.resultadoService.limparTudo();

    this.email = 'joseliano@yahoo.com.br';
    this.openPerguntas(); // Carrega as perguntas apenas após a confirmação do e-mail
    this.resultadosAnteriores =
      this.resultadoService.recuperarResultadosPorEmail(this.email);
  }

  openPerguntas(): void {
    this.perguntaService.getPerguntasAleatorias(90).subscribe((data) => {
      this.perguntas = data;
      this.respostasCorretas = Array(this.perguntas.length)
        .fill(false)
        .map(() => []);
      this.domainQuestionCount = this.getQuestionsCountByDomain();
    });

    console.log('perguntas', this.perguntas);
  }
  // Função para contar perguntas por domínio
  getQuestionsCountByDomain(): { [domain: string]: number } {
    const domainCounts: { [domain: string]: number } = {};

    this.perguntas.forEach((pergunta) => {
      if (domainCounts[pergunta.dominio]) {
        domainCounts[pergunta.dominio]++;
      } else {
        domainCounts[pergunta.dominio] = 1;
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
    //const respostaCorreta = pergunta.respostaCorreta;
    const respostaSelecionada =
      this.respostasSelecionadas[this.currentQuestionIndex];

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
      alert('Por favor, responda todas as perguntas antes de verificar!');
      return;
    } else {
      this.verificarResposta();

      const percentualAcertos = (this.acertos / totalPerguntas) * 100; // Cálculo da porcentagem de acertos
      const passou = percentualAcertos >= 85; // Verifica se passou com 85% de acertos

      this.resultado += `Requisito para aprovação 85% de acertos:<br>`;
      this.resultado += `Você acertou ${this.acertos} de ${totalPerguntas} perguntas!`;
      this.resultado += ` <br>Porcentagem de acertos: ${percentualAcertos.toFixed(
        2
      )}%`;
      this.resultado += passou
        ? ' <br>Parabéns! Você passou!'
        : ' <br>Você não passou. Tente novamente!';

      this.simuladoFinalizado = true;
    }
  }

  // Navega para a próxima pergunta
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.perguntas.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  // Navega para a pergunta anterior
  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
}
