import { Observable } from 'rxjs';
import { PageResponse } from '@/shared/model/page-response';

export interface CrudPort<T, F> {
  listar(filter: F): Observable<PageResponse<T>>;
  getById(id: any): Observable<T>;
  salvar(model: T): Observable<T>;
  excluir(id: any): Observable<void>;
  excluirEmLote?(ids: any[]): Observable<{ total: number; deletados: number }>; // opcional
}
