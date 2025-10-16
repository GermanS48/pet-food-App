const cartSummary = document.getElementById('cart-summary');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Group products by title
function groupCart(cart) {
    const grouped = {};
    cart.forEach(item => {
        const key = item["poly-component__title"];
        if (!grouped[key]) {
            grouped[key] = { ...item, quantity: 0 };
        }
        grouped[key].quantity += 1;
    });
    return grouped;
}

function renderCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const grouped = groupCart(cart);
    const items = Object.values(grouped);

    if (items.length === 0) {
        cartSummary.innerHTML = '<p>El carrito está vacío.</p>';
        return;
    }

    let total = 0;
    cartSummary.innerHTML = items.map(item => {
        const price = parseFloat(item["andes-money-amount__fraction"].replace('.', '').replace(',', '.')) || 0;
        total += price * item.quantity;
        return `
            <div class="product-card">
                <img src="${item["poly-component__picture src"]}" alt="${item["poly-component__title"]}" class="product-image" style="max-width:80px;">
                <div>
                    <strong>${item["poly-component__title"]}</strong>
                    <div class="product-price">$${item["andes-money-amount__fraction"]}</div>
                    <div>
                        <button class="remove-btn" data-title="${item["poly-component__title"]}">−</button>
                        <span style="margin:0 10px;">${item.quantity}</span>
                        <button class="add-btn" data-title="${item["poly-component__title"]}">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('') + `<div style="margin-top:20px;font-size:1.2em;"><strong>Total: $${total.toLocaleString()}</strong></div>`;

    // Add event listeners for buttons
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.onclick = () => {
            const title = btn.getAttribute('data-title');
            const item = items.find(i => i["poly-component__title"] === title);
            cart.push(item);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        };
    });
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.onclick = () => {
            const title = btn.getAttribute('data-title');
            const idx = cart.findIndex(i => i["poly-component__title"] === title);
            if (idx !== -1) {
                cart.splice(idx, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            }
        };
    });
}

renderCart();
const emptyCartBtn = document.getElementById('empty-cart');
if (emptyCartBtn) {
    emptyCartBtn.onclick = () => {
        localStorage.removeItem('cart');
        renderCart();
    };
}
