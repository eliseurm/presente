package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SelecionadoItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Selecionado selecionado;

    @ManyToOne(optional = false)
    private Produto produto;

    private int quantity;

    @ManyToOne
    @JoinColumn(name = "tamanho")
    private Tamanho tamanho;

    @ManyToOne
    @JoinColumn(name = "cor")
    private Cor cor;

}
