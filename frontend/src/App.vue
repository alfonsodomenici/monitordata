<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'

const users = ref([])
const devices = ref([])
const loadingUsers = ref(false)
const loadingDevices = ref(false)
const errorMessage = ref('')

const userDialogVisible = ref(false)
const userDialogMode = ref('create')
const userForm = ref({ id: null, fullname: '', username: '' })

const deviceDialogVisible = ref(false)
const deviceDialogMode = ref('create')
const deviceForm = ref({ id: null, ownerId: null, name: '', code: '', type: 'ARDUINO' })

const deviceTypes = ['ARDUINO', 'SMARTH_WATCH', 'SMART_PHONE']

const ownerOptions = computed(() =>
  users.value.map((user) => ({
    label: `${user.fullname} (@${user.username})`,
    value: user.id,
  })),
)

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
  } finally {
    loadingDevices.value = false
  }
}

async function refreshAll() {
  errorMessage.value = ''
  try {
    await Promise.all([refreshUsers(), refreshDevices()])
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

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <section class="stats-grid">
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

    <section class="workspace-grid">
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
