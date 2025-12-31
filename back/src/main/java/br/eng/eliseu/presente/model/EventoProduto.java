// Java
package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import br.eng.eliseu.presente.config.json.LenientObjectIdResolver;
import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Table(
        name = "evento_produto",
        uniqueConstraints = @UniqueConstraint(columnNames = {"evento_id", "produto_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventoProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    @JsonBackReference(value = "evento-produtos")
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    @JsonIgnoreProperties({"tamanhos", "cores", "imagens"})
    private Produto produto;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    @Version
    private Long version;


    // Fábrica conveniente
    public static EventoProduto of(Evento evento, Produto produto) {
        return EventoProduto.builder()
                .evento(evento)
                .produto(produto)
                .build();
    }

    // Igualdade e hashCode baseados no ID quando persistido; caso contrário, na combinação (evento.id, produto.id)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EventoProduto that = (EventoProduto) o;
        if (this.id != null && that.id != null) {
            return Objects.equals(this.id, that.id);
        }
        Long thisEvt = this.evento != null ? this.evento.getId() : null;
        Long thatEvt = that.evento != null ? that.evento.getId() : null;
        Long thisProd = this.produto != null ? this.produto.getId() : null;
        Long thatProd = that.produto != null ? that.produto.getId() : null;
        return Objects.equals(thisEvt, thatEvt) && Objects.equals(thisProd, thatProd);
    }

    @Override
    public int hashCode() {
        if (id != null) return Objects.hash(id);
        Long evt = this.evento != null ? this.evento.getId() : null;
        Long prod = this.produto != null ? this.produto.getId() : null;
        return Objects.hash(evt, prod);
    }
}