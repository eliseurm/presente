import {BaseReportFilter} from "@/shared/model/core/base-report-filter";

export class EventoReportFilter extends BaseReportFilter{

    id?: number;

    clienteId?: number;
    eventoId?: number;
    jaEscolheu?: number; // null|-1 = todos, 1 = sim, 0 = não
}
