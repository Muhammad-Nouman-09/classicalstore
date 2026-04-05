alter table public.products
add column if not exists short_note text,
add column if not exists show_short_note boolean not null default false;
