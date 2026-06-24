<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'

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
const deviceForm = ref({ id: null, ownerId: null, name: '', code: '', type: 'ARDUINO' })
const selectedDeviceId = ref(null)
const selectedDataType = ref(null)
const selectedTimeRange = ref('24h')
const selectedDeviceData = ref([])

const deviceTypes = ['ARDUINO', 'SMARTH_WATCH', 'SMART_PHONE']

const ownerOptions = computed(() =>
  users.value.map((user) => ({
    label: `${user.fullname} (@${user.username})`,
    value: user.id,
  })),
)

const deviceOptions = computed(() =>
  devices.value.map((device) => ({
    label: `${device.name} (${device.code})`,
    value: device.id,
  })),
)

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

const timeRangeOptions = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7d', value: '7d' },
  { label: 'Last 30d', value: '30d' },
]

const typeChartData = computed(() => {
  const typeCounts = deviceTypes.reduce((acc, type) => {
    acc[type] = 0
    return acc
  }, {})

  devices.value.forEach((device) => {
    typeCounts[device.type] = (typeCounts[device.type] || 0) + 1
  })

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
  const ownerCounts = {}
  devices.value.forEach((device) => {
    const ownerName = device.owner?.fullname || 'Unknown'
    ownerCounts[ownerName] = (ownerCounts[ownerName] || 0) + 1
  })

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

const selectedDevice = computed(() => devices.value.find((device) => device.id === selectedDeviceId.value) || null)

const dataTypeOptions = computed(() => {
  const values = [...new Set(selectedDeviceData.value.map((entry) => entry.dataType).filter(Boolean))]
  return values.map((value) => ({ label: value, value }))
})

const filteredSelectedDeviceData = computed(() => {
  if (!selectedDataType.value) {
    return selectedDeviceData.value
  }
  return selectedDeviceData.value.filter((entry) => entry.dataType === selectedDataType.value)
})

function timestampToDate(timestamp) {
  if (!timestamp) {
    return null
  }

  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const rangeFilteredSelectedDeviceData = computed(() => {
  const now = Date.now()
  const rangeToMs = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }

  const threshold = now - (rangeToMs[selectedTimeRange.value] || rangeToMs['24h'])

  return filteredSelectedDeviceData.value.filter((entry) => {
    const parsed = timestampToDate(entry.timestamp)
    return parsed ? parsed.getTime() >= threshold : false
  })
})

const deviceDataTrendChart = computed(() => {
  const sorted = [...rangeFilteredSelectedDeviceData.value].sort((a, b) =>
    String(a.timestamp).localeCompare(String(b.timestamp)),
  )

  const points = sorted
    .map((entry) => ({
      label: String(entry.timestamp || '').replace('T', ' ').slice(5, 16),
      value: Number(entry.value),
      unit: entry.unit || '',
    }))
    .filter((point) => Number.isFinite(point.value))

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

async function apiRequest(path, options = {}) {
  const merged = {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  }

  const response = await fetch(`/api${path}`, merged)

  if (!response.ok) {
    const details = await response.text()
    throw new Error(
      details
        ? `${response.status} ${response.statusText}: ${details}`
        : `${response.status} ${response.statusText}`,
    )
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json') ? response.json() : null
}

async function refreshUsers() {
  loadingUsers.value = true
  try {
    users.value = await apiRequest('/users')
  } finally {
    loadingUsers.value = false
  }
}

async function refreshDevices() {
  loadingDevices.value = true
  try {
    devices.value = await apiRequest('/devices')
    if (selectedDeviceId.value && !devices.value.some((device) => device.id === selectedDeviceId.value)) {
      selectedDeviceId.value = null
      selectedDeviceData.value = []
    }
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
  try {
    selectedDeviceData.value = await apiRequest(`/devices/${selectedDeviceId.value}/data`)
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
  try {
    await Promise.all([refreshUsers(), refreshDevices()])
    await refreshSelectedDeviceData()
  } catch (error) {
    errorMessage.value = `Cannot load data. ${error.message}`
  }
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
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          fullname: userForm.value.fullname,
          username: userForm.value.username,
        }),
      })
    } else {
      await apiRequest(`/users/${userForm.value.id}`, {
        method: 'PUT',
        body: JSON.stringify({ fullname: userForm.value.fullname }),
      })
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
    await apiRequest(`/users/${user.id}`, { method: 'DELETE' })
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
    type: 'ARDUINO',
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

      await apiRequest(`/users/${deviceForm.value.ownerId}/devices`, {
        method: 'POST',
        body: JSON.stringify({
          name: deviceForm.value.name,
          code: deviceForm.value.code,
          type: deviceForm.value.type,
          ownerId: deviceForm.value.ownerId,
        }),
      })
    } else {
      await apiRequest(`/devices/${deviceForm.value.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: deviceForm.value.name,
          code: deviceForm.value.code,
          type: deviceForm.value.type,
        }),
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
    await apiRequest(`/devices/${device.id}`, { method: 'DELETE' })
    await refreshDevices()
  } catch (error) {
    errorMessage.value = `Cannot delete device. ${error.message}`
  }
}

onMounted(refreshAll)
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
</script>

<template>
  <main class="page-shell">
    <section class="hero-panel">
      <div class="hero-title-block">
        <p class="kicker">MonitorData Console</p>
        <h1>Users and Devices Management</h1>
        <p class="hero-subtitle">
          Vue + Tailwind + PrimeVue single-page app for managing users and assigned devices in real time.
        </p>
      </div>
      <div class="hero-actions">
        <Button label="Refresh" icon="pi pi-refresh" outlined @click="refreshAll" />
      </div>
    </section>

    <Menubar :model="menuItems" class="menu-surface">
      <template #end>
        <Button label="Refresh" icon="pi pi-refresh" size="small" outlined @click="refreshAll" />
      </template>
    </Menubar>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <section v-if="activeView === 'dashboard'" class="stats-grid">
      <Card class="glass-card stat-card">
        <template #content>
          <p class="stat-label">Users</p>
          <p class="stat-value">{{ users.length }}</p>
        </template>
      </Card>
      <Card class="glass-card stat-card">
        <template #content>
          <p class="stat-label">Devices</p>
          <p class="stat-value">{{ devices.length }}</p>
        </template>
      </Card>
    </section>

    <section v-if="activeView === 'dashboard'" class="workspace-grid">
      <Card class="glass-card">
        <template #title>Devices by Type</template>
        <template #subtitle>Distribution of device categories in the platform.</template>
        <template #content>
          <Chart type="bar" :data="typeChartData" class="chart-size" />
        </template>
      </Card>

      <Card class="glass-card">
        <template #title>Devices per User</template>
        <template #subtitle>Ownership split across registered users.</template>
        <template #content>
          <Chart type="doughnut" :data="ownerChartData" class="chart-size" />
        </template>
      </Card>
    </section>

    <section v-if="activeView === 'users'" class="workspace-grid single-panel">
      <Card class="glass-card">
        <template #title>Users</template>
        <template #subtitle>Create, update, and remove application users.</template>
        <template #content>
          <div class="mb-4 flex justify-end">
            <Button label="New User" icon="pi pi-plus" @click="openCreateUser" />
          </div>

          <DataTable :value="users" dataKey="id" :loading="loadingUsers" paginator :rows="8" responsiveLayout="scroll">
            <Column field="id" header="ID" style="width: 80px" />
            <Column field="fullname" header="Full Name" />
            <Column field="username" header="Username" />
            <Column header="Actions" style="width: 180px">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button size="small" icon="pi pi-pencil" text @click="openEditUser(slotProps.data)" />
                  <Button
                    size="small"
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    @click="removeUser(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

    </section>

    <section v-if="activeView === 'devices'" class="workspace-grid single-panel">

      <Card class="glass-card">
        <template #title>Devices</template>
        <template #subtitle>Track wearable and IoT devices linked to users.</template>
        <template #content>
          <div class="mb-4 flex justify-end">
            <Button label="New Device" icon="pi pi-plus" @click="openCreateDevice" />
          </div>

          <DataTable
            :value="devices"
            dataKey="id"
            :loading="loadingDevices"
            paginator
            :rows="8"
            responsiveLayout="scroll"
          >
            <Column field="id" header="ID" style="width: 80px" />
            <Column field="name" header="Name" />
            <Column field="code" header="Code" />
            <Column field="type" header="Type" style="width: 160px">
              <template #body="slotProps">
                <Tag :value="slotProps.data.type" severity="info" />
              </template>
            </Column>
            <Column header="Owner">
              <template #body="slotProps">
                {{ slotProps.data.owner?.fullname || 'N/A' }}
              </template>
            </Column>
            <Column header="Actions" style="width: 180px">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button size="small" icon="pi pi-pencil" text @click="openEditDevice(slotProps.data)" />
                  <Button
                    size="small"
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    @click="removeDevice(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </section>

    <section v-if="activeView === 'analytics'" class="workspace-grid">
      <Card class="glass-card">
        <template #title>Device Type Trendboard</template>
        <template #subtitle>Instant overview of devices grouped by technical type.</template>
        <template #content>
          <Chart type="polarArea" :data="typeChartData" class="chart-size" />
        </template>
      </Card>

      <Card class="glass-card">
        <template #title>Selected Device Data</template>
        <template #subtitle>Visualize numeric telemetry values for one device.</template>
        <template #content>
          <div class="mb-4 grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700" for="analytics-device">Device</label>
              <Dropdown
                id="analytics-device"
                v-model="selectedDeviceId"
                :options="deviceOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a device"
                class="w-full"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700" for="analytics-data-type">Data Type</label>
              <Dropdown
                id="analytics-data-type"
                v-model="selectedDataType"
                :options="dataTypeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select data type"
                class="w-full"
                :disabled="!selectedDeviceId"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700" for="analytics-range">Time Range</label>
              <SelectButton
                id="analytics-range"
                v-model="selectedTimeRange"
                :options="timeRangeOptions"
                optionLabel="label"
                optionValue="value"
                :allowEmpty="false"
                class="w-full"
              />
            </div>

            <Button
              label="Load Data"
              icon="pi pi-download"
              outlined
              :loading="loadingDeviceData"
              @click="refreshSelectedDeviceData"
            />
          </div>

          <p v-if="selectedDevice" class="mb-3 text-sm text-slate-600">
            Showing values for <strong>{{ selectedDevice.name }}</strong>
            <span v-if="selectedDataType"> and <strong>{{ selectedDataType }}</strong></span>
          </p>

          <Message v-if="selectedDeviceId && !selectedDeviceData.length" severity="warn" :closable="false">
            No numeric data points available for this device yet.
          </Message>

          <Message
            v-if="selectedDeviceData.length && !filteredSelectedDeviceData.length"
            severity="warn"
            :closable="false"
          >
            No entries available for the selected data type.
          </Message>

          <Message
            v-if="filteredSelectedDeviceData.length && !rangeFilteredSelectedDeviceData.length"
            severity="warn"
            :closable="false"
          >
            No entries available in the selected time range.
          </Message>

          <Chart v-if="rangeFilteredSelectedDeviceData.length" type="line" :data="deviceDataTrendChart" class="chart-size" />

          <DataTable
            v-if="rangeFilteredSelectedDeviceData.length"
            :value="rangeFilteredSelectedDeviceData"
            class="mt-4"
            paginator
            :rows="5"
            responsiveLayout="scroll"
          >
            <Column field="timestamp" header="Timestamp" />
            <Column field="dataType" header="Data Type" />
            <Column field="value" header="Value" />
            <Column field="unit" header="Unit" />
          </DataTable>
        </template>
      </Card>
    </section>

    <Dialog v-model:visible="userDialogVisible" modal :header="userDialogMode === 'create' ? 'New User' : 'Edit User'">
      <div class="dialog-grid">
        <label for="fullname">Full Name</label>
        <InputText id="fullname" v-model="userForm.fullname" />

        <label for="username">Username</label>
        <InputText id="username" v-model="userForm.username" :disabled="userDialogMode === 'edit'" />

        <div class="dialog-actions">
          <Button label="Cancel" text @click="userDialogVisible = false" />
          <Button label="Save" icon="pi pi-check" @click="saveUser" />
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="deviceDialogVisible" modal :header="deviceDialogMode === 'create' ? 'New Device' : 'Edit Device'">
      <div class="dialog-grid">
        <label for="device-name">Name</label>
        <InputText id="device-name" v-model="deviceForm.name" />

        <label for="device-code">Code</label>
        <InputText id="device-code" v-model="deviceForm.code" />

        <label for="device-type">Type</label>
        <Dropdown id="device-type" v-model="deviceForm.type" :options="deviceTypes" />

        <label for="device-owner">Owner</label>
        <Dropdown
          id="device-owner"
          v-model="deviceForm.ownerId"
          :options="ownerOptions"
          optionLabel="label"
          optionValue="value"
          :disabled="deviceDialogMode === 'edit'"
          placeholder="Select owner"
        />

        <div class="dialog-actions">
          <Button label="Cancel" text @click="deviceDialogVisible = false" />
          <Button label="Save" icon="pi pi-check" @click="saveDevice" />
        </div>
      </div>
    </Dialog>
  </main>
</template>
