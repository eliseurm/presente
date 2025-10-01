package br.eng.eliseu.presente.repository;


import br.eng.eliseu.presente.model.Cor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CorRepository extends JpaRepository<Cor, Long>, JpaSpecificationExecutor<Cor> {
}