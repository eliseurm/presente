package br.eng.eliseu.choice;

import br.eng.eliseu.choice.model.*;
import br.eng.eliseu.choice.repository.*;
import br.eng.eliseu.choice.service.TokenUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class SampleDataLoader {

    @Bean
    CommandLineRunner initData(ProdutoRepository productRepo,
                               PessoaRepository personRepo,
                               ChaveMagicaRepository accessKeyRepo,
                               UsuarioRepository adminRepo,
                               TokenUtil tokenUtil,
                               BCryptPasswordEncoder encoder){
        return args -> {
            if(adminRepo.findByUsername("admin").isEmpty()){
                Usuario adm = Usuario.builder()
                        .username("admin")
                        .passwordHash(encoder.encode("changeme123"))
                        .build();
                adminRepo.save(adm);
                System.out.println("===> ADMIN criado: admin / changeme123");
            }

            if(productRepo.count()==0){
                productRepo.saveAll(List.of(
                        Produto.builder().nome("Produto A").descricao("Descrição A").preco(BigDecimal.valueOf(10.0)).build(),
                        Produto.builder().nome("Produto B").descricao("Descrição B").preco(BigDecimal.valueOf(20.0)).build(),
                        Produto.builder().nome("Produto C").descricao("Descrição C").preco(BigDecimal.valueOf(30.0)).build()
                ));
            }

            if(personRepo.count()==0){
                Pessoa p = Pessoa.builder().nome("Participante Exemplo").email("exemplo@teste.com").status("INVITED").build();
                personRepo.save(p);
                String token = tokenUtil.generateToken(16);
                String lookup = tokenUtil.lookup(token);
                ChaveMagica ak = ChaveMagica.builder()
                        .pessoa(p)
                        .tokenHash(tokenUtil.bcrypt(token))
                        .tokenLookup(lookup)
                        .expiraEm(LocalDateTime.now().plusDays(30))
                        .build();
                accessKeyRepo.save(ak);
                System.out.println("===> SAMPLE_MAGIC_LINK: http://localhost:4200/a/" + token);
            }
        };
    }
}
