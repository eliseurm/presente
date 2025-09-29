// Java
package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "evento_produto",
        uniqueConstraints = @UniqueConstraint(columnNames = {"evento_id", "produto_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EventoProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    private StatusEnum status;


    // Fábrica conveniente
    public static EventoProduto of(Evento evento, Produto produto) {
        return EventoProduto.builder()
                .evento(evento)
                .produto(produto)
                .build();
    }
}