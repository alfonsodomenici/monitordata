package it.itsbio.monitordata.devicedata.boundary;

public record DeviceDataUpdate(
        String dataType,
        String value,
        String unit) {

}
