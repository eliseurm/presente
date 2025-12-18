package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="pessoa")
public class Pessoa {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties({"usuario"})
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private String nome;

    @NotBlank(message = "Cpf é obrigatório")
    @Pattern(regexp = "^\\+?\\d{11}$", message = "O CPF deve ter sempre 11 numeros.")
    @Column(unique = true, nullable = false)
    private String cpf;

    @NotBlank(message = "Telefone é obrigatório")
    @Pattern(regexp = "^\\+?\\d{8,15}$", message = "Telefone inválido. Use apenas dígitos, opcional '+' no início, 8-15 dígitos")
    @Column(unique = true, nullable = false)
    private String telefone;

    @Email(message = "Email inválido")
    @NotBlank(message = "Email é obrigatório")
    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;
    
    private String endereco;
    
    private String complemento;
    
    private String cidade;
    
    private String estado;
    
    private String cep;

    // Senha em texto puro (requisito), máximo 8 caracteres
    @Size(max = 8, message = "Senha da pessoa deve ter no máximo 8 caracteres")
    @Column(name = "senha", length = 8)
    private String senha;

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
