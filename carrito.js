updateCartBadge();  
fetch('./pet food-2025-04-29.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const galleryContainer = document.getElementById('productosContainer');
        galleryContainer.classList.add('product-gallery'); // Add gallery class for styling

        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            // Product image
            const img = document.createElement('img');
            img.src = item["poly-component__picture src"];
            img.alt = item["poly-component__title"] || 'Product Image';
            img.classList.add('product-image');

            // Product title as link
            const titleLink = document.createElement('a');
            titleLink.href = item["poly-component__title href"] || '#';
            titleLink.target = '_blank';
            titleLink.textContent = item["poly-component__title"] || 'No Title Available';
            titleLink.classList.add('product-title');

            // Product price
            const price = document.createElement('p');
            price.classList.add('product-price');
            price.textContent = item["andes-money-amount__fraction"] 
                ? `$${item["andes-money-amount__fraction"]}` 
                : '';

            // Add to Cart button
            const addButton = document.createElement('button');
            addButton.textContent = 'Agregar al carrito';
            addButton.classList.add('add-to-cart');
           addButton.onclick = () => {
    // Get current cart or empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Add current product
    cart.push(item);
    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Agregado: ${item["poly-component__title"]}`);
};
            // Append elements to card
            card.appendChild(img);
            card.appendChild(titleLink);
            card.appendChild(price);
            card.appendChild(addButton);

            // Append card to gallery
            galleryContainer.appendChild(card);
        });
    })
    .catch(error => console.error('Error fetching or processing JSON:', error));
    // Update cart badge with the number of items in localStorage
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    badge.textContent = cart.length;
    badge.style.display = cart.length > 0 ? 'inline-block' : 'none';
}


// Call on page load



// If you add to cart elsewhere, call updateCartBadge() after adding    