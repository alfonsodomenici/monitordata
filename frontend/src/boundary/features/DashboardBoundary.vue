<script setup>
import Card from 'primevue/card'
import Chart from 'primevue/chart'

defineProps({
  control: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="stats-grid">
    <Card class="glass-card stat-card">
      <template #content>
        <p class="stat-label">Users</p>
        <p class="stat-value">{{ control.users.length }}</p>
      </template>
    </Card>
    <Card class="glass-card stat-card">
      <template #content>
        <p class="stat-label">Devices</p>
        <p class="stat-value">{{ control.devices.length }}</p>
      </template>
    </Card>
  </section>

  <section class="workspace-grid">
    <Card class="glass-card">
      <template #title>Devices by Type</template>
      <template #subtitle>Distribution of device categories in the platform.</template>
      <template #content>
        <Chart type="bar" :data="control.typeChartData" class="chart-size" />
      </template>
    </Card>

    <Card class="glass-card">
      <template #title>Devices per User</template>
      <template #subtitle>Ownership split across registered users.</template>
      <template #content>
        <Chart type="doughnut" :data="control.ownerChartData" class="chart-size" />
      </template>
    </Card>
  </section>
</template>
