package br.eng.eliseu.choice.repo;

import br.eng.eliseu.choice.model.Person;
import br.eng.eliseu.choice.model.Selection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SelectionRepository extends JpaRepository<Selection, Long> {
    Optional<Selection> findByPerson(Person person);
}
