package br.eng.eliseu.presente.model.dto;

import lombok.Data;

@Data
public class PresenteOrganogramaDto {

    private String nivel1;
    private String nivel2;
    private String nivel3;

    public PresenteOrganogramaDto(String nivel1, String nivel2, String nivel3) {
        this.nivel1 = nivel1;
        this.nivel2 = nivel2;
        this.nivel3 = nivel3;
    }
}

