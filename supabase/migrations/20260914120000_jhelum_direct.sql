create extension if not exists pgcrypto;

create type public.user_role as enum ('customer', 'staff', 'admin', 'driver');
create type public.fulfillment_type as enum ('pickup', 'delivery');
create type public.order_source as enum ('direct', 'uber_eats', 'doordash', 'grubhub', 'pos');
create type public.order_status as enum (
  'new', 'confirmed', 'preparing', 'ready', 'ready_for_pickup',
  'driver_assigned', 'out_for_delivery', 'picked_up', 'delivered',
  'completed', 'cancelled', 'refunded', 'failed', 'needs_attention'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  name text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  note text,
  sort_order int not null default 0
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text unique not null,
  name text not null,
  description text,
  cents int,
  unit text,
  featured boolean not null default false,
  sold_out boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.item_variants (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  label text not null,
  cents int not null,
  sort_order int not null default 0
);

create table public.modifiers (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  slug text not null,
  label text not null,
  cents int not null,
  sort_order int not null default 0,
  unique (item_id, slug)
);

create table public.cafe_settings (
  id int primary key default 1,
  address text not null,
  phone text not null,
  hours_label text not null,
  lat double precision not null,
  lng double precision not null,
  tax_bps int not null default 8875
);

create table public.delivery_rules (
  id uuid primary key default gen_random_uuid(),
  min_miles numeric not null,
  max_miles numeric not null,
  fee_cents int not null,
  label text,
  sort_order int not null default 0
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  access_token text unique not null,
  source public.order_source not null default 'direct',
  fulfillment public.fulfillment_type not null,
  status public.order_status not null default 'new',
  paid boolean not null default false,
  stripe_session_id text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  pickup_time text,
  delivery_address text,
  delivery_unit text,
  delivery_notes text,
  delivery_miles numeric,
  delivery_lat double precision,
  delivery_lng double precision,
  driver_id text,
  driver_name text,
  attribution jsonb not null default '{}'::jsonb,
  subtotal_cents int not null default 0,
  tax_bps int not null default 8875,
  tax_cents int not null default 0,
  tip_cents int not null default 0,
  delivery_fee_cents int not null default 0,
  total_cents int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_id text,
  name text not null,
  quantity int not null,
  unit_cents int not null,
  total_cents int not null,
  variant text,
  modifiers text[] not null default '{}'
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  type text not null,
  note text,
  actor text,
  created_at timestamptz not null default now()
);

create table public.delivery_offers (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create sequence if not exists public.order_number_seq start 1001;

create or replace function public.next_order_number()
returns text language sql as $$
  select 'JC-' || nextval('public.order_number_seq')::text;
$$;

create or replace function public.accept_delivery_offer(p_order_id uuid, p_driver_id text, p_driver_name text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare rec public.orders;
begin
  update public.orders
  set driver_id = p_driver_id,
      driver_name = p_driver_name,
      status = 'driver_assigned',
      updated_at = now()
  where id = p_order_id
    and driver_id is null
    and fulfillment = 'delivery'
    and status not in ('cancelled', 'delivered', 'completed', 'refunded')
  returning * into rec;
  if rec.id is null then
    raise exception 'already assigned';
  end if;
  insert into public.order_events (order_id, type, note, actor)
  values (rec.id, 'driver_assigned', coalesce(p_driver_name, 'driver') || ' accepted', 'driver');
  return rec;
end;
$$;

alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.item_variants enable row level security;
alter table public.modifiers enable row level security;
alter table public.cafe_settings enable row level security;
alter table public.delivery_rules enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.profiles enable row level security;

create policy "public read menu" on public.categories for select using (true);
create policy "public read items" on public.items for select using (true);
create policy "public read variants" on public.item_variants for select using (true);
create policy "public read modifiers" on public.modifiers for select using (true);
create policy "public read settings" on public.cafe_settings for select using (true);
create policy "public read rules" on public.delivery_rules for select using (true);
create policy "public read order by token" on public.orders for select using (true);
create policy "public read order items" on public.order_items for select using (true);
create policy "public read order events" on public.order_events for select using (true);

insert into public.cafe_settings (id, address, phone, hours_label, lat, lng, tax_bps)
values (1, '937 Coney Island Ave, Brooklyn, NY 11230', '929-234-3401', 'Open daily · 10 AM – 11 PM', 40.6324, -73.9676, 8875);

insert into public.delivery_rules (min_miles, max_miles, fee_cents, label, sort_order)
values
  (0, 5, 0, 'Free local delivery', 0),
  (5, 7, 499, 'Extended delivery', 1);
