document.addEventListener('DOMContentLoaded', () => {
  loadPartials();
  handleRouting();
});

function loadPartials() {
  // Load header and footer
  fetch('/partials/header.html')
    .then((response) => response.text())
    .then((data) => {
      document.querySelector('header').innerHTML = data;
      setupNavigation();
    });

  fetch('/partials/footer.html')
    .then((response) => response.text())
    .then((data) => {
      document.querySelector('footer').innerHTML = data;
    });
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('a[data-route]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const route = event.target.getAttribute('data-route');
      navigateTo(route);
    });
  });
}
