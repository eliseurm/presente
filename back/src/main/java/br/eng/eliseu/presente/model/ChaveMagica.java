package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="chave_magica")
public class ChaveMagica {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    private Pessoa pessoa;

    private String tokenHash;

    @Column(name = "token_lookup", length = 255)
    private String tokenLookup; // sha256 truncado (16 chars) para lookup indexado

    private LocalDateTime expiraEm;

    private Boolean usoUnico = true;

    private LocalDateTime utilizado;

    private Integer quantidadeAcesso;

    @Version
    private Long version;

}
