document.addEventListener('DOMContentLoaded', function () {
  console.log('form.js is loaded and working!');

  // Check if form is in the DOM after page content is injected
  function checkFormLoaded() {
    const manufacturerSelect = document.getElementById('manufacturer');
    const deviceSelect = document.getElementById('device');
    const actionSelect = document.getElementById('action');

    if (manufacturerSelect && deviceSelect && actionSelect) {
      console.log('Form elements found in the DOM.');
      initializeForm(); // Initialize only if the form elements are found
    } else {
      console.warn('Form elements not yet in the DOM. Retrying...');
      setTimeout(checkFormLoaded, 500); // Retry after a short delay
    }
  }

  // Initialize form logic
  function initializeForm() {
    const manufacturerSelect = document.getElementById('manufacturer');
    const deviceSelect = document.getElementById('device');
    const actionSelect = document.getElementById('action');

    // Clear the select options in case of re-initialization
    manufacturerSelect.innerHTML =
      '<option value="" disabled selected>Hersteller auswählen</option>';
    deviceSelect.innerHTML =
      '<option value="" disabled selected>Zuerst Hersteller auswählen</option>';
    deviceSelect.setAttribute('disabled', true);
    actionSelect.innerHTML =
      '<option value="" disabled selected>Zuerst Gerät auswählen</option>';
    actionSelect.setAttribute('disabled', true);

    // Load manufacturers from API
    fetch('/api/manufacturers')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load manufacturers');
        return response.json();
      })
      .then((manufacturers) => {
        // Populate manufacturers dropdown
        console.log('Manufacturers data:', manufacturers);
        manufacturers.forEach((manufacturer) => {
          const option = document.createElement('option');
          option.value = manufacturer.id;
          option.textContent = manufacturer.name;
          manufacturerSelect.appendChild(option);
        });

        console.log('Manufacturers populated in the dropdown');
        manufacturerSelect.removeAttribute('disabled');
      })
      .catch((error) => {
        console.error('Error loading manufacturers:', error);
      });

    // Manufacturer selection event
    manufacturerSelect.addEventListener('change', function () {
      const selectedManufacturerId = this.value;
      deviceSelect.innerHTML =
        '<option value="" disabled selected>Zuerst Hersteller auswählen</option>';
      actionSelect.innerHTML =
        '<option value="" disabled selected>Zuerst Gerät auswählen</option>';
      actionSelect.setAttribute('disabled', true);

      // Fetch devices for the selected manufacturer
      fetch(`/api/manufacturers/${selectedManufacturerId}/devices`)
        .then((response) => response.json())
        .then((devices) => {
          if (devices.length > 0) {
            devices.forEach((device) => {
              const option = document.createElement('option');
              option.value = device.id;
              option.textContent = device.name;
              deviceSelect.appendChild(option);
            });
            deviceSelect.removeAttribute('disabled');
          } else {
            deviceSelect.innerHTML =
              '<option value="" disabled selected>Keine Geräte verfügbar</option>';
          }
        })
        .catch((error) => {
          console.error('Error loading devices:', error);
        });
    });

    // Device selection event
    deviceSelect.addEventListener('change', function () {
      const selectedDeviceId = this.value;
      actionSelect.innerHTML =
        '<option value="" disabled selected>Zuerst Gerät auswählen</option>';

      // Fetch actions for the selected device
      fetch(`/api/devices/${selectedDeviceId}/actions`)
        .then((response) => response.json())
        .then((actions) => {
          if (actions.length > 0) {
            actions.forEach((action) => {
              const option = document.createElement('option');
              option.value = action.id;
              option.textContent = action.name;
              actionSelect.appendChild(option);
            });
            actionSelect.removeAttribute('disabled');
          } else {
            actionSelect.innerHTML =
              '<option value="" disabled selected>Keine Aktionen verfügbar</option>';
          }
        })
        .catch((error) => {
          console.error('Error loading actions:', error);
        });
    });

    // Action selection event
    actionSelect.addEventListener('change', function () {
      const selectedActionId = this.value;

      // Fetch price for the selected action
      fetch(`/api/actions/${selectedActionId}/price`)
        .then((response) => response.json())
        .then((data) => {
          document.getElementById('price').querySelector('span').textContent =
            data.price || 'N/A';
        })
        .catch((error) => {
          console.error('Error loading price:', error);
          document.getElementById('price').querySelector('span').textContent =
            'N/A';
        });
    });
  }

  // Start checking for form elements once the DOM is fully loaded
  checkFormLoaded();
});
