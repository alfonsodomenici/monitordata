import { computed, ref } from 'vue'
import { monitorApiControl } from './monitor-api.control'
import { DEVICE_TYPES, toCreateDevicePayload, toDeviceOptions, toUpdateDevicePayload } from '../entity/devices.entity'
import { toOwnerOptions } from '../entity/users.entity'

export function useDevicesControl({ users, errorMessage, onDataChanged, onDevicesChanged }) {
  const devices = ref([])
  const loadingDevices = ref(false)

  const deviceDialogVisible = ref(false)
  const deviceDialogMode = ref('create')
  const deviceForm = ref({ id: null, ownerId: null, name: '', code: '', type: DEVICE_TYPES[0] })

  const ownerOptions = computed(() => toOwnerOptions(users.value))
  const deviceOptions = computed(() => toDeviceOptions(devices.value))

  async function refreshDevices() {
    loadingDevices.value = true
    errorMessage.value = ''

    try {
      devices.value = await monitorApiControl.listDevices()
      if (onDevicesChanged) {
        onDevicesChanged(devices.value)
      }
    } catch (error) {
      errorMessage.value = `Cannot load devices. ${error.message}`
    } finally {
      loadingDevices.value = false
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

        await monitorApiControl.createDevice(deviceForm.value.ownerId, toCreateDevicePayload(deviceForm.value))
      } else {
        await monitorApiControl.updateDevice(deviceForm.value.id, toUpdateDevicePayload(deviceForm.value))
      }

      deviceDialogVisible.value = false
      await onDataChanged()
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
      await onDataChanged()
    } catch (error) {
      errorMessage.value = `Cannot delete device. ${error.message}`
    }
  }

  return {
    devices,
    loadingDevices,
    deviceDialogVisible,
    deviceDialogMode,
    deviceForm,
    ownerOptions,
    deviceOptions,
    deviceTypes: DEVICE_TYPES,
    refreshDevices,
    openCreateDevice,
    openEditDevice,
    saveDevice,
    removeDevice,
  }
}
