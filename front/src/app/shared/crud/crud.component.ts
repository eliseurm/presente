import {Component, EventEmitter, HostListener, Input, Output, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ToolbarModule} from 'primeng/toolbar';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {Mode} from '@/shared/crud/crud.mode';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {BaseFilter} from '@/shared/model/core/base-filter';
import {Nl2BrPipe} from "@/shared/pipe/nl2br.pipe";
import {Toast} from "primeng/toast";

@Component({
    selector: 'crud',
    standalone: true,
    imports: [CommonModule, ToolbarModule, ButtonModule, PanelModule, ConfirmDialogModule, Nl2BrPipe, Toast],
    templateUrl: './crud.component.html',
    styleUrls: ['./crud.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [ConfirmationService]
})
export class CrudComponent<T extends { id?: any; version?: number }, F extends BaseFilter> {

    Mode = Mode;

    @Input() parent!: AbstractCrud<T, F>;
    @Input() multipleSelection = false;
    @Input() collapsibleFilters = true;
    @Input() listToolbarTitle = 'Listagem';
    @Input() editToolbarTitle = 'Edição';

    // Visibilidade de botões (customizáveis)
    @Input() showListFilterButton = true;
    @Input() showListNewButton = true;
    @Input() showListClearButton = true;
    @Input() showListCloseButton = true;

    @Input() showEditSaveButton = true;
    @Input() showEditCancelButton = true;
    @Input() showEditDeleteButton = true;
    @Input() showEditNewButton = true;
    @Input() showEditCloseButton = true;

    // Aparência/UX
    @Input() wrapEditTemplateInCard = true; // envolve a área de edição em uma "caixa" branca (card)

    @Output() filterButtonAction = new EventEmitter<void>();
    // Evento de salvar com possibilidade de cancelar o salvamento padrão
    // Consumidor pode chamar event.preventDefault() para impedir parent.doSave()
    @Output() saveButtonAction = new EventEmitter<{ preventDefault: () => void }>();
    // Evento de exclusão com possibilidade de cancelamento do fluxo padrão
    // Consumidor pode chamar event.preventDefault() para impedir a confirmação/remoção padrão
    @Output() deleteButtonAction = new EventEmitter<{ preventDefault: () => void }>();
    @Output() closeButtonAction = new EventEmitter<void>();

    isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 576px)').matches;

    constructor(private confirmationService: ConfirmationService) {
    }

    // Hotkeys: somente em dispositivos com ponteiro "fine" (teclado/mouse)
    @HostListener('document:keydown', ['$event'])
    handleHotkeys(ev: KeyboardEvent) {
        const hasKeyboard = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: fine)').matches;
        if (!hasKeyboard) return;
        if (ev.altKey && (ev.key === 's' || ev.key === 'S')) {
            ev.preventDefault();
            this.onEditToolbarSaveButtonAction();
        }
        if (ev.altKey && (ev.key === 'f' || ev.key === 'F')) {
            ev.preventDefault();
            this.onEditToolbarCloseButtonAction();
        }
    }

    // List toolbar actions
    onListToolbarFilterButtonAction() {
        this.filterButtonAction.emit();
        this.parent?.doFilter().subscribe();
    }

    onListToolbarNewButtonAction() {
        this.parent?.doCreateNew();
    }

    onListToolbarClearButtonAction() {
        // recria filtro mantendo defaults do consumidor
        // newFilter é protected no AbstractCrud, então pedimos ao consumidor expor um método ou recriamos via storage reset
        // aqui optamos por limpar storage e reinicializar
        try {
            sessionStorage.removeItem(this.parent['storageKey']?.call(this.parent, 'filter'));
        } catch {
        }
        // fallback: se o consumidor expôs public newFilter, usa-o
        if ((this.parent as any).newFilter) {
            this.parent.filter = (this.parent as any).newFilter();
        }
        // Recarrega a lista após limpar
        this.parent?.doFilter().subscribe();
    }

    onListToolbarCloseButtonAction() {
        try {
            (this.parent as any)?.onListCloseRequested?.();
        } catch {
        }
        this.closeButtonAction.emit();
    }

    // Edit toolbar actions

    onEditToolbarSaveButtonAction() {
        if (!this.parent) return;
        if (this.parent.canDoSave()) {
            let prevented = false;
            const ev = {
                preventDefault: () => {
                    prevented = true;
                }
            };
            this.saveButtonAction.emit(ev);
            if (prevented) return;
            this.parent.doSave().subscribe();
        }
    }

    onEditToolbarCancelButtonAction() {
        this.parent?.doCancel();
    }

    onEditToolbarDeleteButtonAction() {
        let prevented = false;
        const ev = { preventDefault: () => { prevented = true; } };
        this.deleteButtonAction.emit(ev);
        if (prevented) return;
        if (!(this.parent?.model) || (this.parent as any).model.id == null) return;
        const id = (this.parent as any).model.id;
        this.confirmationService.confirm({
            message: 'Deseja realmente excluir este registro?',
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.parent!.doRemove(id).subscribe();
            }
        });
    }

    onEditToolbarNewButtonAction() {
        this.parent?.doCreateNew();
    }

    onEditToolbarCloseButtonAction() {
        if (this.parent) {
            this.parent.mode = Mode.List;
        }
        this.closeButtonAction.emit();
    }

    // Suporte a duplo clique na tabela (consumidor chama este método no (onRowDblclick))
    onRowDblClick(row: T) {
        if (this.parent) {
            // Usa o fluxo genérico de abertura para respeitar a opção de expand
            if ((this.parent as any).onRowOpen) {
                (this.parent as any).onRowOpen(row);
            }
            else {
                // fallback antigo: mantém comportamento prévio
                (this.parent as any).model = row as any;
                this.parent.mode = Mode.Edit;
                this.parent.refreshModel.next();
            }
        }
    }

    get errorMessages(): string[] {
        if (!this.parent?.errorsVisible) return [];
        return this.parent.errorMessages || [];
    }
}
