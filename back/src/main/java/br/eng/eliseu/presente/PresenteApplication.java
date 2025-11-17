package br.eng.eliseu.presente;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EntityScan(basePackages = {"br.eng.eliseu.presente.model"})
public class PresenteApplication {

	public static void main(String[] args) {

		SpringApplication.run(PresenteApplication.class, args);
	}

	@Bean
	ApplicationRunner runner(PasswordEncoder passwordEncoder) {
		return args -> System.out.println(passwordEncoder.encode("password"));
	}

}
