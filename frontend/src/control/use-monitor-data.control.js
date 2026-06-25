import { onMounted, ref } from 'vue'
import { useAnalyticsControl } from './analytics.control'
import { useDashboardControl } from './dashboard.control'
import { useDevicesControl } from './devices.control'
import { useUsersControl } from './users.control'

export function useMonitorDataControl() {
  const errorMessage = ref('')
  const activeView = ref('dashboard')

  let analyticsControl

  const usersControl = useUsersControl({
    errorMessage,
    onDataChanged: refreshAll,
  })

  const devicesControl = useDevicesControl({
    users: usersControl.users,
    errorMessage,
    onDataChanged: refreshAll,
    onDevicesChanged: (nextDevices) => {
      if (analyticsControl) {
        analyticsControl.syncSelectedDeviceAfterDevicesChange(nextDevices)
      }
    },
  })

  const dashboardControl = useDashboardControl({
    devices: devicesControl.devices,
  })

  analyticsControl = useAnalyticsControl({
    devices: devicesControl.devices,
    errorMessage,
  })

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-th-large',
      command: () => {
        activeView.value = 'dashboard'
      },
    },
    {
      label: 'Users',
      icon: 'pi pi-users',
      command: () => {
        activeView.value = 'users'
      },
    },
    {
      label: 'Devices',
      icon: 'pi pi-mobile',
      command: () => {
        activeView.value = 'devices'
      },
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      command: () => {
        activeView.value = 'analytics'
      },
    },
  ]

  async function refreshAll() {
    errorMessage.value = ''
    await Promise.all([usersControl.refreshUsers(), devicesControl.refreshDevices()])
    await analyticsControl.refreshSelectedDeviceData()
  }

  onMounted(refreshAll)

  return {
    activeView,
    errorMessage,
    menuItems,
    refreshAll,

    ...usersControl,
    ...devicesControl,
    ...dashboardControl,
    ...analyticsControl,
  }
}
