export const DEVICE_TYPES = ['ARDUINO', 'SMARTH_WATCH', 'SMART_PHONE']

export function toOwnerOptions(users) {
  return users.map((user) => ({
    label: `${user.fullname} (@${user.username})`,
    value: user.id,
  }))
}

export function toDeviceOptions(devices) {
  return devices.map((device) => ({
    label: `${device.name} (${device.code})`,
    value: device.id,
  }))
}

export function countDevicesByType(devices) {
  const counts = DEVICE_TYPES.reduce((acc, type) => {
    acc[type] = 0
    return acc
  }, {})

  devices.forEach((device) => {
    counts[device.type] = (counts[device.type] || 0) + 1
  })

  return counts
}

export function countDevicesByOwner(devices) {
  const counts = {}

  devices.forEach((device) => {
    const ownerName = device.owner?.fullname || 'Unknown'
    counts[ownerName] = (counts[ownerName] || 0) + 1
  })

  return counts
}
