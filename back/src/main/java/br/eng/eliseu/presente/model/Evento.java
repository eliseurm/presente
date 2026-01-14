package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    @JsonIgnoreProperties({"usuario"})
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    private String anotacoes;

    private LocalDateTime inicio;

    @Column(name = "fim_previsto")
    private LocalDateTime fimPrevisto;

    private LocalDateTime fim;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    @Column(name = "alterado_em")
    private LocalDateTime alteradoEm;

    @Column(name = "prog_status")
    private String progStatus;
    @Column(name = "prog_atual")
    private int progAtual;
    @Column(name = "prog_total")
    private int progTotal;
    @Column(name = "prog_label")
    private String progLabel;


    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    @JsonManagedReference(value = "evento-produtos")
    private Set<EventoProduto> eventoProdutos;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    @JsonManagedReference(value = "evento-pessoas")
    private List<EventoPessoa> eventoPessoas;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    @JsonManagedReference(value = "evento-escolhas")
    @JsonIgnore // Evita carregar/serializar escolhas na listagem e previne LazyInitializationException
    private List<EventoEscolha> eventoEscolhas;



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
        // Removida a lógica automática que alterava campos de data/status.
    }
}