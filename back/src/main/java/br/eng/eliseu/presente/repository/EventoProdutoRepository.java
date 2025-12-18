package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.EventoProduto;
import br.eng.eliseu.presente.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoProdutoRepository extends JpaRepository<EventoProduto, Long>, JpaSpecificationExecutor<EventoProduto> {

    List<EventoProduto> findByEvento_IdAndStatus(Long eventoId, StatusEnum status);

    List<EventoProduto> findByEvento_Id(Long eventoId);

}
