package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="tamanho")
public class Tamanho {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private ProdutoTipoEnum tipo;

    private String tamanho;

}
