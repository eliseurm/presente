export class StringUtils {

    private constructor() {}

    /**
     * Verifica se a string é nula, indefinida ou vazia (após trim)
     * @author Eliseu Rodrigues Menezes
     * @since 2025-12-16
     */
    public static isBlank(valor?: string | null): boolean {
        return !valor || valor.trim().length === 0;
    }

    /**
     * Remove tudo que não for número
     */
    public static somenteNumeros(valor?: string | null): string {
        return valor ? valor.replace(/\D/g, '') : '';
    }



    /**
     * Valida CPF brasileiro
     */
    public static validarCPF(cpf?: string | null): boolean {
        if (this.isBlank(cpf)) return false;

        const digits = this.somenteNumeros(cpf);

        if (digits.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(digits)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += Number(digits[i]) * (10 - i);
        }

        let resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        if (resto !== Number(digits[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += Number(digits[i]) * (11 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;

        return resto === Number(digits[10]);
    }
}
