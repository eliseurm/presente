export class NumberUtils {

    private constructor() {}

    /**
     * Verifica se o valor é número válido
     * @author Eliseu Rodrigues Menezes
     * @since 2025-12-16
     */
    public static isNumber(valor: any): boolean {
        return typeof valor === 'number' && !isNaN(valor);
    }

    /**
     * Converte para número ou retorna null
     */
    public static toNumber(valor: any): number | null {
        const n = Number(valor);
        return isNaN(n) ? null : n;
    }

    /**
     * Retorna zero se nulo ou indefinido
     */
    public static zeroIfNull(valor?: number | null): number {
        return valor ?? 0;
    }

    /**
     * Limita um número entre mínimo e máximo
     */
    public static clamp(valor: number, min: number, max: number): number {
        return Math.min(Math.max(valor, min), max);
    }
}
