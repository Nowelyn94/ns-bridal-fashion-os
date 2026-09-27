-- N's Bridal & Fashion cloud schema
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('owner','manager','staff','accountant')),
  created_at timestamptz default now()
);

create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  event_date date,
  interest text,
  preferred_contact text,
  notes text,
  status text default 'New',
  created_at timestamptz default now()
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text,
  size text,
  color text,
  location text,
  rental_price numeric default 0,
  sale_price numeric default 0,
  cost numeric default 0,
  status text default 'Available',
  photo_url text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(), name text not null, phone text, email text,
  event_date date, source text, notes text, created_at timestamptz default now()
);
create table if not exists leads (
  id uuid primary key default gen_random_uuid(), name text not null, phone text, email text, interest text,
  event_date date, stage text default 'New Inquiry', next_follow_up date, notes text, created_at timestamptz default now()
);
create table if not exists rentals (
  id uuid primary key default gen_random_uuid(), customer_name text not null, phone text, item_id uuid references inventory(id),
  item_name text, pickup_date date, return_date date, rental_amount numeric default 0, deposit numeric default 0,
  amount_paid numeric default 0, total numeric default 0, status text default 'Reserved', notes text, created_at timestamptz default now()
);
create table if not exists sales (
  id uuid primary key default gen_random_uuid(), sale_date date default current_date, customer_name text, description text,
  total numeric default 0, payment_method text, status text default 'Paid', created_at timestamptz default now()
);
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(), expense_date date default current_date, category text, description text,
  amount numeric default 0, created_at timestamptz default now()
);
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), title text not null, assignee text, due_date date,
  status text default 'To Do', notes text, created_at timestamptz default now()
);
create table if not exists team_messages (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id), name text, text text not null,
  created_at timestamptz default now()
);

alter table booking_requests enable row level security;
drop policy if exists "public can submit bookings" on booking_requests;
create policy "public can submit bookings" on booking_requests for insert to anon with check (true);
drop policy if exists "authenticated can view bookings" on booking_requests;
create policy "authenticated can view bookings" on booking_requests for select to authenticated using (true);
drop policy if exists "authenticated can update bookings" on booking_requests;
create policy "authenticated can update bookings" on booking_requests for update to authenticated using (true);

do $$ declare t text; begin
  foreach t in array array['inventory','customers','leads','rentals','sales','expenses','tasks','team_messages','profiles'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

drop policy if exists "authenticated inventory" on inventory;
create policy "authenticated inventory" on inventory for all to authenticated using (true) with check (true);
drop policy if exists "authenticated customers" on customers;
create policy "authenticated customers" on customers for all to authenticated using (true) with check (true);
drop policy if exists "authenticated leads" on leads;
create policy "authenticated leads" on leads for all to authenticated using (true) with check (true);
drop policy if exists "authenticated rentals" on rentals;
create policy "authenticated rentals" on rentals for all to authenticated using (true) with check (true);
drop policy if exists "authenticated sales" on sales;
create policy "authenticated sales" on sales for all to authenticated using (true) with check (true);
drop policy if exists "authenticated expenses" on expenses;
create policy "authenticated expenses" on expenses for all to authenticated using (true) with check (true);
drop policy if exists "authenticated tasks" on tasks;
create policy "authenticated tasks" on tasks for all to authenticated using (true) with check (true);
drop policy if exists "authenticated team messages" on team_messages;
create policy "authenticated team messages" on team_messages for all to authenticated using (true) with check (true);
drop policy if exists "own profile select" on profiles;
create policy "own profile select" on profiles for select to authenticated using (auth.uid()=id);
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);

insert into storage.buckets(id,name,public) values('inventory-images','inventory-images',true) on conflict (id) do nothing;
drop policy if exists "authenticated inventory image uploads" on storage.objects;
create policy "authenticated inventory image uploads" on storage.objects for insert to authenticated with check (bucket_id='inventory-images');
drop policy if exists "public inventory image read" on storage.objects;
create policy "public inventory image read" on storage.objects for select to public using (bucket_id='inventory-images');
