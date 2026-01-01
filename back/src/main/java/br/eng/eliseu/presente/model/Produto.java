package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="produto")
public class Produto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(columnDefinition="TEXT")
    private String descricao;

    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    private LocalDateTime criadoEm;
    private LocalDateTime alteradoEm;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT) // Otimização para evitar N+1 selects excessivos
    @Builder.Default // Garante que o Builder use essa inicialização
    private List<ProdutoEstoque> estoques = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE})
    @JoinTable(
            name = "produto_imagem",
            joinColumns = @JoinColumn(name = "produto_id"),
            inverseJoinColumns = @JoinColumn(name = "imagem_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"produto_id", "imagem_id"})
    )
    @Fetch(FetchMode.SUBSELECT)
    private List<Imagem> imagens;

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
