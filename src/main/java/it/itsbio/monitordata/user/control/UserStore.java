package it.itsbio.monitordata.user.control;

import it.itsbio.monitordata.user.entity.User;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@RequestScoped
public class UserStore {

    @Inject
    private EntityManager em;

    @Transactional
    public void create(User user){
        em.persist(user);
    }
}
