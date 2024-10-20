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
  respostasVerificadas: boolean = false; // Novo estado para verificar se as respostas foram checadas
  domainQuestionCount: { [domain: string]: number } = {};
  currentQuestionIndex = 0; // Índice da pergunta atual para navegação
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

    this.email = 'joseliano@yahoo.com.br';
    this.openPerguntas(); // Carrega as perguntas apenas após a confirmação do e-mail
    this.resultadosAnteriores =
      this.resultadoService.recuperarResultadosPorEmail(this.email);
  }

  openPerguntas(): void {
    this.perguntaService.getPerguntasAleatorias(5).subscribe((data) => {
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

  verificarRespostas(): void {
    type AcertosPorDominio = {
      [dominio: string]: number;
    };

    let acertos = 0;
    const acertosPorDominio: AcertosPorDominio = {};
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
      this.respostasCorretas = []; // Limpa as respostas corretas antes de verificar
      this.respostasVerificadas = true; // Atualiza o estado para indicar que as respostas foram verificadas

      this.perguntas.forEach((pergunta, index) => {
        const respostaCorreta = Array.isArray(pergunta.respostaCorreta)
          ? pergunta.respostaCorreta.sort()
          : [pergunta.respostaCorreta];

        let respostaSelecionada: any;

        if (pergunta.tipo == 'single') {
          respostaSelecionada = this.respostasSelecionadas[index] || [];
        } else {
          respostaSelecionada = this.respostasSelecionadas[index]?.sort() || [];
        }

        let respSelecionada = Array.isArray(respostaSelecionada)
          ? respostaSelecionada.sort()
          : [respostaSelecionada];

        const corretas = respostaCorreta.map((opcao) =>
          pergunta.opcoes.includes(opcao)
        );

        this.respostasCorretas[index] = corretas;

        if (
          JSON.stringify(respostaCorreta) === JSON.stringify(respSelecionada)
        ) {
          acertos++;

          // Adiciona ao total de acertos por domínio
          const dominio = pergunta.dominio; // Supondo que a pergunta tenha um campo 'dominio'
          if (!acertosPorDominio[dominio]) {
            acertosPorDominio[dominio] = 0; // Inicializa o domínio se não existir
          }
          acertosPorDominio[dominio]++; // Incrementa o contador para o domínio
        }
      });

      const percentualAcertos = (acertos / totalPerguntas) * 100; // Cálculo da porcentagem de acertos
      const passou = percentualAcertos >= 85; // Verifica se passou com 85% de acertos

      this.resultado = `Você acertou ${acertos} de ${totalPerguntas} perguntas!`;
      this.resultado += ` <br>Porcentagem de acertos: ${percentualAcertos.toFixed(
        2
      )}%`;
      this.resultado += passou
        ? ' <br>Parabéns! Você passou!'
        : ' <br>Você não passou. Tente novamente!';

      this.acertosPorDominioMensagem = 'Acertos por domínio:<br>';
      for (const [dominio, totalAcertos] of Object.entries(acertosPorDominio)) {
        this.acertosPorDominioMensagem += `${dominio}: ${totalAcertos}<br>`;
      }

      this.resultadoService.armazenarResultado(
        this.email,
        acertos,
        totalPerguntas
      );
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
