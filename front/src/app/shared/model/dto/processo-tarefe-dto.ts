export class ProgressoTarefaDto {

    progressoId: string = 'progress';
    status: string = '';
    atual: number = 0;
    total: number = 100;
    logErros: string[] = [];

    progresso: boolean = false;

    get percentual(): number {
        if(!this.total || this.total===0){
            return 0;
        }
        const calculo = (this.atual / this.total) * 100;

        return Math.round(calculo<=100 ? calculo : 100);

    }

}
