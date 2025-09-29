package br.eng.eliseu.choice.repo;

import br.eng.eliseu.choice.model.AccessKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AccessKeyRepository extends JpaRepository<AccessKey, Long> {
    Optional<AccessKey> findByTokenLookup(String lookup);
    List<AccessKey> findAllByExpiresAtAfter(LocalDateTime now);
}
