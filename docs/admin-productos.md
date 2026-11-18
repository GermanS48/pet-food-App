# Administración de productos (Supabase)

Plantilla para **cargar, modificar y borrar** productos desde la interfaz, guardando los cambios en la tabla `public.productos` de Supabase. El acceso está restringido a **usuarios permitidos**.

## 1. Base de datos (migraciones)

Ejecutá en el SQL Editor de Supabase (en orden), además de la migración inicial si aún no está aplicada:

1. `supabase/migrations/20261116000000_init.sql` (esquema base, si corresponde)
2. `supabase/migrations/20261116120000_admin_productos.sql` (tabla `usuarios_permitidos` y políticas RLS de gestión sobre `productos`)

La migración de administración crea:

- `public.usuarios_permitidos (user_id uuid primary key)` — usuarios autorizados a gestionar el catálogo.
- Políticas RLS que permiten a esos usuarios autenticados hacer `select/insert/update/delete` en `public.productos` (incluidos productos inactivos).

> La lectura pública del catálogo activo se mantiene con la política existente `productos_lectura_publica`.

## 2. Configurar un usuario permitido

1. En Supabase, creá un usuario en **Authentication → Users** (email y contraseña) o usá uno existente.
2. Copiá su `UUID` (`id` del usuario).
3. Insertalo en la tabla de permitidos:

```sql
insert into public.usuarios_permitidos (user_id)
values ('UUID_DEL_USUARIO')
on conflict (user_id) do nothing;
```

Para quitar permisos:

```sql
delete from public.usuarios_permitidos where user_id = 'UUID_DEL_USUARIO';
```

## 3. Variables de entorno

La app necesita las credenciales públicas del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Sin estas variables la app funciona en modo demo y la administración no puede conectarse a la base.

## 4. Uso desde la interfaz

- **Login:** `/#/admin/login`
- **Gestión de productos:** `/#/admin/productos` (requiere sesión iniciada y usuario permitido)

Desde la pantalla de administración se puede:

- **Crear** productos (nombre, slug, categoría, precio, imagen, estado activo/destacado, etc.).
- **Modificar** productos existentes.
- **Borrar** productos (con confirmación).
- Listar y buscar productos, incluyendo inactivos.

Si el usuario inicia sesión pero no está en `usuarios_permitidos`, verá un mensaje de acceso restringido.

## 5. Notas de seguridad

- El control de acceso real se aplica en la base de datos mediante **RLS**: aunque alguien manipule la interfaz, solo los usuarios presentes en `usuarios_permitidos` pueden escribir en `productos`.
- No expongas la `service_role` key en el frontend; la app usa únicamente la `anon key`.
- Los campos críticos para el carrito/checkout (nombre y precio del pedido) se toman de la base en `crear_pedido`; mantener precios y estado `activo` correctos en el catálogo.
