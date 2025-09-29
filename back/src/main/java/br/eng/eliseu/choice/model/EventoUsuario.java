// Java
package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "evento_usuario",
        uniqueConstraints = @UniqueConstraint(columnNames = {"evento_id", "usuario_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EventoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Produto usuario;

    private StatusEnum status;


    // Fábrica conveniente
    public static EventoUsuario of(Evento evento, Produto usuario) {
        return EventoUsuario.builder()
                .evento(evento)
                .usuario(usuario)
                .build();
    }
}