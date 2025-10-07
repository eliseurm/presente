package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="imagem")
public class Imagem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String url;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "arquivo", columnDefinition = "LONGBLOB")
    private byte[] arquivo;

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
