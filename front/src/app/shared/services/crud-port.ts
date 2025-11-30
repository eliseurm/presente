import { Observable } from 'rxjs';
import { PageResponse } from '@/shared/model/page-response';

export interface CrudPort<T, F> {
  listar(filter: F): Observable<PageResponse<T>>;
  // Adicionado suporte opcional a expand para carregamento rico sob demanda
  getById(id: any, expand?: string | string[]): Observable<T>;
  salvar(model: T): Observable<T>;
  excluir(id: any): Observable<void>;
  excluirEmLote?(ids: any[]): Observable<{ total: number; deletados: number }>; // opcional
}
