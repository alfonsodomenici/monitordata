package it.itsbio.monitordata.devicedata.boundary;

import java.time.LocalDateTime;

public record DeviceDataCreate(
        long deviceId,
        String dataType,
        String value,
        LocalDateTime timestamp,
        String unit) {

}
