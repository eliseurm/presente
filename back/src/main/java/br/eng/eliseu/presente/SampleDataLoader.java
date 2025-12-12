package br.eng.eliseu.presente;

import br.eng.eliseu.presente.model.PapelEnum;
import br.eng.eliseu.presente.model.StatusEnum;
import br.eng.eliseu.presente.model.Usuario;
import br.eng.eliseu.presente.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import java.util.Optional;

@Configuration
public class SampleDataLoader {

    @Bean
    CommandLineRunner initData(UsuarioRepository adminRepo, JwtEncoder jwtEncoder, PasswordEncoder passwordEncoder){
        return args -> {
            Optional<Usuario> admin = adminRepo.findByUsername("admin");
//            System.out.println(admin.get().getUsername());
//            System.out.println(passwordEncoder.encode("1234"));
            if(admin.isEmpty()){
                Usuario adm = Usuario.builder()
                        .username("admin")
                        .passwordHash(passwordEncoder.encode("1234"))
                        .papel(PapelEnum.ADMIN)
                        .status(StatusEnum.ATIVO)
                        .build();
                adminRepo.save(adm);
                System.out.println("===> ADMIN criado: admin / 1234");
            }

//            if(productRepo.count()==0){
//                productRepo.saveAll(List.of(
//                        Produto.builder().nome("Produto A").descricao("Descrição A").preco(BigDecimal.valueOf(10.0)).build(),
//                        Produto.builder().nome("Produto B").descricao("Descrição B").preco(BigDecimal.valueOf(20.0)).build(),
//                        Produto.builder().nome("Produto C").descricao("Descrição C").preco(BigDecimal.valueOf(30.0)).build()
//                ));
//            }
//
//            if(personRepo.count()==0){
//                Pessoa p = Pessoa.builder().nome("Participante Exemplo").email("exemplo@teste.com").status("INVITED").build();
//                personRepo.save(p);
//                String token = tokenUtil.generateToken(16);
//                String lookup = tokenUtil.lookup(token);
//                ChaveMagica ak = ChaveMagica.builder()
//                        .pessoa(p)
//                        .tokenHash(tokenUtil.bcrypt(token))
//                        .tokenLookup(lookup)
//                        .expiraEm(LocalDateTime.now().plusDays(30))
//                        .build();
//                accessKeyRepo.save(ak);
//                System.out.println("===> SAMPLE_MAGIC_LINK: http://localhost:4200/a/" + token);
//            }
        };
    }
}
