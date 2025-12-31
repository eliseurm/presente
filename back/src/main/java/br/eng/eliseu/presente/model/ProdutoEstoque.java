package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="produto_estoque") // Nome da tabela no banco
public class ProdutoEstoque {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento com o Produto Principal
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "tamanho_id", nullable = false)
    private Tamanho tamanho;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cor_id", nullable = false)
    private Cor cor;

    private BigDecimal preco;

    @Column(precision = 19, scale = 2)
    private BigDecimal quantidade;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    private LocalDateTime criadoEm;
    private LocalDateTime alteradoEm;

    @Version
    private Long version;

    @PrePersist
    public void prePersist(){
        if(criadoEm==null) criadoEm = LocalDateTime.now();
        if(alteradoEm==null) alteradoEm = criadoEm;
    }

    @PreUpdate
    public void preUpdate(){
        alteradoEm = LocalDateTime.now();
    }
}