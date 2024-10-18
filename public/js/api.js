// Use CommonJS-like functions in the browser environment
const api = {
  fetchManufacturers: async function () {
    const response = await fetch('/api/manufacturers');
    if (!response.ok) throw new Error('Failed to load manufacturers');
    return response.json();
  },

  fetchDevices: async function (manufacturerId) {
    const response = await fetch(
      `/api/manufacturers/${manufacturerId}/devices`
    );
    if (!response.ok)
      throw new Error(
        `Failed to load devices for manufacturer ${manufacturerId}`
      );
    return response.json();
  },

  fetchActions: async function (deviceId) {
    const response = await fetch(`/api/devices/${deviceId}/actions`);
    if (!response.ok)
      throw new Error(`Failed to load actions for device ${deviceId}`);
    return response.json();
  },

  fetchPrice: async function (actionId) {
    const response = await fetch(`/api/actions/${actionId}/price`);
    if (!response.ok)
      throw new Error(`Failed to load price for action ${actionId}`);
    return response.json();
  },
};

// Make the api object available globally
window.api = api;
