package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="selection")
public class Selection {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private Person person;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String notes;

    @OneToMany(mappedBy = "selection", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SelectionItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist(){
        if(createdAt==null) createdAt = LocalDateTime.now();
        if(updatedAt==null) updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate(){
        updatedAt = LocalDateTime.now();
    }
}
