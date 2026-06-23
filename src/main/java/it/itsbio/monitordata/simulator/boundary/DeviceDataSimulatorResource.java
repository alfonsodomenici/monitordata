package it.itsbio.monitordata.simulator.boundary;

import it.itsbio.monitordata.devicedata.entity.DeviceData;
import it.itsbio.monitordata.device.control.DeviceStore;
import it.itsbio.monitordata.simulator.control.DeviceDataSimulator;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;

@RequestScoped
@Path("simulator")
public class DeviceDataSimulatorResource {

    @Inject
    DeviceDataSimulator deviceDataSimulator;

    @Inject
    DeviceStore deviceStore;

    @POST
    @Path("devices/{deviceId}/data")
    @Produces(MediaType.APPLICATION_JSON)
    public List<DeviceData> simulate(
            @PathParam("deviceId") long deviceId,
            @DefaultValue("5") @QueryParam("count") int count) {
        deviceStore.findById(deviceId).orElseThrow(NotFoundException::new);
        return deviceDataSimulator.simulate(deviceId, count);
    }

    @POST
    @Path("devices/data")
    @Produces(MediaType.APPLICATION_JSON)
    public List<DeviceData> simulateAll(@DefaultValue("5") @QueryParam("count") int count) {
        List<DeviceData> simulated = new ArrayList<>();
        deviceStore.findAll().forEach(device -> simulated.addAll(deviceDataSimulator.simulate(device.getId(), count)));
        return simulated;
    }
}
