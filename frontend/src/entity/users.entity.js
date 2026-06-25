export function toOwnerOptions(users) {
  return users.map((user) => ({
    label: `${user.fullname} (@${user.username})`,
    value: user.id,
  }))
}

export function toCreateUserPayload(form) {
  return {
    fullname: form.fullname,
    username: form.username,
  }
}

export function toUpdateUserPayload(form) {
  return {
    fullname: form.fullname,
  }
}
