import { computed, onMounted, ref, watch } from 'vue'
import { monitorApiControl } from './monitor-api.control'
import {
  countDevicesByOwner,
  countDevicesByType,
  DEVICE_TYPES,
  toDeviceOptions,
  toOwnerOptions,
} from '../entity/device.entity'
import {
  extractDataTypeOptions,
  filterByDataType,
  filterByTimeRange,
  toNumericTrendPoints,
} from '../entity/device-data.entity'
import { TIME_RANGE_OPTIONS } from '../entity/time-range.entity'

export function useMonitorDataControl() {
  const users = ref([])
  const devices = ref([])
  const loadingUsers = ref(false)
  const loadingDevices = ref(false)
  const loadingDeviceData = ref(false)
  const errorMessage = ref('')
  const activeView = ref('dashboard')

  const userDialogVisible = ref(false)
  const userDialogMode = ref('create')
  const userForm = ref({ id: null, fullname: '', username: '' })

  const deviceDialogVisible = ref(false)
  const deviceDialogMode = ref('create')
  const deviceForm = ref({ id: null, ownerId: null, name: '', code: '', type: DEVICE_TYPES[0] })

  const selectedDeviceId = ref(null)
  const selectedDataType = ref(null)
  const selectedTimeRange = ref('24h')
  const selectedDeviceData = ref([])

  const ownerOptions = computed(() => toOwnerOptions(users.value))
  const deviceOptions = computed(() => toDeviceOptions(devices.value))

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

  const selectedDevice = computed(() => devices.value.find((device) => device.id === selectedDeviceId.value) || null)
  const dataTypeOptions = computed(() => extractDataTypeOptions(selectedDeviceData.value))

  const filteredByDataType = computed(() => filterByDataType(selectedDeviceData.value, selectedDataType.value))
  const rangeFilteredSelectedDeviceData = computed(() =>
    filterByTimeRange(filteredByDataType.value, selectedTimeRange.value),
  )

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

  async function refreshUsers() {
    loadingUsers.value = true
    errorMessage.value = ''
    try {
      users.value = await monitorApiControl.listUsers()
    } catch (error) {
      errorMessage.value = `Cannot load users. ${error.message}`
    } finally {
      loadingUsers.value = false
    }
  }

  async function refreshDevices() {
    loadingDevices.value = true
    errorMessage.value = ''
    try {
      devices.value = await monitorApiControl.listDevices()
      if (selectedDeviceId.value && !devices.value.some((device) => device.id === selectedDeviceId.value)) {
        selectedDeviceId.value = null
        selectedDeviceData.value = []
      }
    } catch (error) {
      errorMessage.value = `Cannot load devices. ${error.message}`
    } finally {
      loadingDevices.value = false
    }
  }

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

  async function refreshAll() {
    errorMessage.value = ''
    await Promise.all([refreshUsers(), refreshDevices()])
    await refreshSelectedDeviceData()
  }

  function openCreateUser() {
    userDialogMode.value = 'create'
    userForm.value = { id: null, fullname: '', username: '' }
    userDialogVisible.value = true
  }

  function openEditUser(user) {
    userDialogMode.value = 'edit'
    userForm.value = { id: user.id, fullname: user.fullname, username: user.username }
    userDialogVisible.value = true
  }

  async function saveUser() {
    errorMessage.value = ''
    try {
      if (userDialogMode.value === 'create') {
        await monitorApiControl.createUser({
          fullname: userForm.value.fullname,
          username: userForm.value.username,
        })
      } else {
        await monitorApiControl.updateUser(userForm.value.id, { fullname: userForm.value.fullname })
      }

      userDialogVisible.value = false
      await refreshAll()
    } catch (error) {
      errorMessage.value = `Cannot save user. ${error.message}`
    }
  }

  async function removeUser(user) {
    if (!window.confirm(`Delete user "${user.fullname}"?`)) {
      return
    }

    errorMessage.value = ''
    try {
      await monitorApiControl.deleteUser(user.id)
      await refreshAll()
    } catch (error) {
      errorMessage.value = `Cannot delete user. ${error.message}`
    }
  }

  function openCreateDevice() {
    deviceDialogMode.value = 'create'
    deviceForm.value = {
      id: null,
      ownerId: users.value.length ? users.value[0].id : null,
      name: '',
      code: '',
      type: DEVICE_TYPES[0],
    }
    deviceDialogVisible.value = true
  }

  function openEditDevice(device) {
    deviceDialogMode.value = 'edit'
    deviceForm.value = {
      id: device.id,
      ownerId: device.owner?.id || null,
      name: device.name,
      code: device.code,
      type: device.type,
    }
    deviceDialogVisible.value = true
  }

  async function saveDevice() {
    errorMessage.value = ''
    try {
      if (deviceDialogMode.value === 'create') {
        if (!deviceForm.value.ownerId) {
          throw new Error('Select an owner before creating a device.')
        }

        await monitorApiControl.createDevice(deviceForm.value.ownerId, {
          name: deviceForm.value.name,
          code: deviceForm.value.code,
          type: deviceForm.value.type,
          ownerId: deviceForm.value.ownerId,
        })
      } else {
        await monitorApiControl.updateDevice(deviceForm.value.id, {
          name: deviceForm.value.name,
          code: deviceForm.value.code,
          type: deviceForm.value.type,
        })
      }

      deviceDialogVisible.value = false
      await refreshDevices()
    } catch (error) {
      errorMessage.value = `Cannot save device. ${error.message}`
    }
  }

  async function removeDevice(device) {
    if (!window.confirm(`Delete device "${device.name}"?`)) {
      return
    }

    errorMessage.value = ''
    try {
      await monitorApiControl.deleteDevice(device.id)
      await refreshDevices()
    } catch (error) {
      errorMessage.value = `Cannot delete device. ${error.message}`
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

  onMounted(refreshAll)

  return {
    activeView,
    errorMessage,
    menuItems,

    users,
    loadingUsers,
    userDialogVisible,
    userDialogMode,
    userForm,

    devices,
    loadingDevices,
    deviceDialogVisible,
    deviceDialogMode,
    deviceForm,

    ownerOptions,
    deviceOptions,
    dataTypeOptions,
    selectedDevice,
    selectedDeviceId,
    selectedDataType,
    selectedTimeRange,
    selectedDeviceData,
    filteredByDataType,
    rangeFilteredSelectedDeviceData,
    loadingDeviceData,

    typeChartData,
    ownerChartData,
    deviceDataTrendChart,

    deviceTypes: DEVICE_TYPES,
    timeRangeOptions: TIME_RANGE_OPTIONS,

    refreshAll,
    refreshSelectedDeviceData,
    openCreateUser,
    openEditUser,
    saveUser,
    removeUser,
    openCreateDevice,
    openEditDevice,
    saveDevice,
    removeDevice,
  }
}
