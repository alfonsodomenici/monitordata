<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dropdown from 'primevue/dropdown'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'

defineProps({
  control: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="workspace-grid">
    <Card class="glass-card">
      <template #title>Device Type Trendboard</template>
      <template #subtitle>Instant overview of devices grouped by technical type.</template>
      <template #content>
        <Chart type="polarArea" :data="control.typeChartData" class="chart-size" />
      </template>
    </Card>

    <Card class="glass-card">
      <template #title>Selected Device Data</template>
      <template #subtitle>Visualize telemetry by device, data type, and time range.</template>
      <template #content>
        <div class="mb-4 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700" for="analytics-device">Device</label>
            <Dropdown
              id="analytics-device"
              v-model="control.selectedDeviceId"
              :options="control.deviceOptions"
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
              v-model="control.selectedDataType"
              :options="control.dataTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select data type"
              class="w-full"
              :disabled="!control.selectedDeviceId"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700" for="analytics-range">Time Range</label>
            <SelectButton
              id="analytics-range"
              v-model="control.selectedTimeRange"
              :options="control.timeRangeOptions"
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
            :loading="control.loadingDeviceData"
            @click="control.refreshSelectedDeviceData"
          />
        </div>

        <p v-if="control.selectedDevice" class="mb-3 text-sm text-slate-600">
          Showing values for <strong>{{ control.selectedDevice.name }}</strong>
          <span v-if="control.selectedDataType"> and <strong>{{ control.selectedDataType }}</strong></span>
        </p>

        <Message v-if="control.selectedDeviceId && !control.selectedDeviceData.length" severity="warn" :closable="false">
          No numeric data points available for this device yet.
        </Message>

        <Message
          v-if="control.selectedDeviceData.length && control.selectedDataType && !control.filteredByDataType.length"
          severity="warn"
          :closable="false"
        >
          No entries available for the selected data type.
        </Message>

        <Message
          v-if="control.selectedDeviceData.length && !control.rangeFilteredSelectedDeviceData.length"
          severity="warn"
          :closable="false"
        >
          No entries available in the selected time range.
        </Message>

        <Chart
          v-if="control.rangeFilteredSelectedDeviceData.length"
          type="line"
          :data="control.deviceDataTrendChart"
          class="chart-size"
        />

        <DataTable
          v-if="control.rangeFilteredSelectedDeviceData.length"
          :value="control.rangeFilteredSelectedDeviceData"
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
</template>
