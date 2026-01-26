package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.core.StringUtils;
import br.eng.eliseu.presente.model.StatusEnum;
import br.eng.eliseu.presente.model.Tamanho;
import br.eng.eliseu.presente.model.filter.TamanhoFilter;
import br.eng.eliseu.presente.repository.EventoPessoaRepository;
import br.eng.eliseu.presente.repository.TamanhoRepository;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PresenteService {

    private final EventoPessoaRepository eventoPessoaRepository;

    public boolean validarCampo(String campo, String valor) {
        try {
            return switch (campo) {
                case "nome" -> {
                    // Normaliza a entrada do usuário para comparação
                    String nomeNormalizado = StringUtils.normalizarNome(valor);
                    yield eventoPessoaRepository.existsByPessoaNomeAndEvento_Status(nomeNormalizado, StatusEnum.ATIVO);
                }
                case "cpf" -> eventoPessoaRepository.existsByPessoaCpfAndEvento_Status(valor, StatusEnum.ATIVO);
                case "nascimento" -> {
                    LocalDate data = LocalDate.parse(valor, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                    yield eventoPessoaRepository.existsByPessoaNascimentoAndEvento_Status(data, StatusEnum.ATIVO);
                }
                default -> false;
            };
        } catch (Exception e) {
            return false;
        }
    }



}