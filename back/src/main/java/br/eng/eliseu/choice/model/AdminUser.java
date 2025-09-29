package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist(){
        if(createdAt==null) createdAt = LocalDateTime.now();
    }
}
