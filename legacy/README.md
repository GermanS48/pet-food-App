# PET FOOD

Sitio web estático de PET FOOD (HTML, CSS y JavaScript sin dependencias de build) con catálogo de productos para perros y gatos, carrito local y páginas de contacto y entregas.

## Cómo ejecutarlo

El proyecto usa `fetch()` para leer los catálogos JSON, así que necesita servirse por HTTP (no abrir los archivos con `file://`).

```bash
# Opción 1: Python
python3 -m http.server 5501

# Opción 2: Live Server de VS Code
# Clic derecho sobre index.html > "Open with Live Server"
```

Luego abrir <http://127.0.0.1:5501/>.

## Estructura

```
index.html                 Portada
productos.html             Catálogo de perros
productos2.html            Catálogo de gatos
compras.html               Resumen del carrito
entregas.html              Zona de cobertura
formulario.html            Contacto (FormSubmit)

style.css                  Estilos generales y portada
carrito.css                Grilla de productos, carrito y avisos
formulario.css             Estilos del formulario de contacto
whatsapp.css               Botón flotante de WhatsApp

catalogo.js                Funciones compartidas de catálogo y carrito
carrito.js                 Catálogo de perros
carrito2.js                Catálogo de gatos
mostrar-carrito.js         Render del resumen de compra
index.js                   Galería de portada y videos

galeria.json               Productos destacados de la portada
perros-2025-04-29.json     Catálogo de perros
gatos-2025-05-01.json      Catálogo de gatos
```

## Optimizaciones aplicadas

- **Menos peticiones y errores:** `index.js` ya no se carga en todas las páginas ni intenta renderizar elementos inexistentes. Se eliminaron los errores de consola por `slideshow2` y por la API de mapas no incluida.
- **Catálogo sin duplicados:** los JSON traían productos repetidos; ahora se muestran una sola vez.
- **Código compartido:** `carrito.js` y `carrito2.js` pasaron de ~75 líneas duplicadas cada uno a una llamada a `catalogo.js`.
- **Carrito más liviano y correcto:** se guardan solo los datos necesarios, se migran carritos con el formato anterior, se actualiza el contador al instante y se corrigió el botón `+` (antes agregaba un producto con la cantidad incluida).
- **Carrito sin `alert()`:** se reemplazó por un aviso flotante no bloqueante.
- **Imágenes optimizadas:** `sobre-nosotros.webp` (1,8 MB → 104 KB), `mapa-delivery.webp` (1,3 MB → 120 KB), `delivery.webp` (116 KB → 72 KB) y `logo.webp` (88 KB → 8 KB).
- **Videos bajo demanda:** en pantallas chicas o con `prefers-reduced-motion` solo se muestra el póster; en escritorio se reproducen al entrar en pantalla. La portada móvil bajó de ~22 MB a ~238 KB.
- **Carga diferida:** imágenes de productos con `loading="lazy"` y scripts con `defer`.
- **HTML corregido:** se eliminaron etiquetas duplicadas y fuera de lugar (`<body>`, `</header>`, `<a>` sin cerrar), enlaces rotos a `contacto.html` y `stile.css`, IDs duplicados y el texto suelto al inicio de `index.html`.
- **CSS limpio:** se quitaron reglas duplicadas y propiedades inválidas (`size`, `position:block`, `flex-direction:nowrap`, `transition:0.3`), se corrigieron las rutas de los íconos sociales y se agregó diseño responsive.
- **Accesibilidad/SEO:** títulos por página, `meta description`, landmarks (`main`/`nav`), foco visible, `aria-label` y textos alternativos.
- **Formulario:** se quitó el `_next` fijo a `127.0.0.1`, se agregó asunto, campo antispam y autocompletado.

## Recomendaciones pendientes

- Comprimir los videos de la portada con `ffmpeg` (hoy pesan ~20 MB y ~11 MB). Ejemplo:

  ```bash
  ffmpeg -i "imagenes/happy-couple.mp4" -vf "scale=720:-2" -c:v libx264 -crf 28 -an imagenes/happy-couple-opt.mp4
  ffmpeg -i "imagenes/gato.mp4" -vf "scale=720:-2" -c:v libx264 -crf 28 -an imagenes/gato-opt.mp4
  ```

- El carrito es local (localStorage): no procesa pagos ni reserva stock. Para una tienda real conviene integrar una pasarela de pago y validar precios en el servidor.
- Archivos sin uso que se pueden eliminar: `productos/productos.css`, `imagenes/Collage.png`, `imagenes/dogs-4688586_1280.jpg`, `imagenes/descarga*.jpg`, `imagenes/huellas-...avif`, `imagenes/alimentos-perro-light.webp`, `imagenes/icons8-whatsapp.gif`.
