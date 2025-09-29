package br.eng.eliseu.choice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SelectionItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Selection selection;

    @ManyToOne(optional = false)
    private Product product;

    private int quantity;
}
