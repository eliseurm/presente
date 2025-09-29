
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-presente-erro',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Link inválido</h1><p>Este link não é válido ou não está ativo.</p></div>`,
  styles: [`.container{max-width:720px;margin:40px auto;padding:16px;}`]
})
export class PresenteErroComponent {}
