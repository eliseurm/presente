package br.eng.eliseu.presente.model.core;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public abstract class BaseReportFilter {

    private Integer page = 0;
    private Integer size = 10;

    private String expand;

    private String nomeRelatorio;

    private String nomeArquivo;

}