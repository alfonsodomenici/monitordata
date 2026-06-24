package it.itsbio.monitordata.user.boundary;

import java.util.List;

import it.itsbio.monitordata.device.boundary.DeviceCreate;
import it.itsbio.monitordata.device.control.DeviceStore;
import it.itsbio.monitordata.device.entity.Device;
import it.itsbio.monitordata.user.control.UserStore;
import it.itsbio.monitordata.user.entity.User;
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

@Path("/users")
@RequestScoped
public class UsersResource {

    @Inject
    UserStore userStore;
    @Inject
    DeviceStore deviceStore;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public User create(User user) {
        return userStore.create(user);
    }

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") long id) {
        userStore.findById(id).orElseThrow(() -> new NotFoundException());
        userStore.remove(id);
    }

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public User findById(@PathParam("id") long id) {
        return userStore.findById(id).orElseThrow(() -> new NotFoundException());
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<User> findAll() {
        return userStore.findAll();
    }

    @PUT
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public User update(@PathParam("id") long id, UserUpdate userUpdate) {
        userStore.findById(id).orElseThrow(() -> new NotFoundException());
        return userStore.update(id, userUpdate);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{idUser}/devices")
    public Device createDevice(@PathParam("idUser") long idUser, DeviceCreate deviceCreate) {
        var owner = userStore.findById(idUser).orElseThrow(() -> new NotFoundException());
        return deviceStore.create(Device.from(deviceCreate, owner));
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{idUser}/devices")
    public List<Device> findDevices(@PathParam("idUser") long idUser) {
        return deviceStore.findByUserId(idUser);
    }
}
