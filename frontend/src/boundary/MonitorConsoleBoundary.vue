<script setup>
import { reactive } from 'vue'
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import { useMonitorDataControl } from '../control/use-monitor-data.control'
import DashboardBoundary from './features/DashboardBoundary.vue'
import UsersBoundary from './features/UsersBoundary.vue'
import DevicesBoundary from './features/DevicesBoundary.vue'
import AnalyticsBoundary from './features/AnalyticsBoundary.vue'
import UserDialogBoundary from './dialogs/UserDialogBoundary.vue'
import DeviceDialogBoundary from './dialogs/DeviceDialogBoundary.vue'

const control = reactive(useMonitorDataControl())
</script>

<template>
  <main class="page-shell">
    <section class="hero-panel">
      <div class="hero-title-block">
        <p class="kicker">MonitorData Console</p>
        <h1>Users and Devices Management</h1>
        <p class="hero-subtitle">
          Frontend architecture refactored into boundary/control/entity for better readability and maintenance.
        </p>
      </div>
      <div class="hero-actions">
        <Button label="Refresh" icon="pi pi-refresh" outlined @click="control.refreshAll" />
      </div>
    </section>

    <Menubar :model="control.menuItems" class="menu-surface">
      <template #end>
        <Button label="Refresh" icon="pi pi-refresh" size="small" outlined @click="control.refreshAll" />
      </template>
    </Menubar>

    <Message v-if="control.errorMessage" severity="error" :closable="false">{{ control.errorMessage }}</Message>

    <DashboardBoundary v-if="control.activeView === 'dashboard'" :control="control" />
    <UsersBoundary v-if="control.activeView === 'users'" :control="control" />
    <DevicesBoundary v-if="control.activeView === 'devices'" :control="control" />
    <AnalyticsBoundary v-if="control.activeView === 'analytics'" :control="control" />

    <UserDialogBoundary :control="control" />
    <DeviceDialogBoundary :control="control" />
  </main>
</template>
