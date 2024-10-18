document.addEventListener('DOMContentLoaded', function () {
  console.log('app.js is loaded and working!');

  // Load the initial content based on the current URL
  const currentPath = window.location.pathname;
  const initialPage = currentPath === '/' ? 'index' : currentPath.slice(1);
  loadPage(initialPage);

  // Function to load the page dynamically
  function loadPage(page) {
    page = page || 'index'; // Default to 'index' for empty paths
    console.log(`Loading page: ${page}`);
    fetch(`/pages/${page}.html`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            return fetch('/pages/404.html');
          }
          throw new Error('Page not found');
        }
        return response.text();
      })
      .then((data) => {
        console.log('Page loaded successfully, injecting content');
        document.getElementById('content-placeholder').innerHTML = data;

        // Reinitialize form after loading content
        if (typeof initializeForm === 'function') {
          initializeForm();
        }

        // Reinitialize Lottie animations after loading content
        if (typeof initializeLottie === 'function') {
          initializeLottie();
        }

        // Update metadata and handle other page-specific logic
        updateMetadata(page);
      })
      .catch((error) => {
        console.error('Error loading page:', error);
        document.getElementById('content-placeholder').innerHTML =
          '<p>Seite nicht gefunden</p>';
      });
  }

  // Function to update metadata for each page dynamically
  function updateMetadata(page) {
    let title, description, ogTitle, ogDescription, ogUrl, ogImage, twitterCard;

    switch (page) {
      case 'reparatur-wahlen':
        title = 'Reparatur Wählen | mucHANDY';
        description = 'Select your device repair from mucHANDY.';
        ogTitle = 'Reparatur Wählen | mucHANDY';
        ogDescription = 'Choose your device repair easily.';
        ogUrl = 'https://www.muchandy.de/reparatur-wahlen';
        ogImage = 'https://www.muchandy.de/images/repair-og-image.jpg';
        twitterCard = 'summary_large_image';
        break;
      case 'tarifberatung':
        title = 'Tarifberatung | mucHANDY';
        description = 'Find the best mobile tariff plans for you.';
        ogTitle = 'Tarifberatung | mucHANDY';
        ogDescription = 'Get expert advice on mobile tariffs.';
        ogUrl = 'https://www.muchandy.de/tarifberatung';
        ogImage = 'https://www.muchandy.de/images/tarif-og-image.jpg';
        twitterCard = 'summary_large_image';
        break;
      case 'about':
        title = 'About Us | mucHANDY';
        description = 'Learn more about mucHANDY and our services.';
        ogTitle = 'About Us | mucHANDY';
        ogDescription = 'Know more about our repair services and company.';
        ogUrl = 'https://www.muchandy.de/about';
        ogImage = 'https://www.muchandy.de/images/about-og-image.jpg';
        twitterCard = 'summary_large_image';
        break;
      default:
        title = 'Home | mucHANDY';
        description = 'Handy, iPhone & iPad Reparatur in München | mucHANDY';
        ogTitle = 'Handy, iPhone & iPad Reparatur in München | mucHANDY';
        ogDescription = 'Get your devices repaired at mucHANDY in Munich.';
        ogUrl = 'https://www.muchandy.de/';
        ogImage = 'https://www.muchandy.de/images/home-og-image.jpg';
        twitterCard = 'summary_large_image';
    }

    document.title = title;
    document
      .querySelector('meta[name="description"]')
      .setAttribute('content', description);
    document
      .querySelector('meta[property="og:title"]')
      .setAttribute('content', ogTitle);
    document
      .querySelector('meta[property="og:description"]')
      .setAttribute('content', ogDescription);
    document
      .querySelector('meta[property="og:url"]')
      .setAttribute('content', ogUrl);
    document
      .querySelector('meta[property="og:image"]')
      .setAttribute('content', ogImage);
    document
      .querySelector('meta[name="twitter:card"]')
      .setAttribute('content', twitterCard);
    document
      .querySelector('meta[name="twitter:title"]')
      .setAttribute('content', title);
    document
      .querySelector('meta[name="twitter:description"]')
      .setAttribute('content', description);
    document
      .querySelector('meta[name="twitter:image"]')
      .setAttribute('content', ogImage);
  }

  // Lottie animation initialization function
  let lottieInstances = []; // Store active Lottie instances

  function initializeLottie() {
    console.log('Initializing Lottie animations...');

    // Destroy any existing Lottie instances to prevent multiple SVGs
    lottieInstances.forEach((instance) => instance.destroy());
    lottieInstances = []; // Clear the array after destroying

    const lottieContainers = document.querySelectorAll('.lottie-animation');

    if (lottieContainers.length === 0) {
      console.warn(
        'No Lottie animation containers found on the page. Retrying...'
      );
      setTimeout(initializeLottie, 200); // Retry after 200ms
      return;
    }

    // If containers are found, initialize them
    lottieContainers.forEach((container) => {
      const animationPath = container.getAttribute('data-src');
      const loop = container.getAttribute('data-loop') === '1';
      const autoplay = container.getAttribute('data-autoplay') === '1';

      const animationInstance = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: loop,
        autoplay: autoplay,
        path: animationPath,
      });

      // Store the instance so we can destroy it later
      lottieInstances.push(animationInstance);
      console.log(`Initialized Lottie animation for container:`, container);
    });
  }

  // Event listener for dynamic navigation
  document.body.addEventListener('click', function (event) {
    const target = event.target.closest('a');
    if (target) {
      let href = target.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('tel:')) {
        return; // Ignore external links or telephone links
      }

      event.preventDefault(); // Prevent default navigation
      const page = href.startsWith('/') ? href.slice(1) : href;
      loadPage(page); // Load the page dynamically
    }
  });

  // Handle browser back/forward navigation
  window.addEventListener('popstate', function (event) {
    const page = event.state?.page || 'index';
    loadPage(page); // Load the appropriate page
  });
});
