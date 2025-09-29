package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Person {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String status; // INVITED, ACTIVE, COMPLETED

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist(){
        if(createdAt==null) createdAt = LocalDateTime.now();
        if(status==null) status = "INVITED";
    }
}
