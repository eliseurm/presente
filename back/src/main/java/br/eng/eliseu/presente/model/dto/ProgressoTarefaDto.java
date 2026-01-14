package br.eng.eliseu.presente.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ProgressoTarefaDto {

    private String progressoId;
    private String status; // PROCESSANDO, CONCLUIDO,
    private int atual;
    private int total;

    private List<String> logErros;


}
