export const DEVICE_TYPES = ['ARDUINO', 'SMARTH_WATCH', 'SMART_PHONE']

export function toDeviceOptions(devices) {
  return devices.map((device) => ({
    label: `${device.name} (${device.code})`,
    value: device.id,
  }))
}

export function toCreateDevicePayload(form) {
  return {
    name: form.name,
    code: form.code,
    type: form.type,
    ownerId: form.ownerId,
  }
}

export function toUpdateDevicePayload(form) {
  return {
    name: form.name,
    code: form.code,
    type: form.type,
  }
}
