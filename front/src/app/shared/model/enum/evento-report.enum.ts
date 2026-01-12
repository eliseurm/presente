const _EventoReportEnum = {
    EVENTO_PESSOAS_INFO: {key: 'EVENTO_PESSOAS_INFO', descricao: 'Relaçao de Pessoas neste Evento', arquivoPadrao: 'evento_pessoas_info.pdf'},
    EVENTO_ETIQUETAS_CORREIOS: {key: 'EVENTO_ETIQUETAS_CORREIOS', descricao: 'Gerar etiquetas de Destino', arquivoPadrao: 'etiquetas_destino.pdf'}
} as const;

export type EventoReportEnum = (typeof _EventoReportEnum)[keyof typeof _EventoReportEnum];

export const EventoReportEnum = {
    ..._EventoReportEnum,

    // Utility function attached directly to the object
    toKey: (value: any): any => {
        if (!value) return EventoReportEnum.EVENTO_PESSOAS_INFO.key;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return (value.key || value.name || value.toString());
        return String(value);
    }
};

export const EventoReportOptions = Object.values(EventoReportEnum).filter(
    (item) => typeof item === 'object' && item !== null && 'key' in item
) as EventoReportEnum[];


