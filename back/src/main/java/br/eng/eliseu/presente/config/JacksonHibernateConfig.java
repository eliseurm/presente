package br.eng.eliseu.presente.config;

import com.fasterxml.jackson.databind.Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.datatype.hibernate7.Hibernate7Module;

@Configuration
public class JacksonHibernateConfig {

    @Bean
    public Module hibernateModule() {
        Hibernate7Module module = new Hibernate7Module();
        // Não force o carregamento de proxies LAZY ao serializar (evita "no session")
        module.disable(Hibernate7Module.Feature.FORCE_LAZY_LOADING);
        // Quando uma associação LAZY não estiver inicializada, serialize apenas o identificador
        module.enable(Hibernate7Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS);
        return module;
    }
}
