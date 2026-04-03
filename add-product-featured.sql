alter table public.products
add column if not exists featured boolean not null default false;
