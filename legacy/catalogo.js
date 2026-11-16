/**
 * Funciones compartidas para las páginas de productos y el carrito.
 * Se ejecuta una sola vez y expone `window.Catalogo`.
 */
(function () {
  'use strict';

  const CART_KEY = 'cart';
  const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  function parsePrice(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (value == null) return 0;

    const normalized = String(value)
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const price = Number(normalized);
    return Number.isFinite(price) ? price : 0;
  }

  function formatPrice(value) {
    return '$' + numberFormat.format(parsePrice(value));
  }

  /** Convierte un producto del JSON original al formato interno (más liviano). */
  function normalizeProduct(raw) {
    if (!raw || typeof raw !== 'object') return null;

    return {
      title: raw.title || raw['poly-component__title'] || 'Producto sin título',
      href: raw.href || raw['poly-component__title href'] || '#',
      image: raw.image || raw['poly-component__picture src'] || '',
      price: raw.price != null ? parsePrice(raw.price) : parsePrice(raw['andes-money-amount__fraction'])
    };
  }

  function readCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(stored)) return [];
      return stored.map(normalizeProduct).filter(Boolean);
    } catch (error) {
      console.warn('No se pudo leer el carrito:', error);
      return [];
    }
  }

  function writeCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn('No se pudo guardar el carrito:', error);
    }
    updateCartBadge();
  }

  function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const count = readCart().length;
    badge.textContent = count;
    badge.hidden = count === 0;
  }

  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-message';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');

    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  function addToCart(product) {
    const item = normalizeProduct(product);
    if (!item) return;

    const cart = readCart();
    cart.push(item);
    writeCart(cart);
    showToast('Agregado: ' + item.title);
  }

  function createCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.image;
    image.alt = product.title;
    image.loading = index < 4 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.width = 300;
    image.height = 300;

    const title = document.createElement('a');
    title.className = 'product-title';
    title.href = product.href;
    title.target = '_blank';
    title.rel = 'noopener noreferrer';
    title.textContent = product.title;

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = product.price ? formatPrice(product.price) : '';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'add-to-cart';
    button.textContent = 'Agregar al carrito';
    button.addEventListener('click', function () {
      addToCart(product);
    });

    card.append(image, title, price, button);
    return card;
  }

  async function renderCatalogo(options) {
    const container = document.getElementById(options.container);
    if (!container) return;

    container.classList.add('product-gallery');
    container.setAttribute('aria-busy', 'true');
    container.textContent = 'Cargando productos…';

    try {
      const response = await fetch(options.jsonUrl);
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('El catálogo no tiene el formato esperado');
      }

      const fragment = document.createDocumentFragment();
      const seen = new Set();
      let rendered = 0;

      data.forEach(function (raw) {
        const product = normalizeProduct(raw);
        if (!product) return;

        // Los JSON de origen traen productos repetidos: se muestran una sola vez.
        const key = product.title + '|' + product.price;
        if (seen.has(key)) return;
        seen.add(key);

        fragment.appendChild(createCard(product, rendered));
        rendered += 1;
      });

      container.replaceChildren(fragment);
      container.removeAttribute('aria-busy');
    } catch (error) {
      console.error('Error al cargar el catálogo:', error);
      container.textContent = 'No se pudieron cargar los productos. Intentá recargar la página.';
      container.removeAttribute('aria-busy');
    }
  }

  window.Catalogo = {
    readCart: readCart,
    writeCart: writeCart,
    updateCartBadge: updateCartBadge,
    addToCart: addToCart,
    normalizeProduct: normalizeProduct,
    parsePrice: parsePrice,
    formatPrice: formatPrice,
    showToast: showToast,
    renderCatalogo: renderCatalogo
  };

  document.addEventListener('DOMContentLoaded', updateCartBadge);
  window.addEventListener('storage', function (event) {
    if (event.key === CART_KEY) updateCartBadge();
  });
})();
