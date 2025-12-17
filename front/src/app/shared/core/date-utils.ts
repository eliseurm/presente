export class DateUtils {

    private constructor() {}

    /**
     * Retorna data atual sem horário
     * @author Eliseu Rodrigues Menezes
     * @since 2025-12-16
     */
    public static hoje(): Date {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    /**
     * Converte string para Date ou null
     */
    public static toDate(valor?: string | Date | null): Date | null {
        if (!valor) return null;
        const d = valor instanceof Date ? valor : new Date(valor);
        return isNaN(d.getTime()) ? null : d;
    }

    /**
     * Formata data no padrão dd/MM/yyyy
     */
    public static formatarBR(data?: Date | null): string {
        if (!data) return '';
        return data.toLocaleDateString('pt-BR');
    }

    /**
     * Verifica se a data é válida
     */
    public static isValid(data?: Date | null): boolean {
        return !!data && !isNaN(data.getTime());
    }

    /**
     * Soma dias a uma data
     */
    public static adicionarDias(data: Date, dias: number): Date {
        const nova = new Date(data);
        nova.setDate(nova.getDate() + dias);
        return nova;
    }
}
