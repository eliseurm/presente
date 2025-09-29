
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PresenteService } from './presente.service';

@Component({
  selector: 'app-presente-escolha',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './presente-escolha.component.html',
  styleUrls: ['./presente-escolha.component.scss']
})
export class PresenteEscolhaComponent {
  private route = inject(ActivatedRoute);
  private service = inject(PresenteService);

  keyMagico = '';
  valido = false;
  carregando = true;
  erroMsg = '';

  opcoes = [
    { id: 1, nome: 'Caneca personalizada' },
    { id: 2, nome: 'Camisa do time' },
    { id: 3, nome: 'Kit de chocolates' },
  ];

  ngOnInit() {
    this.keyMagico = this.route.snapshot.paramMap.get('keyMagico') ?? '';
    this.service.validarKey(this.keyMagico).then(ok => {
      this.valido = ok;
      if (!ok) this.erroMsg = 'Este link não é válido ou não está mais ativo.';
    }).catch(() => {
      this.valido = false;
      this.erroMsg = 'Não foi possível validar o link agora.';
    }).finally(() => this.carregando = false);
  }
}
