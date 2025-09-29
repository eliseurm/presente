package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="selection")
public class Selecionado {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private Evento evento;

    @OneToOne(optional = false)
    private Pessoa pessoa;

    @ManyToOne(optional = false)
    private Produto produto;

    private Integer quantidade;

    @ManyToOne
    @JoinColumn(name = "tamanho")
    private Tamanho tamanho;

    @ManyToOne
    @JoinColumn(name = "cor")
    private Cor cor;

    private String anotacoes;



    private LocalDateTime criadoEm;
    private LocalDateTime alteradoEm;

    @PrePersist
    public void prePersist(){
        if(criadoEm==null) criadoEm = LocalDateTime.now();
        if(alteradoEm==null) alteradoEm = criadoEm;
        if(quantidade==null) quantidade = 1;
    }

    @PreUpdate
    public void preUpdate(){
        alteradoEm = LocalDateTime.now();
    }

}
