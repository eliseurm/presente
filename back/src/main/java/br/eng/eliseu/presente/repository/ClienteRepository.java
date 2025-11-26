package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long>, JpaSpecificationExecutor<Cliente> {
    List<Cliente> findByUsuario_Id(Long usuarioId);
}
