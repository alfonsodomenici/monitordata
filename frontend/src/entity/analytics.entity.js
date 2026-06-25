import { resolveRangeMs } from './time-range.entity'

function normalizeTimestampString(value) {
  const raw = String(value).trim().replace(' ', 'T')
  const normalizedOffset = raw.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
  return normalizedOffset.replace(/\.(\d{3})\d+(?=(Z|[+-]\d{2}:\d{2})?$)/, '.$1')
}

export function parseTimestamp(timestamp) {
  if (!timestamp) {
    return null
  }

  if (typeof timestamp === 'number') {
    const parsedNumber = new Date(timestamp)
    return Number.isNaN(parsedNumber.getTime()) ? null : parsedNumber
  }

  const normalized = normalizeTimestampString(timestamp)
  const parsed = new Date(normalized)
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

function parseNumericValue(rawValue) {
  if (rawValue == null) {
    return Number.NaN
  }

  return Number(String(rawValue).replace(',', '.'))
}

export function toNumericTrendPoints(deviceData) {
  return [...deviceData]
    .sort((a, b) => {
      const first = parseTimestamp(a.timestamp)?.getTime() || 0
      const second = parseTimestamp(b.timestamp)?.getTime() || 0
      return first - second
    })
    .map((entry) => ({
      label: String(entry.timestamp || '').replace('T', ' ').slice(0, 16),
      value: parseNumericValue(entry.value),
      unit: entry.unit || '',
    }))
    .filter((point) => Number.isFinite(point.value))
}
