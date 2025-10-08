package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="cliente")
public class Cliente {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String email;

    private String telefone;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private String anotacoes;

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
