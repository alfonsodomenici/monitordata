<script setup>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

defineProps({
  control: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <Dialog
    v-model:visible="control.deviceDialogVisible"
    modal
    :header="control.deviceDialogMode === 'create' ? 'New Device' : 'Edit Device'"
  >
    <div class="dialog-grid">
      <label for="device-name">Name</label>
      <InputText id="device-name" v-model="control.deviceForm.name" />

      <label for="device-code">Code</label>
      <InputText id="device-code" v-model="control.deviceForm.code" />

      <label for="device-type">Type</label>
      <Dropdown id="device-type" v-model="control.deviceForm.type" :options="control.deviceTypes" />

      <label for="device-owner">Owner</label>
      <Dropdown
        id="device-owner"
        v-model="control.deviceForm.ownerId"
        :options="control.ownerOptions"
        optionLabel="label"
        optionValue="value"
        :disabled="control.deviceDialogMode === 'edit'"
        placeholder="Select owner"
      />

      <div class="dialog-actions">
        <Button label="Cancel" text @click="control.deviceDialogVisible = false" />
        <Button label="Save" icon="pi pi-check" @click="control.saveDevice" />
      </div>
    </div>
  </Dialog>
</template>
