import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { environment } from '../../src/environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from './services/SessionStorageService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  version = environment.version;
  dataUltimaVersao = environment.dataUltimaVersao;
  title = 'quizWsapp';

  constructor(
    private translate: TranslateService,
    private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.translate.setDefaultLang('pt');
    this.translate.use('pt');
    this.sessionStorageService.setItem('translateUse', 'pt');
  }
}
