package it.itsbio.monitordata.device.boundary;

import java.util.List;

import it.itsbio.monitordata.device.control.DeviceStore;
import it.itsbio.monitordata.device.entity.Device;
import it.itsbio.monitordata.user.boundary.UserUpdate;
import it.itsbio.monitordata.user.control.UserStore;
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
@Path("devices")
public class DevicesResource {
   @Inject
    DeviceStore deviceStore;

    @Inject
    UserStore userStore;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Device create(DeviceCreate device) {
        var owner = userStore.findById(device.ownerId()).orElseThrow(() -> new NotFoundException());
        return deviceStore.create(Device.from(device, owner));
    }

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") long id) {
        deviceStore.findById(id).orElseThrow(() -> new NotFoundException());
        deviceStore.remove(id);
    }

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Device findById(@PathParam("id") long id) {
        return deviceStore.findById(id).orElseThrow(() -> new NotFoundException());
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Device> findAll() {
        return deviceStore.findAll();
    }

    @PUT
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Device update(@PathParam("id") long id, DeviceUpdate deviceUpdate) {
        deviceStore.findById(id).orElseThrow(() -> new NotFoundException());
        return deviceStore.update(id, deviceUpdate);
    }
}
