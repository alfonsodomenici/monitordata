const API_ROOT = '/api'

async function request(path, options = {}) {
  const merged = {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  }

  const response = await fetch(`${API_ROOT}${path}`, merged)

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

export const monitorApiControl = {
  listUsers: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  listDevices: () => request('/devices'),
  createDevice: (ownerId, payload) =>
    request(`/users/${ownerId}/devices`, { method: 'POST', body: JSON.stringify(payload) }),
  updateDevice: (id, payload) => request(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),

  listDeviceData: (deviceId) => request(`/devices/${deviceId}/data`),
}
