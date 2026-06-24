package it.itsbio.monitordata.simulator.control;

import it.itsbio.monitordata.devicedata.boundary.DeviceDataCreate;
import it.itsbio.monitordata.devicedata.entity.DeviceData;
import it.itsbio.monitordata.simulator.gateway.DeviceDataApiClient;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@RequestScoped
public class DeviceDataSimulator {

    @Inject
    @RestClient
    DeviceDataApiClient deviceDataApiClient;

    public List<DeviceData> simulate(long deviceId, int samples) {
        int safeSamples = Math.max(1, samples);
        List<DeviceData> created = new ArrayList<>();

        for (int i = 0; i < safeSamples; i++) {
            String dataType = pickDataType();
            String unit = unitFor(dataType);
            String value = randomValueFor(dataType);

            DeviceDataCreate payload = new DeviceDataCreate(
                    dataType,
                    value,
                    LocalDateTime.now(),
                    unit);

            created.add(deviceDataApiClient.sendData(deviceId, payload));
        }

        return created;
    }

    private String pickDataType() {
        String[] dataTypes = {"temperature", "humidity", "heart_rate", "battery"};
        int index = ThreadLocalRandom.current().nextInt(dataTypes.length);
        return dataTypes[index];
    }

    private String unitFor(String dataType) {
        return switch (dataType) {
            case "temperature" -> "C";
            case "humidity" -> "%";
            case "heart_rate" -> "bpm";
            case "battery" -> "%";
            default -> "n/a";
        };
    }

    private String randomValueFor(String dataType) {
        return switch (dataType) {
            case "temperature" -> String.format("%.1f", ThreadLocalRandom.current().nextDouble(18.0, 38.0));
            case "humidity" -> String.valueOf(ThreadLocalRandom.current().nextInt(30, 95));
            case "heart_rate" -> String.valueOf(ThreadLocalRandom.current().nextInt(55, 150));
            case "battery" -> String.valueOf(ThreadLocalRandom.current().nextInt(5, 100));
            default -> "0";
        };
    }
}
