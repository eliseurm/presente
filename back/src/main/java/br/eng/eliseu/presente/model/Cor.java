package br.eng.eliseu.presente.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="cor")
public class Cor {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(name = "cor_hex", length = 10)
    private String corHex;

    @Column(name = "cor_rgba", length = 30)
    private String corRgbA;

    @Version
    private Long version;


}
