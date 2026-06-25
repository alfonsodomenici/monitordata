import { computed, ref, watch } from 'vue'
import { monitorApiControl } from './monitor-api.control'
import {
  extractDataTypeOptions,
  filterByDataType,
  filterByTimeRange,
  toNumericTrendPoints,
} from '../entity/analytics.entity'
import { TIME_RANGE_OPTIONS } from '../entity/time-range.entity'

export function useAnalyticsControl({ devices, errorMessage }) {
  const loadingDeviceData = ref(false)
  const selectedDeviceId = ref(null)
  const selectedDataType = ref(null)
  const selectedTimeRange = ref('24h')
  const selectedDeviceData = ref([])

  const selectedDevice = computed(() => devices.value.find((device) => device.id === selectedDeviceId.value) || null)
  const dataTypeOptions = computed(() => extractDataTypeOptions(selectedDeviceData.value))

  const filteredByDataType = computed(() => filterByDataType(selectedDeviceData.value, selectedDataType.value))
  const rangeFilteredSelectedDeviceData = computed(() =>
    filterByTimeRange(filteredByDataType.value, selectedTimeRange.value),
  )

  const deviceDataTrendChart = computed(() => {
    const points = toNumericTrendPoints(rangeFilteredSelectedDeviceData.value)
    const unit = points[0]?.unit ? ` (${points[0].unit})` : ''
    const suffix = selectedDataType.value ? ` - ${selectedDataType.value}` : ''

    return {
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: `Device Values${suffix}${unit}`,
          data: points.map((point) => point.value),
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.2)',
          tension: 0.35,
          fill: true,
        },
      ],
    }
  })

  async function refreshSelectedDeviceData() {
    if (!selectedDeviceId.value) {
      selectedDeviceData.value = []
      selectedDataType.value = null
      return
    }

    loadingDeviceData.value = true
    errorMessage.value = ''

    try {
      selectedDeviceData.value = await monitorApiControl.listDeviceData(selectedDeviceId.value)
      if (!selectedDataType.value || !selectedDeviceData.value.some((entry) => entry.dataType === selectedDataType.value)) {
        selectedDataType.value = selectedDeviceData.value[0]?.dataType || null
      }
    } catch (error) {
      errorMessage.value = `Cannot load device data. ${error.message}`
    } finally {
      loadingDeviceData.value = false
    }
  }

  function syncSelectedDeviceAfterDevicesChange(nextDevices) {
    if (selectedDeviceId.value && !nextDevices.some((device) => device.id === selectedDeviceId.value)) {
      selectedDeviceId.value = null
      selectedDeviceData.value = []
      selectedDataType.value = null
    }
  }

  watch(selectedDeviceId, refreshSelectedDeviceData)
  watch(dataTypeOptions, (options) => {
    if (!options.length) {
      selectedDataType.value = null
      return
    }

    if (!options.some((option) => option.value === selectedDataType.value)) {
      selectedDataType.value = options[0].value
    }
  })

  return {
    loadingDeviceData,
    selectedDevice,
    selectedDeviceId,
    selectedDataType,
    selectedTimeRange,
    selectedDeviceData,
    filteredByDataType,
    rangeFilteredSelectedDeviceData,
    dataTypeOptions,
    timeRangeOptions: TIME_RANGE_OPTIONS,
    deviceDataTrendChart,
    refreshSelectedDeviceData,
    syncSelectedDeviceAfterDevicesChange,
  }
}
