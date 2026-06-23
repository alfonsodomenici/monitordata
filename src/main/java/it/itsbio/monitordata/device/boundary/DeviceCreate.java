package it.itsbio.monitordata.device.boundary;

import it.itsbio.monitordata.device.entity.Device;

public record DeviceCreate(String name, String code, Device.Type type, long ownerId) {

}
