<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

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
      <template #title>Users</template>
      <template #subtitle>Create, update, and remove application users.</template>
      <template #content>
        <div class="mb-4 flex justify-end">
          <Button label="New User" icon="pi pi-plus" @click="control.openCreateUser" />
        </div>

        <DataTable
          :value="control.users"
          dataKey="id"
          :loading="control.loadingUsers"
          paginator
          :rows="8"
          responsiveLayout="scroll"
        >
          <Column field="id" header="ID" style="width: 80px" />
          <Column field="fullname" header="Full Name" />
          <Column field="username" header="Username" />
          <Column header="Actions" style="width: 180px">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button size="small" icon="pi pi-pencil" text @click="control.openEditUser(slotProps.data)" />
                <Button
                  size="small"
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  @click="control.removeUser(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </section>
</template>
