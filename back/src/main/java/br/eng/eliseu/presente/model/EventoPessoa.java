// Java
package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import br.eng.eliseu.presente.config.json.LenientObjectIdResolver;
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
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = Pessoa.class, resolver = LenientObjectIdResolver.class)
    @JsonIdentityReference(alwaysAsId = true)
    private Pessoa pessoa;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    public static EventoPessoa of(Evento evento, Pessoa pessoa) {
        return EventoPessoa.builder()
                .evento(evento)
                .pessoa(pessoa)
                .build();
    }
}
