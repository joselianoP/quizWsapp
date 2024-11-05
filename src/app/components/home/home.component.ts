import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importar RouterModule
import { PerguntaService } from '../../services/pergunta.service';
import { AccessCounterService } from '../../services/access-counter.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule], // Adicionar RouterModule aqui
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  totalPerguntasAws: number = 0;
  accessCount: number = 0;

  constructor(
    private perguntaService: PerguntaService,
    private accessCounterService: AccessCounterService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.clear();
    }

    this.perguntaService.getTotalPerguntas().subscribe(
      (total) => {
        this.totalPerguntasAws = total;
      },
      (error) => {
        console.error('Erro ao buscar o total de perguntas:', error);
      }
    );
    // this.accessCounterService.incrementCounter(); // Incrementa o contador
    //this.accessCount = this.accessCounterService.getCounter(); // Obtém o contador
  }
}
