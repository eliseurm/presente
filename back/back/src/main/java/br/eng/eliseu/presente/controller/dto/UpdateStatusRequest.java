package br.eng.eliseu.presente.controller.dto;

import br.eng.eliseu.presente.model.StatusEnum;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    private StatusEnum status;
}
