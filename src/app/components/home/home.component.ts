import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Importar RouterModule
import { PerguntaService } from '../../services/pergunta.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from '../../services/SessionStorageService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, TranslateModule, RouterModule], // Adicionar RouterModule aqui
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  totalPerguntasAws: Number = 0;
  totalPerguntasAZ_900: Number = 0;
  accessCount: Number = 0;

  constructor(
    private perguntaService: PerguntaService,
    private translate: TranslateService,
    private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const lg = this.route.snapshot.queryParamMap.get('lg');

    let translateUse =
      lg ?? this.sessionStorageService.getItem('translateUse') ?? 'pt';

    this.sessionStorageService.setItem('translateUse', lg);
    this.translate.use(translateUse);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      this.sessionStorageService.removeItem('perguntasSelecionadas');
    }

    this.getTotalPerguntas_C012();
    this.getTotalPerguntas_AZ_900();
  }
  getTotalPerguntas_C012(): any {
    this.perguntaService.getTotalPerguntas('C012').subscribe(
      (total) => {
        this.totalPerguntasAws = total;
      },
      (error) => {
        console.error('Erro ao buscar o total de perguntas:', error);
      }
    );
  }
  getTotalPerguntas_AZ_900(): any {
    this.perguntaService.getTotalPerguntas('AZ_900').subscribe(
      (total) => {
        this.totalPerguntasAZ_900 = total;
      },
      (error) => {
        console.error('Erro ao buscar o total de perguntas:', error);
      }
    );
  }
  openUlrQuiz(tp: any): void {
    console.log(tp);
    this.sessionStorageService.setItem('tpQuiz', tp);
    this.router.navigate(['/quiz']);
  }

  openUlr(lg: any) {
    window.location.href = `/home?lg=${lg}`;
  }

  getPerguntas() {
    this.perguntaService.getPerguntas().subscribe(
      (perguntas) => {
        console.log(perguntas);
        this.exportarEmLotes(perguntas);
      },
      (error) => {
        console.error('Erro ao buscar o total de perguntas:', error);
      }
    );
  }

  getallPerguntas() {
    this.perguntaService.getallPerguntas().subscribe(
      (perguntas) => {
        console.log(perguntas);
      },
      (error) => {
        console.error('Erro ao buscar o total de perguntas:', error);
      }
    );
  }

  exportarEmLotes(perguntas: any[], tamanhoLote: number = 10): void {
    for (let i = 0; i < perguntas.length; i += tamanhoLote) {
      const lote = perguntas.slice(i, i + tamanhoLote);

      // Converter o lote para string JSON
      const jsonString = JSON.stringify(lote, null, 2);

      // Criar o blob usando a string JSON
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      // Criar o link de download
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_lote_${Math.floor(i / tamanhoLote) + 1}.json`;

      // Simular clique no link para iniciar o download
      a.click();

      // Revogar o objeto URL
      window.URL.revokeObjectURL(url);
    }
  }
}
