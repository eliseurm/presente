package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccessKey {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    private Person person;

    private String tokenHash;

    @Column(name = "token_lookup", length = 255)
    private String tokenLookup; // sha256 truncado (16 chars) para lookup indexado

    private LocalDateTime expiresAt;

    private boolean singleUse = true;
    private LocalDateTime usedAt;
    private int usesCount;
}
