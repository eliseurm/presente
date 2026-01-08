// Java
package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "evento_pessoa",
        uniqueConstraints = @UniqueConstraint(columnNames = {"evento_id", "pessoa_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EventoPessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    @JsonBackReference(value = "evento-pessoas")
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pessoa_id", nullable = false)
    @JsonIgnoreProperties({})
    private Pessoa pessoa;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    // Armazena o token completo no formato: primeiroNome_code8 (ex.: Maria_A1B2C3D4)
    @Column(name = "numero_magico", length = 64)
    private String nomeMagicNumber;

    private String organo_nivel_1;

    private String organo_nivel_2;

    private String organo_nivel_3;

    private String localTrabalho;

    @Version
    private Long version;


    public static EventoPessoa of(Evento evento, Pessoa pessoa) {
        return EventoPessoa.builder()
                .evento(evento)
                .pessoa(pessoa)
                .build();
    }
}
