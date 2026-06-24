<script setup>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
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
    v-model:visible="control.userDialogVisible"
    modal
    :header="control.userDialogMode === 'create' ? 'New User' : 'Edit User'"
  >
    <div class="dialog-grid">
      <label for="fullname">Full Name</label>
      <InputText id="fullname" v-model="control.userForm.fullname" />

      <label for="username">Username</label>
      <InputText id="username" v-model="control.userForm.username" :disabled="control.userDialogMode === 'edit'" />

      <div class="dialog-actions">
        <Button label="Cancel" text @click="control.userDialogVisible = false" />
        <Button label="Save" icon="pi pi-check" @click="control.saveUser" />
      </div>
    </div>
  </Dialog>
</template>
