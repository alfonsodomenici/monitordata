import { ref } from 'vue'
import { monitorApiControl } from './monitor-api.control'
import { toCreateUserPayload, toUpdateUserPayload } from '../entity/users.entity'

export function useUsersControl({ errorMessage, onDataChanged }) {
  const users = ref([])
  const loadingUsers = ref(false)

  const userDialogVisible = ref(false)
  const userDialogMode = ref('create')
  const userForm = ref({ id: null, fullname: '', username: '' })

  async function refreshUsers() {
    loadingUsers.value = true
    errorMessage.value = ''

    try {
      users.value = await monitorApiControl.listUsers()
    } catch (error) {
      errorMessage.value = `Cannot load users. ${error.message}`
    } finally {
      loadingUsers.value = false
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
        await monitorApiControl.createUser(toCreateUserPayload(userForm.value))
      } else {
        await monitorApiControl.updateUser(userForm.value.id, toUpdateUserPayload(userForm.value))
      }

      userDialogVisible.value = false
      await onDataChanged()
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
      await monitorApiControl.deleteUser(user.id)
      await onDataChanged()
    } catch (error) {
      errorMessage.value = `Cannot delete user. ${error.message}`
    }
  }

  return {
    users,
    loadingUsers,
    userDialogVisible,
    userDialogMode,
    userForm,
    refreshUsers,
    openCreateUser,
    openEditUser,
    saveUser,
    removeUser,
  }
}
