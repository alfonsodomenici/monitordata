package it.itsbio.monitordata.devicedata.entity;

import it.itsbio.monitordata.devicedata.boundary.DeviceDataCreate;
import it.itsbio.monitordata.device.entity.Device;
import it.itsbio.monitordata.devicedata.boundary.DeviceDataUpdate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;

@Entity
public class DeviceData {

    @Id
    @GeneratedValue
    private long id;

    @ManyToOne(targetEntity = Device.class)
    private Device device;

    private String dataType;

    @Column(columnDefinition = "TEXT")
    private String value;

    private LocalDateTime timestamp;

    private String unit;

    public static DeviceData from(DeviceDataCreate deviceDataCreate, Device device) {
        DeviceData deviceData = new DeviceData();
        deviceData.setDevice(device);
        deviceData.setDataType(deviceDataCreate.dataType());
        deviceData.setValue(deviceDataCreate.value());
        deviceData.setTimestamp(deviceDataCreate.timestamp());
        deviceData.setUnit(deviceDataCreate.unit());
        return deviceData;
    }

    public void updateFrom(DeviceDataUpdate deviceDataUpdate) {
        if (deviceDataUpdate.dataType() != null) {
            this.dataType = deviceDataUpdate.dataType();
        }
        if (deviceDataUpdate.value() != null) {
            this.value = deviceDataUpdate.value();
        }
        if (deviceDataUpdate.unit() != null) {
            this.unit = deviceDataUpdate.unit();
        }
    }

    public DeviceData() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
