import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton'; // Para o filtro Sim/Não/Todos

import { ClienteService } from '@/services/cliente.service';
import { EventoService } from '@/services/evento.service';
import { Cliente } from '@/shared/model/cliente';
import { EventoDto } from '@/shared/model/dto/evento-dto';
import { EventoReportFilter } from '@/shared/model/filter/evento-report-filter';
import { EventoFilter } from '@/shared/model/filter/evento-filter';
import {SelectModule} from "primeng/select";
import {Evento} from "@/shared/model/evento";

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
        SelectButtonModule
    ],
    templateUrl: './evento-report.component.html',
    providers: [MessageService]
})
export class EventoReportComponent implements OnInit {

    filter: EventoReportFilter = new EventoReportFilter();

    // Listas para os Dropdowns
    clientes: Cliente[] = [];
    eventos: Evento[] = [];

    // Opções para o "Já Escolheu?"
    opcoesEscolha = [
        { label: 'Todos', value: null },
        { label: 'Já Escolheu', value: true },
        { label: 'Não Escolheu', value: false }
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
        if (!this.filter.eventoId) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Selecione um Evento.'});
            return;
        }

        this.loading = true;

        this.eventoService.gerarRelatorioPdf(this.filter).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, `Relatorio_Evento_${this.filter.eventoId}.pdf`);
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
}
