<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'

defineProps({
  control: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="workspace-grid single-panel">
    <Card class="glass-card">
      <template #title>Devices</template>
      <template #subtitle>Track wearable and IoT devices linked to users.</template>
      <template #content>
        <div class="mb-4 flex justify-end">
          <Button label="New Device" icon="pi pi-plus" @click="control.openCreateDevice" />
        </div>

        <DataTable
          :value="control.devices"
          dataKey="id"
          :loading="control.loadingDevices"
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
                <Button size="small" icon="pi pi-pencil" text @click="control.openEditDevice(slotProps.data)" />
                <Button
                  size="small"
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  @click="control.removeDevice(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </section>
</template>
