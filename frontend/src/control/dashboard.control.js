import { computed } from 'vue'
import { countDevicesByOwner, countDevicesByType } from '../entity/dashboard.entity'

export function useDashboardControl({ devices }) {
  const typeChartData = computed(() => {
    const typeCounts = countDevicesByType(devices.value)

    return {
      labels: Object.keys(typeCounts),
      datasets: [
        {
          label: 'Devices by Type',
          backgroundColor: ['#0d9488', '#2563eb', '#f59e0b'],
          borderColor: ['#0f766e', '#1d4ed8', '#d97706'],
          borderWidth: 1,
          data: Object.values(typeCounts),
        },
      ],
    }
  })

  const ownerChartData = computed(() => {
    const ownerCounts = countDevicesByOwner(devices.value)
    const labels = Object.keys(ownerCounts)
    const values = Object.values(ownerCounts)
    const palette = ['#0d9488', '#0369a1', '#1d4ed8', '#6d28d9', '#b45309', '#be123c']

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, index) => palette[index % palette.length]),
        },
      ],
    }
  })

  return {
    typeChartData,
    ownerChartData,
  }
}
