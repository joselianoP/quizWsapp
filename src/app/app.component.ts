import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../../src/environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  version = environment.version;
  dataUltimaVersao = environment.dataUltimaVersao;
  title = 'quizWsapp';
}
