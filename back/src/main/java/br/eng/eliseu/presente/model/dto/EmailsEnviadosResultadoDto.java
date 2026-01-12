package br.eng.eliseu.presente.model.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EmailsEnviadosResultadoDto {
    private int enviados;
    private List<String> logErros;
}