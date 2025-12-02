import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PresenteService {
  private http = inject(HttpClient);

  // base pública: derive de apiUrl (remove sufixo /api, se houver)
  private get publicBase() {
    return (environment.apiUrl || '').replace(/\/+api\/?$/, '');
  }

  async getResumo(token: string): Promise<any> {
    const url = `${this.publicBase}/presente/${encodeURIComponent(token)}`;
    return await firstValueFrom(this.http.get<any>(url));
  }

  async postEscolha(token: string, payload: { produtoId: number; tamanhoId: number; corId: number }): Promise<any> {
    const url = `${this.publicBase}/presente/${encodeURIComponent(token)}/escolher`;
    return await firstValueFrom(this.http.post<any>(url, payload));
  }

  async getHistorico(token: string): Promise<{ anteriores: any[] }> {
    const url = `${this.publicBase}/presente/${encodeURIComponent(token)}/historico`;
    return await firstValueFrom(this.http.get<{ anteriores: any[] }>(url));
  }

  async validarKey(token: string): Promise<boolean> {
    try {
      await this.getResumo(token);
      return true;
    } catch {
      return false;
    }
  }

}
