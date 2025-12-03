package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EventoRepository extends JpaRepository<Evento, Long>, JpaSpecificationExecutor<Evento> {

    // Evita fetch join de múltiplas coleções para não duplicar registros
    // Carrega o cliente e deixa as coleções (pessoas, produtos) serem buscadas via SUBSELECT (configurado na entidade)
    @Query("select e from Evento e left join fetch e.cliente c where e.id = :id")
    Optional<Evento> findByIdExpandedAll(@Param("id") Long id);
}
