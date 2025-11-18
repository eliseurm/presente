package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import br.eng.eliseu.presente.config.json.LenientObjectIdResolver;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="evento")
public class Evento {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String descricao;

    @ManyToOne
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = Cliente.class, resolver = LenientObjectIdResolver.class)
    @JsonIdentityReference(alwaysAsId = true)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    private String anotacoes;

    private LocalDateTime inicio;

    @Column(name = "fim_previsto")
    private LocalDateTime fimPrevisto;

    private LocalDateTime fim;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    @JsonManagedReference(value = "evento-produtos")
    private Set<EventoProduto> produtos;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    @JsonManagedReference(value = "evento-pessoas")
    private List<EventoPessoa> pessoas;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    @Column(name = "alterado_em")
    private LocalDateTime alteradoEm;

    // Controle de concorrência otimista
    @Version
    private Long version;



    @PrePersist
    public void prePersist(){
        if (criadoEm == null) criadoEm = LocalDateTime.now();
        if (alteradoEm == null) alteradoEm = criadoEm;
    }

    @PreUpdate
    public void preUpdate(){
        alteradoEm = LocalDateTime.now();
        if (fimPrevisto != null && fimPrevisto.isBefore(LocalDateTime.now())) {
            fim = LocalDateTime.now();
        }
        if (fim != null) {
            status = StatusEnum.ENCERRADO;
        }
    }
}