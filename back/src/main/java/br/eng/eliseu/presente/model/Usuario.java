package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="usuario")
public class Usuario {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Transient
    private String senha; // campo transitório para receber a senha em texto puro do frontend

    @Enumerated(EnumType.STRING)
    private PapelEnum papel;
    
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
