package br.eng.eliseu.presente.config.json;

import com.fasterxml.jackson.annotation.ObjectIdGenerator;
import com.fasterxml.jackson.annotation.ObjectIdResolver;

import java.util.HashMap;
import java.util.Map;

/**
 * Resolver de ObjectId do Jackson que evita conflitos quando o mesmo ID é
 * re-vinculado a instâncias diferentes durante a desserialização do mesmo payload.
 * Mantém o primeiro binding e ignora re-binds subsequentes para o mesmo id.
 */
public class LenientObjectIdResolver implements ObjectIdResolver {

    private Map<ObjectIdGenerator.IdKey, Object> items = new HashMap<>();

    @Override
    public void bindItem(ObjectIdGenerator.IdKey id, Object pojo) {
        Object existing = items.get(id);
        if (existing == null) {
            items.put(id, pojo);
        } else {
            // Ignora re-bind para evitar "Object Id conflict"
        }
    }

    @Override
    public Object resolveId(ObjectIdGenerator.IdKey id) {
        return items.get(id);
    }

    @Override
    public ObjectIdResolver newForDeserialization(Object context) {
        return new LenientObjectIdResolver();
    }

    @Override
    public boolean canUseFor(ObjectIdResolver resolverType) {
        return resolverType != null && resolverType.getClass() == getClass();
    }
}
