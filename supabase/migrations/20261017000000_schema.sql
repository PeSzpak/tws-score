create table public.members (
  email text primary key check (email = lower(email)),
  nome text not null,
  avatar_emoji text not null default '🤍',
  user_id uuid unique references auth.users (id) on delete set null
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  tipo text not null check (tipo in ('cafe', 'restaurante')),
  endereco text,
  lat double precision,
  lng double precision,
  visitado_em date not null default current_date,
  criado_por uuid not null references auth.users (id),
  criado_em timestamptz not null default now(),
  check ((lat is null) = (lng is null))
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  autor_id uuid not null references auth.users (id),
  nota_geral smallint not null check (nota_geral between 1 and 5),
  comida smallint not null check (comida between 1 and 5),
  ambiente smallint not null check (ambiente between 1 and 5),
  atendimento smallint not null check (atendimento between 1 and 5),
  preco smallint not null check (preco between 1 and 5),
  comentario text,
  criado_em timestamptz not null default now(),
  unique (place_id, autor_id)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  autor_id uuid not null references auth.users (id),
  storage_path text not null unique,
  criado_em timestamptz not null default now()
);
create index photos_place_id_idx on public.photos (place_id);

create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  tipo text not null check (tipo in ('cafe', 'restaurante')),
  observacao text,
  criado_por uuid not null references auth.users (id),
  criado_em timestamptz not null default now()
);

create function public.is_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.members
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

create function public.claim_membership() returns void
language sql volatile security definer set search_path = '' as $$
  update public.members
  set user_id = auth.uid()
  where email = lower(auth.jwt() ->> 'email')
    and user_id is distinct from auth.uid();
$$;

-- A policy on reviews cannot count rows of reviews itself: the
-- subquery would be filtered by the same policy and never see the partner's row.
create function public.review_count(place uuid) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.reviews
  where place_id = place and public.is_member();
$$;

create function public.review_authors()
returns table (place_id uuid, autor_id uuid)
language sql stable security definer set search_path = '' as $$
  select r.place_id, r.autor_id
  from public.reviews r
  where public.is_member();
$$;

revoke execute on function
  public.is_member(),
  public.claim_membership(),
  public.review_count(uuid),
  public.review_authors()
from public, anon;

grant execute on function
  public.is_member(),
  public.claim_membership(),
  public.review_count(uuid),
  public.review_authors()
to authenticated;

alter table public.members enable row level security;
alter table public.places enable row level security;
alter table public.reviews enable row level security;
alter table public.photos enable row level security;
alter table public.wishlist enable row level security;

create policy members_select on public.members
  for select to authenticated using (public.is_member());

create policy places_select on public.places
  for select to authenticated using (public.is_member());
create policy places_insert on public.places
  for insert to authenticated with check (public.is_member() and criado_por = auth.uid());
create policy places_update on public.places
  for update to authenticated using (public.is_member()) with check (public.is_member());
create policy places_delete on public.places
  for delete to authenticated using (public.is_member());

create policy reviews_select on public.reviews
  for select to authenticated using (
    public.is_member()
    and (autor_id = auth.uid() or public.review_count(place_id) = 2)
  );
create policy reviews_insert on public.reviews
  for insert to authenticated with check (public.is_member() and autor_id = auth.uid());

create policy photos_select on public.photos
  for select to authenticated using (public.is_member());
create policy photos_insert on public.photos
  for insert to authenticated with check (public.is_member() and autor_id = auth.uid());
create policy photos_delete on public.photos
  for delete to authenticated using (public.is_member());

create policy wishlist_select on public.wishlist
  for select to authenticated using (public.is_member());
create policy wishlist_insert on public.wishlist
  for insert to authenticated with check (public.is_member() and criado_por = auth.uid());
create policy wishlist_update on public.wishlist
  for update to authenticated using (public.is_member()) with check (public.is_member());
create policy wishlist_delete on public.wishlist
  for delete to authenticated using (public.is_member());
