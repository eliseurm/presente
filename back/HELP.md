# Getting Started

### Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/4.0.0-M3/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/4.0.0-M3/maven-plugin/build-image.html)
* [Spring Web](https://docs.spring.io/spring-boot/4.0.0-M3/reference/web/servlet.html)
* [Spring Security](https://docs.spring.io/spring-boot/4.0.0-M3/reference/web/spring-security.html)
* [Spring Data JPA](https://docs.spring.io/spring-boot/4.0.0-M3/reference/data/sql.html#data.sql.jpa-and-spring-data)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Securing a Web Application](https://spring.io/guides/gs/securing-web/)
* [Spring Boot and OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
* [Authenticating a User with LDAP](https://spring.io/guides/gs/authenticating-ldap/)
* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)
* [Accessing data with MySQL](https://spring.io/guides/gs/accessing-data-mysql/)

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.

---

## FAQ (PT-BR)

### O que é "cota de nuvem"?
"Cota de nuvem" é o limite de recursos que um serviço em nuvem disponibiliza para a sua conta, projeto ou aplicação. Dependendo do provedor, essas cotas podem incluir:
- Armazenamento (GB/TB usados em buckets/discos)
- CPU, memória e número de instâncias/contêineres
- Transferência de dados (saída/egresso)
- Número de solicitações (API calls) por período
- Serviços gerenciados (bancos de dados, filas, funções serverless)

As cotas existem para garantir estabilidade da plataforma e evitar uso indevido.

### Por que a minha cota expirou ou foi esgotada?
Normalmente, há dois cenários:
1) Plano/gratuidade expirou: contas free/trial têm prazo (ex.: 30 ou 90 dias). Ao expirar, o acesso é restringido ou os recursos são suspensos.
2) Limite atingido: o consumo do mês/período superou a cota definida. Exemplos:
   - Muito upload/download (estouro de egress)
   - Aumento de tráfego (mais requisições)
   - Jobs em lote consumindo CPU/memória
   - Backups/logs crescendo além do esperado

### Como a cota funciona na prática?
- É definida por provedor, região e serviço (ex.: 5 TB/mês de egress na região X).
- Pode ser renovada por ciclo (mensal) ou por janela deslizante.
- Pode haver cotas “soft” (limitam e cobram excedente) e “hard” (bloqueiam ao atingir o limite).
- Em ambientes corporativos, o administrador pode impor cotas por projeto/time.

### Como verificar e evitar expiração/estouro?
- Monitore: habilite alertas e dashboards de consumo.
- Orçamento: configure budget com alertas de custo.
- Otimize:
  - Ative compressão e cache para reduzir egress.
  - Use armazenamento em camadas (quente/frio) e políticas de ciclo de vida.
  - Escalonamento automático com limites superiores bem definidos.
  - Revise logs/backups antigos e TTL.
- Planeje: peça aumento de cota quando necessário com justificativa de capacidade.

### Termos comuns por provedores (exemplos)
- AWS: Service Quotas (limites por serviço), Free Tier com franquias mensais.
- GCP: Quotas por API/serviço; limites por região; fatura por projeto.
- Azure: Limites de assinatura/serviço; quotas por região e SKU.

### Passos práticos se sua cota “expirou”
1) Verifique no painel do provedor se foi expiração de trial ou estouro de limite.
2) Se for trial, migre para um plano pago ou reative créditos (quando elegível).
3) Se for estouro:
   - Reduza consumo (pausar jobs, diminuir réplicas, ativar cache/CDN).
   - Solicite aumento de cota pelo console de suporte.
   - Ajuste alertas para 50/75/90% do limite.

> Dica: Documente internamente quais cotas afetam diretamente o seu produto e mantenha um playbook de resposta para picos.

