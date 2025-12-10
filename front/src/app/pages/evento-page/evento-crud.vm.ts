import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCrud } from '@/shared/crud/abstract.crud';
import { Evento } from '@/shared/model/evento';
import { EventoFilter } from '@/shared/model/filter/evento-filter';
import { EventoService } from '@/services/evento.service';
import { Observable } from 'rxjs';
import { StatusEnum } from '@/shared/model/enum/status.enum';

@Injectable()
export class EventoCrudVM extends AbstractCrud<Evento, EventoFilter> {
  constructor(
    port: EventoService,
    route: ActivatedRoute,
    router: Router,
  ) {
    super(port, route, router);
    this.model = this.newModel();
    this.filter = this.newFilter();
  }

  // Evita que a listagem inicial dispare sem clienteId (pois CLIENTE precisa do escopo)
  // Mantemos o carregamento por ID quando a rota possuir :id
  override init(): void {
    this.newModelIfNull();
    this.newFilterIfNull();
    this.loadFromStorage();
    const id = this.route?.snapshot.paramMap.get('id');
    if (id) {
      this.onIdParam(id);
    }
    // Caso não haja :id, não chamamos doFilter automaticamente aqui.
    // A tela (EventoPage) chamará doFilter após selecionar/definir clienteId.
  }

  protected newModel(): Evento {
    return {
      id: undefined,
      nome: '',
      descricao: '',
      cliente: undefined,
      status: undefined,
      anotacoes: '',
      inicio: undefined,
      fimPrevisto: undefined,
      fim: undefined,
      pessoas: [],
      produtos: [],
      version: undefined,
    };
  }

  protected newFilter(): EventoFilter {
    return new EventoFilter({ page: 0, size: 10, sorts: [{ field: 'id', direction: 'ASC' }] } as any);
  }

  override canDoSave(): boolean {
    const errors: string[] = [];

    const nomeOk = !!(this.model?.nome && String(this.model.nome).trim().length > 0);
    if (!nomeOk) errors.push('Informe o nome do evento.');

    const statusOk = !!this.model?.status;
    if (!statusOk) errors.push('Informe o status do evento.');

    const clienteId = this.getClienteId();
    const clienteOk = !!clienteId;
    if (!clienteOk) errors.push('Selecione o cliente.');

    // Datas passam a ser opcionais: não validar como obrigatórias

    this.errorMessages = errors;
    this.errorsVisible = errors.length > 0;
    return errors.length === 0;
  }

  // Normaliza payload antes de salvar (status enum e cliente id)
  override doSave(): Observable<Evento> {
    const payload: any = { ...this.model };
    // status: enviar a KEY do enum
    payload.status = this.toStatusKey(payload.status);
    // cliente: enviar apenas o id
    const clienteId = this.getClienteId();
    payload.cliente = clienteId ? { id: clienteId } : null;

    // Normaliza datas: string vazia/undefined -> null; Date -> 'YYYY-MM-DDTHH:mm' (horário local)
    const fixDate = (v: any) => {
      if (v === '' || v === undefined) return null;
      if (v instanceof Date) return this.toLocalMinuteString(v);
      return v;
    };
    payload.inicio = fixDate(payload.inicio);
    payload.fimPrevisto = fixDate(payload.fimPrevisto);
    payload.fim = fixDate(payload.fim);

    // pessoas: enviar apenas { pessoa: {id}, status: KEY }
    if (Array.isArray(payload.pessoas)) {
      payload.pessoas = payload.pessoas
        .filter((ep: any) => ep && (ep.pessoa != null))
        .map((ep: any) => {
          const pessoaId = typeof ep.pessoa === 'object' ? ep.pessoa?.id : ep.pessoa;
          return {
            pessoa: pessoaId ? { id: pessoaId } : null,
            status: this.toStatusKey(ep.status)
          };
        });
    }

    // produtos: enviar apenas { produto: {id}, status: KEY }
    if (Array.isArray(payload.produtos)) {
      payload.produtos = payload.produtos
        .filter((pr: any) => pr && (pr.produto != null))
        .map((pr: any) => {
          const produtoId = typeof pr.produto === 'object' ? pr.produto?.id : pr.produto;
          return {
            produto: produtoId ? { id: produtoId } : null,
            status: this.toStatusKey(pr.status)
          };
        });
    }
    this.model = payload;
    return super.doSave();
  }

  private toStatusKey(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') {
      const encontrado = (Object.values(StatusEnum) as any[])
        .find(v => v.key === value) ||
        (Object.values(StatusEnum) as any[]).find(v => (v.descricao || '').toLowerCase() === value.toLowerCase());
      return encontrado?.key;
    }
    if (typeof value === 'object') {
      return value.key ?? undefined;
    }
    return undefined;
  }

  private getClienteId(): number | undefined {
    const c: any = this.model?.cliente;
    if (!c) return undefined;
    if (typeof c === 'object') return c.id ?? undefined;
    if (typeof c === 'number') return c;
    return undefined;
  }

  // Converte Date para string local no padrão 'YYYY-MM-DDTHH:mm' (sem fuso/segundos)
  private toLocalMinuteString(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const minute = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }
}
