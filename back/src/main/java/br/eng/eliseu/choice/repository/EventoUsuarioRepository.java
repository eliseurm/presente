package br.eng.eliseu.choice.repository;

import br.eng.eliseu.choice.model.EventoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface EventoUsuarioRepository extends JpaRepository<EventoUsuario, Long> {

    @Query("""
           select count(eu) > 0
           from EventoUsuario eu
           where eu.usuario.id = :usuarioId
             and (eu.evento.fim is null or eu.evento.fim > :agora)
           """)
    boolean usuarioTemEventoAtivo(@Param("usuarioId") Long usuarioId, @Param("agora") LocalDateTime agora);
}
