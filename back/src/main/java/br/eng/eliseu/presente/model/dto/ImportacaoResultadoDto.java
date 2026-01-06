package br.eng.eliseu.presente.model.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ImportacaoResultadoDto {
    private int adicionados;
    private List<String> logErros;
}