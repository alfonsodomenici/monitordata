package it.itsbio.monitordata.device.control;

import java.util.List;
import java.util.Optional;

import it.itsbio.monitordata.device.boundary.DeviceUpdate;
import it.itsbio.monitordata.device.entity.Device;
import it.itsbio.monitordata.user.boundary.UserUpdate;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@RequestScoped
public class DeviceStore {
    @Inject
    private EntityManager em;

    @Transactional
    public Device create(Device device) {
        em.persist(device);
        em.flush();
        return em.find(
                Device.class,
                device.getId());
    }

    @Transactional
    public void remove(Long id) {
        em.remove(em.find(Device.class, id));
    }

    public Optional<Device> findById(long id) {
        Device result = em.find(Device.class, id);
        return result == null ? Optional.empty() : Optional.of(result);
    }

    public List<Device> findAll() {
        return em.createQuery("select e from Device e order by e.name", Device.class)
                .getResultList();

    }

    @Transactional
    public Device update(long id, DeviceUpdate deviceUpdate) {
        Device result = em.find(Device.class, id);
        result.updateFrom(deviceUpdate);
        return em.merge(result);
    }

    public List<Device> findByUserId(long idUser) {
        return em.createQuery("select e from Device e where e.owner.id = :idUser order by e.name",
         Device.class)
                .setParameter("idUser", idUser)
                .getResultList();
    }
}
