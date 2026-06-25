import { DEVICE_TYPES } from './devices.entity'

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
