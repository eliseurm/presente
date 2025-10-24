import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { CrudBaseComponent } from '@/shared/components/crud-base/crud-base.component';
import { ImagemService } from '@/services/imagem.service';
import { Imagem } from '@/shared/model/imagem';
import { ImagemFilter } from '@/shared/model/filter/imagem-filter';
import { FilterField } from '@/shared/components/crud-filter/filter-field';
import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import {
  ErmColumnComponent,
  ErmDataGridComponent,
  ErmEditingComponent,
  ErmFormComponent,
  ErmItemComponent,
  ErmPopupComponent,
  ErmTemplateDirective,
  ErmValidationRuleComponent
} from '@/shared/components/erm-data-grid';
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import {Pessoa} from "@/shared/model/pessoa";
import {PessoaFilter} from "@/shared/model/filter/pessoa-filter";

@Component({
  selector: 'imagem-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    CrudFilterComponent,
    ErmDataGridComponent,
    ErmEditingComponent,
    ErmPopupComponent,
    ErmFormComponent,
    ErmItemComponent,
    ErmColumnComponent,
    ErmValidationRuleComponent,
    ErmTemplateDirective
  ],
  templateUrl: './imagem-page.component.html',
  styleUrls: [
    '../../shared/components/crud-base/crud-base.component.scss'
  ],
  providers: [MessageService]
})
@CrudMetadata("EventoPageComponent", [Imagem, ImagemFilter])
export class ImagemPageComponent extends CrudBaseComponent<Imagem, ImagemFilter> {

  // Campo de arquivo temporário para upload
  tempFile: File | null = null;
  previewUrl: string | null = null;

  readonly filterFields: FilterField[] = [
    { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' }
  ];

  constructor(
    private imagemService: ImagemService,
    messageService: MessageService
  ) {
    super(imagemService, messageService, null as any);
  }

  override isFormularioValido(): boolean {
    return !!(this.model?.nome?.trim());
  }

  onInitNewRow(event: any) {
    this.tempFile = null;
    this.previewUrl = null;
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0] as File | undefined;
    if (file) {
      this.tempFile = file;
      // Gera preview local
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSavingItem(event: any) {
    const data: Imagem = event.data as Imagem;
    const id = (data as any).id as number | undefined;

    const afterPersist = (createdOrUpdated?: Imagem) => {
      const wasUpdate = !!(id);
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Dado ${wasUpdate ? 'atualizada' : 'criada'} com sucesso` });
      this.tempFile = null;
      this.previewUrl = null;
      this.closePopupIfAvailable();
      this.carregarDataSource();
    };

    if (this.tempFile) {
      // Se há arquivo:
      if (id) {
        // Atualiza arquivo mantendo o mesmo registro
        this.imagemService.uploadForId(id, this.tempFile, data?.nome || this.tempFile.name).subscribe({
          next: (resp) => afterPersist(resp),
          error: (error) => {
            const detail = error?.error?.message || 'Erro ao atualizar arquivo da imagem';
            this.messageService.add({ severity: 'error', summary: 'Erro', detail });
          }
        });
      } else {
        // Cria novo registro com arquivo
        this.imagemService.upload(this.tempFile, data?.nome || this.tempFile.name).subscribe({
          next: (resp) => afterPersist(resp),
          error: (error) => {
            const detail = error?.error?.message || 'Erro ao fazer upload da imagem';
            this.messageService.add({ severity: 'error', summary: 'Erro', detail });
          }
        });
      }
      return;
    }

    // Sem arquivo: salva somente metadados
    const op$ = id ? this.imagemService.atualizar(id, data) : this.imagemService.criar(data);
    op$.subscribe({
      next: (resp) => afterPersist(resp),
      error: (error) => {
        const detail = error?.error?.message || 'Erro ao salvar imagem';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      }
    });
  }

  private closePopupIfAvailable() {
    // Fecha o popup do grid, se exposto via método público. Como o componente
    // é isolado, vamos apenas simular o fechamento provocando um reload que já
    // oculta o dialog na implementação atual.
    // Mantido para possível extensão futura.
  }

  onDeletingItem(event: any) {
    const id = (event?.data as any)?.id;
    if (!id) return;
    this.imagemService.deletar(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Dado excluída com sucesso` });
        this.carregarDataSource();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir imagem' })
    });
  }

  getThumbUrl(img: Imagem): string | null {
    return this.imagemService.getArquivoUrl(img?.id);
  }
}
