package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="tamanho")
public class Tamanho {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ProdutoTipoEnum tipo;

    private String tamanho;

    // Controle de concorrência otimista
    @Version
    private Long version;

}
