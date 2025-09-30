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

    @Enumerated(EnumType.STRING)
    private PapelEnum papel;

    private StatusEnum status;


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
