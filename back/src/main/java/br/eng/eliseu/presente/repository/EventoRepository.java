package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EventoRepository extends JpaRepository<Evento, Long>, JpaSpecificationExecutor<Evento> {

    @Query("select distinct e from Evento e " +
           "left join fetch e.cliente c " +
           "left join fetch e.pessoas ep " +
           "left join fetch ep.pessoa p " +
           "left join fetch e.produtos epr " +
           "left join fetch epr.produto pr " +
           "where e.id = :id")
    Optional<Evento> findByIdExpandedAll(@Param("id") Long id);
}
