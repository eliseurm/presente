package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="evento")
public class Evento {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String descricao;

    @ManyToOne
    private Cliente cliente;

    private StatusEnum status;

    private String anotacoes;

    private LocalDateTime fimPrevisto;

    private LocalDateTime fim;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventoProduto> produtos;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventoUsuario> usuarios;



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
        if(fimPrevisto!=null && fimPrevisto.isBefore(LocalDateTime.now())){
            // prevista e maior que hoje
            fim = LocalDateTime.now();
        }
        if(fim!=null){
            status = StatusEnum.ENCERRADO;
        }
    }


}
