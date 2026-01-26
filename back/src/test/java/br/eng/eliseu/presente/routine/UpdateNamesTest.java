package br.eng.eliseu.presente.routine;

import br.eng.eliseu.presente.core.StringUtils;
import br.eng.eliseu.presente.repository.EventoPessoaRepository;
import br.eng.eliseu.presente.repository.PessoaRepository;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.atomic.AtomicInteger;

@SpringBootTest
class UpdateNamesTest {

    @Autowired private PessoaRepository pessoaRepository;
    @Autowired private EventoPessoaRepository eventoPessoaRepository;

    @Test
    @Transactional
    @Rollback(false) // Importante: Garante que as mudanças sejam salvas no banco
    @Disabled("Já executado em 25/01")
    void normalizaNomeOrgaos() {
        AtomicInteger count = new AtomicInteger();
        eventoPessoaRepository.findAll().forEach(ep -> {
            System.out.println("Atualizado EventoPessoa id: " + ep.getId());

            String on1 = StringUtils.normalizarNome(ep.getOrganoNivel1());
            System.out.println(ep.getOrganoNivel1() + " -> " + on1);
            ep.setOrganoNivel1(on1);

            String on2 = StringUtils.normalizarNome(ep.getOrganoNivel2());
            System.out.println(ep.getOrganoNivel2() + " -> " + on2);
            ep.setOrganoNivel2(on2);

            String on3 = StringUtils.normalizarNome(ep.getOrganoNivel3());
            System.out.println(ep.getOrganoNivel3() + " -> " + on3);
            ep.setOrganoNivel3(on3);

            String loc = StringUtils.normalizarNome(ep.getLocalTrabalho());
            System.out.println(ep.getLocalTrabalho() + " -> " + loc);
            ep.setLocalTrabalho(loc);

            eventoPessoaRepository.save(ep);

            count.getAndIncrement();
        });

        System.out.println("Total: " + count + "");

    }

    @Test
    @Transactional
    @Rollback(false) // Importante: Garante que as mudanças sejam salvas no banco
    @Disabled("Já executado em 25/01")
    void normalizaNomePessoa() {
        AtomicInteger count = new AtomicInteger();
        pessoaRepository.findAll().forEach(p -> {
            System.out.println("Atualizado da Pessoa id: " + p.getId());

            String nome = StringUtils.normalizarNome(p.getNome());
            System.out.println(p.getNome() + " -> " + nome);
            p.setNome(nome);

            pessoaRepository.save(p);

            count.getAndIncrement();
        });

        System.out.println("Total: " + count + "");

    }

}