package it.itsbio.monitordata.device.boundary;

import java.time.LocalDateTime;

public record DeviceDataCreate(
        String dataType,
        String value,
        LocalDateTime timestamp,
        String unit) {

}
