import { resolveRangeMs } from './time-range.entity'

export function parseTimestamp(timestamp) {
  if (!timestamp) {
    return null
  }

  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function extractDataTypeOptions(deviceData) {
  const values = [...new Set(deviceData.map((entry) => entry.dataType).filter(Boolean))]
  return values.map((value) => ({ label: value, value }))
}

export function filterByDataType(deviceData, dataType) {
  if (!dataType) {
    return deviceData
  }

  return deviceData.filter((entry) => entry.dataType === dataType)
}

export function filterByTimeRange(deviceData, timeRangeValue) {
  const threshold = Date.now() - resolveRangeMs(timeRangeValue)

  return deviceData.filter((entry) => {
    const timestamp = parseTimestamp(entry.timestamp)
    return timestamp ? timestamp.getTime() >= threshold : false
  })
}

export function toNumericTrendPoints(deviceData) {
  return [...deviceData]
    .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
    .map((entry) => ({
      label: String(entry.timestamp || '').replace('T', ' ').slice(5, 16),
      value: Number(entry.value),
      unit: entry.unit || '',
    }))
    .filter((point) => Number.isFinite(point.value))
}
