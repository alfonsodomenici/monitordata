package it.itsbio.monitordata.devicedata.boundary;

import java.util.List;

import it.itsbio.monitordata.device.control.DeviceStore;
import it.itsbio.monitordata.devicedata.control.DeviceDataStore;
import it.itsbio.monitordata.devicedata.entity.DeviceData;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@RequestScoped
@Path("devices/{deviceId}/data")
public class DeviceDataResource {
    @Inject
    DeviceDataStore deviceDataStore;

    @Inject
    DeviceStore deviceStore;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public DeviceData create(@PathParam("deviceId") long deviceId, DeviceDataCreate deviceDataCreate) {
        var device = deviceStore.findById(deviceId).orElseThrow(() -> new NotFoundException());
        return deviceDataStore.create(DeviceData.from(deviceDataCreate, device));
    }

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("deviceId") long deviceId, @PathParam("id") long id) {
        deviceDataStore.findById(id).orElseThrow(() -> new NotFoundException());
        deviceDataStore.remove(id);
    }

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public DeviceData findById(@PathParam("deviceId") long deviceId, @PathParam("id") long id) {
        return deviceDataStore.findById(id).orElseThrow(() -> new NotFoundException());
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<DeviceData> findByDeviceId(@PathParam("deviceId") long deviceId) {
        deviceStore.findById(deviceId).orElseThrow(() -> new NotFoundException());
        return deviceDataStore.findByDeviceId(deviceId);
    }

    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public DeviceData update(@PathParam("deviceId") long deviceId, @PathParam("id") long id, DeviceDataUpdate deviceDataUpdate) {
        deviceDataStore.findById(id).orElseThrow(() -> new NotFoundException());
        return deviceDataStore.update(id, deviceDataUpdate);
    }
}
