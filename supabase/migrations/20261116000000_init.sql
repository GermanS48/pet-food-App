-- ============================================================
-- PET FOOD · esquema inicial para Supabase
-- Ejecutar en el SQL Editor del proyecto o con `supabase db push`.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Catálogo ----------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 300),
  slug text not null unique,
  category text not null check (category in ('perros', 'gatos')),
  price numeric(12, 2) not null check (price > 0),
  image_url text not null,
  external_url text,
  seller text,
  rating numeric(2, 1) check (rating is null or (rating >= 0 and rating <= 5)),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category) where active;
create index if not exists products_featured_idx on public.products (featured) where active;

-- ---------- Pedidos ----------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (length(trim(customer_name)) between 2 and 160),
  phone text not null,
  email text,
  delivery_method text not null default 'delivery'
    check (delivery_method in ('delivery', 'pickup')),
  address text,
  city text,
  notes text,
  total numeric(12, 2) not null default 0 check (total >= 0),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmado', 'entregado', 'cancelado')),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price numeric(12, 2) not null check (unit_price > 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12, 2) generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- Mensajes de contacto ----------

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

-- ---------- Row Level Security ----------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;

-- El catálogo es público (sólo productos activos).
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  to anon, authenticated
  using (active = true);

-- Los mensajes de contacto se pueden crear desde la web, pero no leer.
drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    length(trim(name)) between 2 and 160
    and length(trim(email)) between 5 and 254
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and length(trim(message)) between 10 and 3000
  );

-- Pedidos y sus ítems: sin políticas públicas.
-- Se crean exclusivamente a través de la función create_order (security definer).

-- ---------- Permisos ----------

grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;

-- ---------- Crear pedido (RPC) ----------

create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_product public.products;
  v_has_product boolean := false;
  v_item jsonb;
  v_items jsonb := payload -> 'items';
  v_customer_name text := trim(coalesce(payload ->> 'customer_name', ''));
  v_phone text := trim(coalesce(payload ->> 'phone', ''));
  v_email text := nullif(trim(coalesce(payload ->> 'email', '')), '');
  v_method text := coalesce(payload ->> 'delivery_method', 'delivery');
  v_address text := nullif(trim(coalesce(payload ->> 'address', '')), '');
  v_city text := nullif(trim(coalesce(payload ->> 'city', '')), '');
  v_notes text := nullif(trim(coalesce(payload ->> 'notes', '')), '');
  v_item_name text;
  v_item_price numeric(12, 2);
  v_quantity integer;
  v_total numeric(12, 2) := 0;
begin
  if length(v_customer_name) < 2 then
    raise exception 'El nombre es obligatorio';
  end if;

  if length(regexp_replace(v_phone, '\D', '', 'g')) < 8 then
    raise exception 'El teléfono no es válido';
  end if;

  if v_email is not null and v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'El correo electrónico no es válido';
  end if;

  if v_method not in ('delivery', 'pickup') then
    raise exception 'Método de entrega inválido';
  end if;

  if v_method = 'delivery' and (v_address is null or length(v_address) < 4) then
    raise exception 'La dirección es obligatoria';
  end if;

  if v_method = 'delivery' and (v_city is null or length(v_city) < 2) then
    raise exception 'La localidad es obligatoria';
  end if;

  if v_items is null or jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;

  if jsonb_array_length(v_items) > 50 then
    raise exception 'El pedido tiene demasiados productos';
  end if;

  insert into public.orders (
    customer_name,
    phone,
    email,
    delivery_method,
    address,
    city,
    notes,
    total,
    status
  )
  values (
    v_customer_name,
    v_phone,
    v_email,
    v_method,
    v_address,
    v_city,
    v_notes,
    0,
    'pendiente'
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(v_items)
  loop
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 0);
    if v_quantity <= 0 or v_quantity > 99 then
      raise exception 'Cantidad inválida';
    end if;

    v_has_product := false;
    if (v_item ->> 'product_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      select * into v_product
      from public.products
      where id = (v_item ->> 'product_id')::uuid
        and active = true;

      v_has_product := found;
    end if;

    if not v_has_product then
      raise exception 'Producto inválido o no disponible';
    end if;

    -- El precio y el nombre salen siempre de la base, no del cliente.
    v_item_name := v_product.name;
    v_item_price := v_product.price;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order.id, v_product.id, v_item_name, v_item_price, v_quantity);

    v_total := v_total + (v_item_price * v_quantity);
  end loop;

  update public.orders
  set total = v_total
  where id = v_order.id;

  return jsonb_build_object('order_id', v_order.id, 'total', v_total);
end;
$$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;
