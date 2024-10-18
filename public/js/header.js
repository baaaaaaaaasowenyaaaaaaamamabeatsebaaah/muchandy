document.addEventListener('DOMContentLoaded', function () {
  // Dynamically load the header partial
  fetch('/partials/header.html')
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('header-placeholder').innerHTML = data;

      // Once the header is loaded, initialize the dropdown and mobile menu functionality
      initializeDropdowns();
      initializeMobileMenu();
    })
    .catch((error) => console.error('Error loading header:', error));
});

function initializeDropdowns() {
  // Select all dropdown toggle buttons
  const dropdownToggles = document.querySelectorAll('.w-dropdown-toggle');
  // Select all non-dropdown links (i.e., nav items without dropdowns)
  const nonDropdownLinks = document.querySelectorAll(
    '.w-nav-link:not(.w-dropdown-toggle)'
  );
  // Select the kontakt-info-navbar for detecting mouseover
  const kontaktInfoNavbar = document.querySelector('.kontakt-info-navbar');

  // Add hover event listeners to each dropdown toggle
  dropdownToggles.forEach((toggle) => {
    const dropdownList = toggle.nextElementSibling;

    // Show dropdown on mouseenter
    toggle.addEventListener('mouseenter', function () {
      closeAllDropdowns(); // Close other open dropdowns
      dropdownList.classList.add('w--open');
    });

    // Hide dropdown when mouse leaves the dropdown list area
    dropdownList.addEventListener('mouseleave', function () {
      dropdownList.classList.remove('w--open');
    });
  });

  // Close all dropdowns when the mouse moves over kontakt-info-navbar
  if (kontaktInfoNavbar) {
    kontaktInfoNavbar.addEventListener('mouseenter', function () {
      closeAllDropdowns();
    });
  }

  // Add hover event listeners to non-dropdown links to close any open dropdowns
  nonDropdownLinks.forEach((link) => {
    link.addEventListener('mouseenter', function () {
      closeAllDropdowns(); // Close any open dropdowns when hovering over non-dropdown link
    });
  });

  // Close all dropdowns
  function closeAllDropdowns() {
    const dropdownLists = document.querySelectorAll('.w-dropdown-list');
    dropdownLists.forEach((list) => {
      list.classList.remove('w--open');
    });
  }
}

function initializeMobileMenu() {
  // Mobile menu button toggle
  const menuButton = document.querySelector('.menu-button');
  menuButton.addEventListener('click', function () {
    const navMenu = document.querySelector('.nav-menu-3');
    navMenu.classList.toggle('w--open');
  });
}
