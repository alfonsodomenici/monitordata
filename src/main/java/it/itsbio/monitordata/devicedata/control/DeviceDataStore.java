package it.itsbio.monitordata.devicedata.control;

import java.util.List;
import java.util.Optional;

import it.itsbio.monitordata.devicedata.boundary.DeviceDataUpdate;
import it.itsbio.monitordata.devicedata.entity.DeviceData;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@RequestScoped
public class DeviceDataStore {
    @Inject
    private EntityManager em;

    @Transactional
    public DeviceData create(DeviceData deviceData) {
        em.persist(deviceData);
        em.flush();
        return em.find(DeviceData.class, deviceData.getId());
    }

    @Transactional
    public void remove(Long id) {
        em.remove(em.find(DeviceData.class, id));
    }

    public Optional<DeviceData> findById(long id) {
        DeviceData result = em.find(DeviceData.class, id);
        return result == null ? Optional.empty() : Optional.of(result);
    }

    public List<DeviceData> findAll() {
        return em.createQuery("select e from DeviceData e order by e.timestamp desc", DeviceData.class)
                .getResultList();
    }

    public List<DeviceData> findByDeviceId(long deviceId) {
        return em.createQuery("select e from DeviceData e where e.device.id = :deviceId order by e.timestamp desc", DeviceData.class)
                .setParameter("deviceId", deviceId)
                .getResultList();
    }

    @Transactional
    public DeviceData update(long id, DeviceDataUpdate deviceDataUpdate) {
        DeviceData result = em.find(DeviceData.class, id);
        result.updateFrom(deviceDataUpdate);
        return em.merge(result);
    }
}
