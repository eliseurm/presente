package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface EventoRepository extends JpaRepository<Evento, Long>, JpaSpecificationExecutor<Evento> {

    // Evita fetch join de múltiplas coleções para não duplicar registros
    // Carrega o cliente e deixa as coleções (pessoas, produtos) serem buscadas via SUBSELECT (configurado na entidade)
//    @Query("select e from Evento e left join fetch e.cliente c where e.id = :id")
    @Query("""
        select e 
        from Evento e 
        join fetch e.cliente c
        left join fetch e.eventoPessoas ep 
        left join fetch ep.pessoa 
        where 1=1 
        and e.id = :eventoId
        """)
    Optional<Evento> findByIdExpandedAll(Long eventoId);

    @Modifying
    @Transactional
    @Query("UPDATE Evento e SET e.progAtual = :atual WHERE e.id = :id")
    void atualizarApenasProgresso(Long id, int atual);

    @Modifying
    @Transactional
    @Query("UPDATE Evento e SET e.progStatus = :status, e.progAtual = :atual WHERE e.id = :id")
    void finalizarProgresso(Long id, String status, int atual);

}
