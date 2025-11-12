package br.eng.eliseu.presente.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayManualConfig {

    // Define explicitamente o bean do Flyway usando a mesma DataSource do Spring
    // e já executa migrate() via initMethod durante a criação do bean.
    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        FluentConfiguration conf = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:/db/migration")
                .schemas("presente_sh")
                .baselineOnMigrate(true)
                .failOnMissingLocations(false);
        return conf.load();
    }
}
