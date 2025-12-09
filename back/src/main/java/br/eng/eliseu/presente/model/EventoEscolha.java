// Java
package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evento_escolha")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventoEscolha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    @JsonBackReference(value = "evento-escolhas")
    @JsonIgnoreProperties({"produtos", "pessoas"})
    private Evento evento;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "pessoa_id", nullable = false)
    private Pessoa pessoa;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    @JsonIgnoreProperties({"tamanhos", "cores", "imagens"})
    private Produto produto;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cor_id", nullable = false)
    private Cor cor;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "tamanho_id", nullable = false)
    private Tamanho tamanho;

    @Column(name = "dt_escolha")
    private LocalDateTime dataEscolha;

    @Column(name = "alterado_em")
    private LocalDateTime alteradoEm;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    @PrePersist
    public void prePersist() {
        if (dataEscolha == null) dataEscolha = LocalDateTime.now();
    }

}