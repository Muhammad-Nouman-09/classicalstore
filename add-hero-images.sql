create extension if not exists "uuid-ossp";

create table if not exists public.hero_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  alt_text text,
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hero_images disable row level security;

create index if not exists idx_hero_images_sort_order on public.hero_images(sort_order asc, created_at asc);
