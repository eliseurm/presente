package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.dto.EventoDto;
import br.eng.eliseu.presente.model.dto.EventoPessoaDto;
import br.eng.eliseu.presente.model.dto.EventoRelatorioDto;
import br.eng.eliseu.presente.model.dto.ProgressoTarefaDto;
import br.eng.eliseu.presente.model.filter.EventoFilter;
import br.eng.eliseu.presente.model.filter.EventoPessoaFilter;
import br.eng.eliseu.presente.model.filter.EventoReportFilter;
import br.eng.eliseu.presente.model.mapper.EventoMapper;
import br.eng.eliseu.presente.model.mapper.EventoPessoaMapper;
import br.eng.eliseu.presente.model.mapper.PessoaMapper;
import br.eng.eliseu.presente.repository.*;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventoPessoaService extends AbstractCrudService<EventoPessoa, Long, EventoPessoaFilter> {

    private final EventoPessoaRepository eventoPessoaRepository;

    @Override
    protected JpaRepository<EventoPessoa, Long> getRepository() {
        return eventoPessoaRepository;
    }

    @Override
    protected JpaSpecificationExecutor<EventoPessoa> getSpecificationExecutor() {
        return eventoPessoaRepository;
    }

    @Override
    protected Specification<EventoPessoa> buildSpecification(EventoPessoaFilter filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filtro.getId() != null) {
                // WHERE id = ?
                predicates.add(cb.equal(root.get("id"), filtro.getId()));
            }

            if (filtro.getEventoId() != null) {
                // WHERE evento.id = ?
                predicates.add(cb.equal(root.get("evento").get("id"), filtro.getEventoId()));
            }

            if (filtro.getPessoaId() != null) {
                // WHERE pessoa.id = ?
                predicates.add(cb.equal(root.get("pessoa").get("id"), filtro.getPessoaId()));
            }

            if (filtro.getPessoaCpf() != null) {
                // WHERE pessoa.cpf = ?
                predicates.add(cb.equal(root.get("pessoa").get("cpf"), filtro.getPessoaCpf()));
            }

            if (filtro.getPessoaEmail() != null && !filtro.getPessoaEmail().trim().isEmpty()) {
                // WHERE lower(pessoa.email) = ?
                predicates.add(cb.equal(cb.lower(root.get("pessoa").get("email")), filtro.getPessoaEmail().trim().toLowerCase()));
            }

            if (filtro.getPessoaTelefone() != null && !filtro.getPessoaTelefone().trim().isEmpty()) {
                // WHERE pessoa.telefone = ?
                predicates.add(cb.equal(root.get("pessoa").get("telefone"), filtro.getPessoaTelefone().trim()));
            }


            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    protected void prepararParaCriacao(EventoPessoa nova) {
        nova.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long aLong, EventoPessoa nova, EventoPessoa entidadeExistente) {
        // Trata dados que serao atualizacos
    }

    public List<EventoPessoa> buscaEventoPessoaList(Long eventoId){

        return eventoPessoaRepository.findByEventoId(eventoId);

    }
}
