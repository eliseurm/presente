import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {ToastModule} from 'primeng/toast';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ClienteService} from '@/services/cliente.service';
import {EventoService} from '@/services/evento.service';
import {Cliente} from '@/shared/model/cliente';
import {EventoReportFilter} from '@/shared/model/filter/evento-report-filter';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {SelectModule} from "primeng/select";
import {Evento} from "@/shared/model/evento";
import {EnumSelectComponent} from "@/shared/components/enum-select/enum-select.component";
import {EventoReportEnum, EventoReportOptions} from "@/shared/model/enum/evento-report.enum";
import {InputTextModule} from "primeng/inputtext";
import {StatusEnum} from "@/shared/model/enum/status.enum";

@Component({
    selector: 'app-evento-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        SelectModule,
        PanelModule,
        ToastModule,
        SelectButtonModule,
        EnumSelectComponent,
        InputTextModule
    ],
    templateUrl: './evento-report.component.html',
    styleUrls: ['./evento-report.component.scss'],
    providers: [MessageService]
})
export class EventoReportComponent implements OnInit {

    eventoReportEnumType = EventoReportOptions;

    filter: EventoReportFilter = new EventoReportFilter();

    // Listas para os Dropdowns
    clientes: Cliente[] = [];
    eventos: Evento[] = [];

    // Opções para o "Já Escolheu?"
    opcoesEscolha = [
        { label: 'Todos', value: -1 },
        { label: 'Já Escolheu', value: 1 },
        { label: 'Não Escolheu', value: 0 }
    ];

    loading: boolean = false;

    constructor(
        private clienteService: ClienteService,
        private eventoService: EventoService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.carregarClientes();
    }

    carregarClientes() {
        this.clienteService.getMe().subscribe({
            next: (data) => {
                this.clientes = data || [];
                // Se tiver apenas um cliente, seleciona automaticamente
                if (this.clientes.length === 1) {
                    this.filter.clienteId = this.clientes[0].id;
                    this.carregarEventos();
                }
            },
            error: () => this.messageService.add({severity:'error', summary:'Erro', detail:'Erro ao carregar clientes.'})
        });
    }

    carregarEventos() {
        this.eventos = [];
        this.filter.eventoId = undefined; // Limpa evento se trocar cliente

        if (!this.filter.clienteId) return;

        const eventoFilter = new EventoFilter();
        eventoFilter.clienteId = this.filter.clienteId;
        // Traz todos sem paginar (size -1 ou logica de unpaged do seu back)
        eventoFilter.size = 1000;

        this.eventoService.listar(eventoFilter).subscribe({
            next: (page) => {
                this.eventos = page.content || [];
            },
            error: () => this.messageService.add({severity:'error', summary:'Erro', detail:'Erro ao carregar eventos.'})
        });
    }

    gerarRelatorio() {
        // Validações anteriores...
        if (!this.filter.eventoId) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Selecione um Evento.'});
            return;
        }

        // Nova Validação
        if (!this.filter.nomeRelatorio) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Selecione o Tipo de Relatório.'});
            return;
        }


        this.filter.nomeRelatorio = EventoReportEnum.toKey(this.filter.nomeRelatorio);

        // Garante que o nome do arquivo tenha extensão .pdf
        let nomeFinal = this.filter.nomeArquivo || 'relatorio.pdf';
        if (!nomeFinal.endsWith('.pdf')) {
            nomeFinal += '.pdf';
        }
        this.filter.nomeArquivo = nomeFinal;

        this.loading = true;

        this.eventoService.gerarRelatorioPdf(this.filter).subscribe({
            next: (blob: Blob) => {
                // Usa o nome definido pelo usuário para baixar
                this.downloadFile(blob, this.filter.nomeArquivo!);
                this.loading = false;
                this.messageService.add({severity:'success', summary:'Sucesso', detail:'Relatório gerado.'});
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.messageService.add({severity:'error', summary:'Erro', detail:'Falha ao gerar relatório PDF.'});
            }
        });
    }

    // Método auxiliar para fazer o navegador baixar o arquivo
    private downloadFile(blob: Blob, fileName: string) {

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    }

    onRelatorioChange(event: any) {
        // Sugestão automática baseada na seleção
        if (event) {
            const nomeSugestao = `relatorio_${event.arquivoPadrao}`;
            this.filter.nomeArquivo = this.formatarNomeArquivo(nomeSugestao);
        }
    }

    sanitizarNomeArquivo() {
        if (this.filter.nomeArquivo) {
            this.filter.nomeArquivo = this.formatarNomeArquivo(this.filter.nomeArquivo);
        }
    }

    private formatarNomeArquivo(nome: string): string {
        return nome
            .toLowerCase() // Tudo minúsculo
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .trim()
            .replace(/\s+/g, '_') // Espaço vira underline
            .replace(/[^a-z0-9._-]/g, ''); // Remove caracteres especiais indesejados
        // Nota: Não adiciono .pdf aqui para deixar o usuário editar livremente,
        // mas adiciono na hora de salvar se faltar.
    }

}
