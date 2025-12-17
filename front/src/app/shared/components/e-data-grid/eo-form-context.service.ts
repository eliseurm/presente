import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EoFormContextService {
    row: any = null;
    isNewRow: boolean = false;
    columns: any[] = [];
    templatesMap: Map<string, TemplateRef<any>> = new Map<string, TemplateRef<any>>();

    // Os métodos abaixo são fornecidos pelo grid via bindings do componente de contexto
    getTemplate?: (name: string) => (TemplateRef<any> | null | undefined);
    setFormItemValue?: (field: string, value: any) => void;
    getColumnByDataField?: (field: string) => any;
    hasError?: (field: string) => boolean;
    getErrors?: (field: string) => string[];
    isFieldRequired?: (item: any) => boolean;

    constructor() {
        // Mantemos sem inicialização; o template do <ei-item> usará optional chaining
    }
}
