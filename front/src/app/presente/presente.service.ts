
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PresenteService {

  // Troque esta validação por uma chamada HTTP ao seu backend.
  async validarKey(key: string): Promise<boolean> {
    // Exemplo de validações simples: 32 chars hex ou uma lista "ativa" local
    const pareceHex = /^[a-f0-9]{16,64}$/i.test(key);
    const ativos = new Set<string>(['chaveExemplo123', 'abc123', 'keyDeTeste']);
    return pareceHex || ativos.has(key);
  }

}
