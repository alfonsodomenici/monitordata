package it.itsbio.monitordata.user.boundary;

import it.itsbio.monitordata.user.control.UserStore;
import it.itsbio.monitordata.user.entity.User;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;

@Path("/users")
@RequestScoped
public class UsersResource {

    @Inject
    UserStore userStore;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void create(User user){
        userStore.create(user);
    }
}
