import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'enumDescricao', // Deve ser exatamente igual ao usado no HTML
    standalone: true       // Essencial para componentes standalone
})
export class EnumDescricaoPipe implements PipeTransform {

    /**
     * @param value A chave do enum vinda do backend (ex: resumo.status)
     * @param mapping Um objeto contendo as traduções { 'CHAVE': 'Descrição' }
     */
    transform(value: string | number | undefined, mapping: { [key: string]: { descricao: string } }): string {
        if (value === null || value === undefined) {
            return '';
        }

        const key = String(value);

        // Verificamos se a chave existe no mapeamento antes de acessar
        if (mapping && key in mapping) {
            return mapping[key].descricao;
        }

        return key; // Retorna a chave original se não houver tradução
    }

}
