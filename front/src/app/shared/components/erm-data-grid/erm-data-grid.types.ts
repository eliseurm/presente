export interface ErmColumn {
    dataField: string;
    caption?: string;
    dataType?: 'string' | 'number' | 'date' | 'boolean' | any;
    visible?: boolean;
    width?: string | number;
    editCellTemplate?: string;
    lookup?: ErmLookup;
}

export interface ErmLookup {
    dataSource: any[];
    displayExpr: string;
    valueExpr: string;
}

export interface ErmValidationRule {
    type: 'required' | 'email' | 'pattern';
    message: string;
    pattern?: string;
}

export interface ErmFormItem {
    dataField: string;
    label?: string;
    colSpan?: number;
    editorType?: 'text' | 'number' | 'date' | 'dropdown' | 'template';
    validationRules?: ErmValidationRule[];
    template?: string;
}

export interface ErmEditingConfig {
    mode: 'popup' | 'inline';
    allowAdding: boolean;
    allowUpdating: boolean;
    allowDeleting: boolean;
    confirmDelete: boolean;
}

export interface ErmPopupConfig {
    title: string;
    showTitle: boolean;
    width: string;
    height: string;
}

export interface ErmFormConfig {
    colCount: number;
}

export interface ErmDataGridEvent {
    data?: any;
    isNew?: boolean;
}
