import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { ImagemService } from '@/services/imagem.service';
import { Imagem } from '@/shared/model/imagem';
import { ImagemFilter } from '@/shared/model/filter/imagem-filter';
import { FilterField } from '@/shared/components/crud-filter/filter-field';
import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import { CrudComponent } from '@/shared/crud/crud.component';
import { TableModule } from 'primeng/table';
import { ErmDataGridComponent, ErmColumnComponent, ErmTemplateDirective } from '@/shared/components/erm-data-grid';
import { ImagemCrudVM } from './imagem-crud.vm';

@Component({
  selector: 'imagem-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    CrudFilterComponent,
    CrudComponent,
    TableModule,
    ErmDataGridComponent,
    ErmColumnComponent,
    ErmTemplateDirective
  ],
  templateUrl: './imagem-page.component.html',
  styleUrls: [
    '../../shared/components/crud-base/crud-base.component.scss'
  ],
  providers: [MessageService, ImagemCrudVM]
})
@CrudMetadata("EventoPageComponent", [Imagem, ImagemFilter])
export class ImagemPageComponent  {

  @ViewChild('crudRef') crudRef?: CrudComponent<Imagem, ImagemFilter>;

  // Campo de arquivo temporário para upload
  tempFile: File | null = null;
  previewUrl: string | null = null;

  readonly filterFields: FilterField[] = [
    { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' }
  ];

  constructor(
    public vm: ImagemCrudVM,
    private imagemService: ImagemService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void { this.vm.init(); }

  onLazyLoad(event: any) {
    const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
    const size = event.rows || this.vm.filter.size || 10;
    this.vm.filter.page = page;
    this.vm.filter.size = size;
    if (event.sortField) this.vm.filter.sort = event.sortField;
    if (typeof event.sortOrder === 'number') this.vm.filter.direction = event.sortOrder === 1 ? 'ASC' : 'DESC' as any;
    this.vm.doFilter().subscribe();
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

  // Salvamento será feito pelo CrudComponent via vm.doSave(). Aqui só cuidamos do upload se necessário.
  onBeforeSaveHandleUpload(): boolean {
    const data: any = this.vm.model as any;
    const id = data?.id as number | undefined;
    if (!this.tempFile) return false; // nada para fazer, segue fluxo normal do Crud

    const afterPersist = (createdOrUpdated?: Imagem) => {
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Upload realizado com sucesso` });
      this.tempFile = null;
      this.previewUrl = null;
      this.vm.doFilter().subscribe();
    };

    if (id) {
      this.imagemService.uploadForId(id, this.tempFile!, data?.nome || this.tempFile!.name).subscribe({
        next: (resp) => afterPersist(resp),
        error: (error) => {
          const detail = error?.error?.message || 'Erro ao atualizar arquivo da imagem';
          this.messageService.add({ severity: 'error', summary: 'Erro', detail });
        }
      });
    } else {
      this.imagemService.upload(this.tempFile!, data?.nome || this.tempFile!.name).subscribe({
        next: (resp) => afterPersist(resp),
        error: (error) => {
          const detail = error?.error?.message || 'Erro ao fazer upload da imagem';
          this.messageService.add({ severity: 'error', summary: 'Erro', detail });
        }
      });
    }
    return true; // interceptou salvamento por upload
  }

  onDeletingRow(row: any) {
    const id = row?.id;
    if (!id) return;
    this.imagemService.deletar(id).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Excluída com sucesso` }); this.vm.doFilter().subscribe(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir imagem' })
    });
  }

  getThumbUrl(img: Imagem): string | null {
    return this.imagemService.getArquivoUrl(img?.id);
  }

  onCloseCrud() { this.router.navigate(['/']); }
}
