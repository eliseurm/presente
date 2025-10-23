import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BaseCrudService} from '@/shared/services/base-crud.service';
import {Evento} from '@/shared/model/evento';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class EventoService extends BaseCrudService<Evento, EventoFilter> {

    protected apiUrl = '/api/evento';

    constructor(http: HttpClient) {
        super(http);
    }

    importPessoasCsv(eventoId: number, file: File): Observable<{ adicionados: number }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ adicionados: number }>(`${this.apiUrl}/${eventoId}/pessoas/import`, formData);
    }
}
