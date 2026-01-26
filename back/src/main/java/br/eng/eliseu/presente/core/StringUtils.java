package br.eng.eliseu.presente.core;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class StringUtils {

    // Lista de preposições que geralmente permanecem em minúsculo em nomes brasileiros
    private static final List<String> PREPOSICOES = Arrays.asList("de", "da", "do", "das", "dos", "e");

    public static String normalizarNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return "";
        }

        // O regex [\\/\\\\] captura tanto "/" quanto "\" e substitui por branco
        String nomeSemBarras = nome.replaceAll("[\\\\/]", " ");

        // 1. Remove acentos e caracteres especiais
        String semAcento = Normalizer.normalize(nomeSemBarras, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String textoPuro = pattern.matcher(semAcento).replaceAll("");

        // 2. Converte para minúsculo e remove espaços extras nas extremidades e entre palavras
        String[] palavras = textoPuro.toLowerCase().trim().split("\\s+");

        // 3. Processa cada palavra
        String preposicoes = Arrays.stream(palavras)
                .map(palavra -> {
                    if (PREPOSICOES.contains(palavra)) {
                        return palavra; // Mantém preposição em minúsculo
                    }
                    // Capitaliza a primeira letra
                    return palavra.substring(0, 1).toUpperCase() + palavra.substring(1);
                })
                .collect(Collectors.joining(" "));

        return preposicoes;
    }

    public static String calcularDigitosVerificadoresCpf(String cpf) {
        if (cpf == null) {
            throw new IllegalArgumentException("CPF não pode ser nulo");
        }

        // 1. Remove tudo que não for número
        String numeros = cpf.replaceAll("\\D", "");

        // 2. Valida se tem o mínimo necessário para calcular (9 dígitos base)
        if (numeros.length() < 9) {
            numeros = String.format("%9s", numeros).replace(' ', '0');
        }

        // Pega apenas os 9 primeiros dígitos para iniciar o cálculo
        String base = numeros.substring(0, 9);

        // 3. Cálculo do 1º Dígito (peso começa em 10)
        int digito1 = calcularDigitoRotina(base, 10);

        // 4. Cálculo do 2º Dígito (adiciona o digito1 à base, peso começa em 11)
        int digito2 = calcularDigitoRotina(base + digito1, 11);

        return base + String.valueOf(digito1) + String.valueOf(digito2);
    }

    private static int calcularDigitoRotina(String str, int pesoInicial) {
        int soma = 0;
        int peso = pesoInicial;

        for (int i = 0; i < str.length(); i++) {
            // Converte char numérico para int ('0' tem valor 48 na tabela ASCII)
            int num = str.charAt(i) - '0';
            soma += num * peso;
            peso--;
        }

        int resto = soma % 11;

        // Regra do CPF: Se resto < 2, dígito é 0. Senão, é 11 - resto.
        return (resto < 2) ? 0 : 11 - resto;
    }


}
