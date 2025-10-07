package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    private Boolean status;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "produto_tamanho",
            joinColumns = @JoinColumn(name = "produto_id"),
            inverseJoinColumns = @JoinColumn(name = "tamanho_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"produto_id", "tamanho_id"})
    )
    private List<Tamanho> tamanhos;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "produto_cor",
            joinColumns = @JoinColumn(name = "produto_id"),
            inverseJoinColumns = @JoinColumn(name = "cor_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"produto_id", "cor_id"})
    )
    private List<Cor> cores;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "produto_imagem",
            joinColumns = @JoinColumn(name = "produto_id"),
            inverseJoinColumns = @JoinColumn(name = "imagem_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"produto_id", "imagem_id"})
    )
    private List<Imagem> imagens;


    private LocalDateTime criadoEm;
    private LocalDateTime alteradoEm;

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
