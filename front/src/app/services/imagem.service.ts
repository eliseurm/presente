import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseCrudService } from '@/shared/services/base-crud.service';
import { Imagem } from '@/shared/model/imagem';
import { ImagemFilter } from '@/shared/model/filter/imagem-filter';

@Injectable({ providedIn: 'root' })
export class ImagemService extends BaseCrudService<Imagem, ImagemFilter> {
  protected apiUrl = '/api/imagem';

  constructor(http: HttpClient) {
    super(http);
  }

  upload(file: File, nome?: string): Observable<Imagem> {
    const formData = new FormData();
    formData.append('file', file);
    if (nome) formData.append('nome', nome);
    return this.http.post<Imagem>(`${this.apiUrl}/upload`, formData);
  }

  uploadForId(id: number, file: File, nome?: string): Observable<Imagem> {
    const formData = new FormData();
    formData.append('file', file);
    if (nome) formData.append('nome', nome);
    return this.http.put<Imagem>(`${this.apiUrl}/${id}/upload`, formData);
  }

  getArquivoUrl(id?: number): string | null {
    if (!id) return null;
    return `${this.apiUrl}/${id}/arquivo`;
  }
}
