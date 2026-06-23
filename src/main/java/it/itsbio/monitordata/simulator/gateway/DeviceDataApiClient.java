package it.itsbio.monitordata.simulator.gateway;

import it.itsbio.monitordata.devicedata.boundary.DeviceDataCreate;
import it.itsbio.monitordata.devicedata.entity.DeviceData;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/devices")
@RegisterRestClient(configKey = "device-data-api")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface DeviceDataApiClient {

    @POST
    @Path("/{deviceId}/data")
    DeviceData sendData(@PathParam("deviceId") long deviceId, DeviceDataCreate payload);
}
