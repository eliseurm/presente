export interface IEColumn {
    dataField: string;
    caption?: string;
    dataType?: 'string' | 'number' | 'date' | 'boolean' | any;
    visible?: boolean;
    width?: string | number;
    editCellTemplate?: string;
    lookup?: IELookup;
}

export interface IELookup {
    dataSource: any[];
    displayExpr: string;
    valueExpr: string;
}

export interface IEValidationRule {
    type: 'required' | 'email' | 'pattern';
    message: string;
    pattern?: string;
}

export interface EFormItem {
    dataField: string;
    label?: string;
    colSpan?: number;
    editorType?: 'text' | 'number' | 'date' | 'template' | 'enum';
    validationRules?: IEValidationRule[];
    template?: string;
}

export interface IEEditingConfig {
    mode: 'popup' | 'inline';
    allowAdding: boolean;
    allowUpdating: boolean;
    allowDeleting: boolean;
    confirmDelete: boolean;
}

export interface IEPopupConfig {
    title: string;
    showTitle: boolean;
    width: string;
    height: string;
}

export interface IEFormConfig {
    colCount: number;
}

export interface IEDataGridEvent {
    data?: any;
    isNew?: boolean;
    cancel?: boolean;
}
