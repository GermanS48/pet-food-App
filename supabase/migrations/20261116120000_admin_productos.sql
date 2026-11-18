-- ============================================================
-- Administración de productos: usuarios permitidos y CRUD
-- ============================================================

-- Tabla de usuarios con permiso para gestionar el catálogo.
create table if not exists public.usuarios_permitidos (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.usuarios_permitidos enable row level security;

-- Un usuario autenticado puede saber si él mismo está permitido.
drop policy if exists "usuarios_permitidos_lectura_propia" on public.usuarios_permitidos;
create policy "usuarios_permitidos_lectura_propia"
  on public.usuarios_permitidos
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Permisos de gestión sobre productos para usuarios permitidos.
drop policy if exists "productos_admin_select" on public.productos;
create policy "productos_admin_select"
  on public.productos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios_permitidos up
      where up.user_id = auth.uid()
    )
  );

drop policy if exists "productos_admin_insert" on public.productos;
create policy "productos_admin_insert"
  on public.productos
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.usuarios_permitidos up
      where up.user_id = auth.uid()
    )
  );

drop policy if exists "productos_admin_update" on public.productos;
create policy "productos_admin_update"
  on public.productos
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios_permitidos up
      where up.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.usuarios_permitidos up
      where up.user_id = auth.uid()
    )
  );

drop policy if exists "productos_admin_delete" on public.productos;
create policy "productos_admin_delete"
  on public.productos
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios_permitidos up
      where up.user_id = auth.uid()
    )
  );

grant select on public.usuarios_permitidos to authenticated;
grant insert, update, delete on public.productos to authenticated;

-- Asegura que la secuencia de id sea utilizable por roles autenticados permitidos.
do $$
begin
  if exists (select 1 from pg_class where relname = 'productos_id_seq') then
    grant usage, select on sequence public.productos_id_seq to authenticated;
  end if;
end $$;

notify pgrst, 'reload schema';
