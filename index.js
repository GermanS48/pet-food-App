// Fetch the JSON file
fetch('./galeria.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const slideshowContainer = document.getElementById('slideshow');

        // Create slides dynamically
        data.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.classList.add('slide');
            slide.setAttribute('aria-hidden', index !== 0); // Hide non-active slides for accessibility
            if (index === 0) slide.classList.add('active'); // Make the first slide active

            // Create the image element
            const img = document.createElement('img');
            img.src = item["poly-component__picture src"];
            img.alt = item["poly-component__title"] || 'Product Image'; // Fallback alt text

            // Create the title element wrapped in a link
            const titleLink = document.createElement('a');
            titleLink.href = item["poly-component__title href"];
            titleLink.target = '_blank'; // Open in a new tab
            titleLink.textContent = item["poly-component__title"] || 'No Title Available'; // Fallback title
            titleLink.classList.add('slide-title-link');

            // Append the image and title link to the slide
            slide.appendChild(img);
            slide.appendChild(titleLink);

            // Append the slide to the slideshow container
            slideshowContainer.appendChild(slide);
        });

        // Start the slideshow
        startSlideshow();
    })
    .catch(error => console.error('Error fetching or processing JSON:', error));

function startSlideshow() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');

    function showNextSlide() {
        // Hide the current slide
        slides[slideIndex].classList.remove('active');
        slides[slideIndex].setAttribute('aria-hidden', true);

        // Move to the next slide
        slideIndex = (slideIndex + 1) % slides.length;

        // Show the next slide
        slides[slideIndex].classList.add('active');
        slides[slideIndex].setAttribute('aria-hidden', false);
    }

    // Change slide every 5 seconds
    setInterval(showNextSlide, 5000); // 5000 milliseconds = 5 seconds
}

function initMap() {
  // Example: Buenos Aires
  const myLatLng = { lat: -34.6037, lng: -58.3816 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: myLatLng,
  });
  new google.maps.Marker({
    position: myLatLng,
    map,
    title: "PET FOOD",
  });
}
fetch('./pet food-2025-04-29.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const slideshowContainer = document.getElementById('slideshow2');

        // Create slides dynamically
        data.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.classList.add('slide');
            slide.setAttribute('aria-hidden', index !== 0); // Hide non-active slides for accessibility
            if (index === 0) slide.classList.add('active'); // Make the first slide active

            // Create the image element
            const img = document.createElement('img');
            img.src = item["poly-component__picture src"];
            img.alt = item["poly-component__title"] || 'Product Image'; // Fallback alt text

            // Create the title element wrapped in a link
            const titleLink = document.createElement('a');
            titleLink.href = item["poly-component__title href"];
            titleLink.target = '_blank'; // Open in a new tab
            titleLink.textContent = item["poly-component__title"] || 'No Title Available'; // Fallback title
            titleLink.classList.add('slide-title-link');

            // Append the image and title link to the slide
            slide.appendChild(img);
            slide.appendChild(titleLink);

            // Append the slide to the slideshow container
            slideshowContainer.appendChild(slide);
        });

        // Start the slideshow
        startSlideshow2();
    })
    .catch(error => console.error('Error fetching or processing JSON:', error));

function startSlideshow2() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');

    function showNextSlide() {
        // Hide the current slide
        slides[slideIndex].classList.remove('active');
        slides[slideIndex].setAttribute('aria-hidden', true);

        // Move to the next slide
        slideIndex = (slideIndex + 1) % slides.length;

        // Show the next slide
        slides[slideIndex].classList.add('active');
        slides[slideIndex].setAttribute('aria-hidden', false);
    }

    // Change slide every 5 seconds
    setInterval(showNextSlide, 5000); // 5000 milliseconds = 5 seconds
}
let map, marker, geocoder;

function initGoMap() {
  // Initialize GoMaps.pro map
  map = new GoMap({
    apiKey: "YOUR_GOMAPS_API_KEY", // Replace with your GoMaps.pro API key
    target: "map",
    center: [-34.6037, -58.3816], // [lat, lng] for Buenos Aires
    zoom: 12
  });
  geocoder = new GoMap.Geocoder({ apiKey: "YOUR_GOMAPS_API_KEY" });
}

document.addEventListener("DOMContentLoaded", function() {
  initGoMap();

  document.getElementById("location-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const address = document.getElementById("location-input").value;
    geocoder.geocode(address, function(results) {
      if (results && results.length > 0) {
        const lat = results[0].lat;
        const lng = results[0].lng;
        map.setCenter([lat, lng]);
        if (marker) map.removeMarker(marker);
        marker = map.addMarker({
          position: [lat, lng],
          title: address
        });
      } else {
        alert("No se pudo encontrar la ubicación.");
      }
    });
  });
});
