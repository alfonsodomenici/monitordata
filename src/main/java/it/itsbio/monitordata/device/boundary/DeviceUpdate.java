package it.itsbio.monitordata.device.boundary;

import it.itsbio.monitordata.device.entity.Device;

public record DeviceUpdate(String name, String code, Device.Type type  ) {

}
