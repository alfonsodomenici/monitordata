package it.itsbio.monitordata.user.control;

import java.util.List;
import java.util.Optional;

import it.itsbio.monitordata.user.boundary.UserUpdate;
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
    public User create(User user) {
        em.persist(user);
        em.flush();
        return em.find(
                User.class,
                user.getId());
    }

    @Transactional
    public void remove(Long id) {
        em.remove(em.find(User.class, id));
    }

    public Optional<User> findById(long id) {
        User result = em.find(User.class, id);
        return result == null ? Optional.empty() : Optional.of(result);
    }

    public List<User> findAll() {
        return em.createQuery("select e from User e order by e.fullname",
                User.class)
                .getResultList();

    }

    public User update(long id, UserUpdate userUpdate) {
        User result = em.find(User.class, id);
        result.updateFrom(userUpdate);
        return em.merge(result);
    }
}
