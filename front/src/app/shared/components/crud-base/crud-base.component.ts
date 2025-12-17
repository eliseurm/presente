import {Component, Directive, inject, Injectable, Injector, Input, OnInit, ViewChild} from '@angular/core';
import {TableLazyLoadEvent} from 'primeng/table';
import {ConfirmationService, MessageService, ToastMessageOptions} from 'primeng/api';
import {BaseCrudService} from '../../services/base-crud.service';
import {BaseFilter} from '../../model/filter/base-filter';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {CrudComponent} from "@/shared/crud/crud.component";
import {Pessoa} from "@/shared/model/pessoa";
import {PessoaFilter} from "@/shared/model/filter/pessoa-filter";
import {Subject} from "rxjs";
import {AbstractCrud} from "@/shared/crud/abstract.crud";

@Directive()
export class CrudBaseComponent<T extends { id?: any; version?: number }, F extends BaseFilter> implements OnInit {

    @ViewChild('crudRef') crudRef?: CrudComponent<Pessoa, PessoaFilter>;

    loading = false;
    totalRecords = 0;
    messages: ToastMessageOptions[] = [];


    // protected messageSubject: Subject<any[]> = new Subject<any>();
    // protected messageService = inject(MessageService);

    protected constructor(
        protected messageService: MessageService,
        protected vm: AbstractCrud<T, F>) {

    }


    ngOnInit(): void {
        this.vm.messageToastSubject.subscribe(message => {
            if (Array.isArray(message)) {
                for (const m of message) {
                    this.messageToastAdd(m);
                }
            }
            else if (message) {
                this.messageToastAdd(message);
            }
            this.messageToastShow();
        });
    }


    messageToastAdd(toastOptions: any ){
        if(typeof toastOptions === 'object'){
            this.messages.push(toastOptions);
        }
        else {
            this.messageToastAdd({detail: toastOptions, summary: 'Atençao', severity: 'warn', life: 3000});
        }
    }

    // messageToastAdd(msg: string, resumo?: string, tipo?: 'success'|'info'|'warn'|'error', tempo?: number ){
    //     this.messages.push({
    //         severity: tipo ?? 'info',
    //         summary: resumo ?? 'Atençao',
    //         life: tempo ?? 3000,
    //         detail: msg
    //     });
    // }

    messageToastAddAndShow(msg: string, resumo?: string, tipo?: 'success'|'info'|'warn'|'error', tempo?: number ){
        this.messageToastAdd({detail: msg, summary: resumo, severity: tipo, life: tempo});
        this.messageToastShow();
    }

    messageToastShow(): void {
        this.vm.errorsVisible = false; // se for exibir toast nao exibe no corpo
        this.vm.errorMessages = [];
        if(this.messages && this.messages.length > 0){
            this.messageService.addAll(this.messages);
        }
        this.messages = [];
    }


}
