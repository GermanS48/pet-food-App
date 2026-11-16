/* Resumen del carrito (requiere catalogo.js). */
(function () {
  'use strict';

  const summary = document.getElementById('cart-summary');
  const emptyButton = document.getElementById('empty-cart');

  if (!summary || !window.Catalogo) return;

  const { readCart, writeCart, formatPrice, showToast } = window.Catalogo;

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function groupItems(items) {
    const groups = [];
    const byKey = new Map();

    items.forEach(function (item) {
      const key = item.title + '|' + item.price;
      let group = byKey.get(key);

      if (!group) {
        group = { item: item, quantity: 0 };
        byKey.set(key, group);
        groups.push(group);
      }

      group.quantity += 1;
    });

    return groups;
  }

  function render() {
    const items = readCart();
    const groups = groupItems(items);

    if (emptyButton) emptyButton.disabled = items.length === 0;

    if (groups.length === 0) {
      summary.innerHTML = '<p class="cart-empty">El carrito está vacío.</p>';
      return;
    }

    let total = 0;

    const rows = groups.map(function (group, index) {
      const item = group.item;
      const subtotal = item.price * group.quantity;
      total += subtotal;

      const safeTitle = escapeHTML(item.title);
      const href = escapeHTML(item.href || '#');
      const image = escapeHTML(item.image || '');

      return (
        '<article class="cart-item">' +
          '<img class="cart-item-image" src="' + image + '" alt="' + safeTitle + '" width="80" height="80" loading="lazy" decoding="async">' +
          '<div class="cart-item-info">' +
            '<a class="cart-item-title" href="' + href + '" target="_blank" rel="noopener noreferrer">' + safeTitle + '</a>' +
            '<span class="product-price">' + formatPrice(item.price) + '</span>' +
            '<div class="cart-item-actions">' +
              '<button type="button" class="remove-btn" data-action="remove" data-index="' + index + '" aria-label="Quitar una unidad de ' + safeTitle + '">−</button>' +
              '<span class="cart-item-quantity">' + group.quantity + '</span>' +
              '<button type="button" class="add-btn" data-action="add" data-index="' + index + '" aria-label="Agregar una unidad de ' + safeTitle + '">+</button>' +
            '</div>' +
          '</div>' +
          '<strong class="cart-item-subtotal">' + formatPrice(subtotal) + '</strong>' +
        '</article>'
      );
    });

    summary.innerHTML =
      '<div class="cart-list">' + rows.join('') + '</div>' +
      '<p class="cart-summary-total">Total (' + items.length + ' ' + (items.length === 1 ? 'producto' : 'productos') + '): <strong>' + formatPrice(total) + '</strong></p>';
  }

  summary.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const groups = groupItems(readCart());
    const group = groups[Number(button.dataset.index)];
    if (!group) return;

    const cart = readCart();

    if (button.dataset.action === 'add') {
      cart.push({ ...group.item });
    } else {
      const index = cart.findIndex(function (item) {
        return item.title === group.item.title && item.price === group.item.price;
      });
      if (index !== -1) cart.splice(index, 1);
    }

    writeCart(cart);
    render();
  });

  if (emptyButton) {
    emptyButton.addEventListener('click', function () {
      writeCart([]);
      render();
      showToast('Carrito vaciado');
    });
  }

  window.addEventListener('storage', function (event) {
    if (event.key === 'cart') render();
  });

  render();
})();
