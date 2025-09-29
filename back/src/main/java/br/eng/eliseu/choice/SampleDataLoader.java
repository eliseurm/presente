package br.eng.eliseu.choice;

import br.eng.eliseu.choice.model.*;
import br.eng.eliseu.choice.repo.*;
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
    CommandLineRunner initData(ProductRepository productRepo,
                               PersonRepository personRepo,
                               AccessKeyRepository accessKeyRepo,
                               AdminUserRepository adminRepo,
                               TokenUtil tokenUtil,
                               BCryptPasswordEncoder encoder){
        return args -> {
            if(adminRepo.findByUsername("admin").isEmpty()){
                AdminUser adm = AdminUser.builder()
                        .username("admin")
                        .passwordHash(encoder.encode("changeme123"))
                        .build();
                adminRepo.save(adm);
                System.out.println("===> ADMIN criado: admin / changeme123");
            }

            if(productRepo.count()==0){
                productRepo.saveAll(List.of(
                        Product.builder().name("Produto A").description("Descrição A").price(BigDecimal.valueOf(10.0)).build(),
                        Product.builder().name("Produto B").description("Descrição B").price(BigDecimal.valueOf(20.0)).build(),
                        Product.builder().name("Produto C").description("Descrição C").price(BigDecimal.valueOf(30.0)).build()
                ));
            }

            if(personRepo.count()==0){
                Person p = Person.builder().name("Participante Exemplo").email("exemplo@teste.com").status("INVITED").build();
                personRepo.save(p);
                String token = tokenUtil.generateToken(16);
                String lookup = tokenUtil.lookup(token);
                AccessKey ak = AccessKey.builder()
                        .person(p)
                        .tokenHash(tokenUtil.bcrypt(token))
                        .tokenLookup(lookup)
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .singleUse(false)
                        .build();
                accessKeyRepo.save(ak);
                System.out.println("===> SAMPLE_MAGIC_LINK: http://localhost:4200/a/" + token);
            }
        };
    }
}
