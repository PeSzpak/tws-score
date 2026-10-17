create table public.tws_members (
  email text primary key check (email = lower(email)),
  nome text not null,
  avatar_emoji text not null default '🤍',
  user_id uuid unique references auth.users (id) on delete set null
);

create table public.tws_places (
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

create table public.tws_reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.tws_places (id) on delete cascade,
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

create table public.tws_photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.tws_places (id) on delete cascade,
  autor_id uuid not null references auth.users (id),
  storage_path text not null unique,
  criado_em timestamptz not null default now()
);
create index tws_photos_place_id_idx on public.tws_photos (place_id);

create table public.tws_wishlist (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  tipo text not null check (tipo in ('cafe', 'restaurante')),
  observacao text,
  criado_por uuid not null references auth.users (id),
  criado_em timestamptz not null default now()
);

create function public.tws_is_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tws_members
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

create function public.tws_claim_membership() returns void
language sql volatile security definer set search_path = '' as $$
  update public.tws_members
  set user_id = auth.uid()
  where email = lower(auth.jwt() ->> 'email')
    and user_id is distinct from auth.uid();
$$;

-- A policy on tws_reviews cannot count rows of tws_reviews itself: the
-- subquery would be filtered by the same policy and never see the partner's row.
create function public.tws_review_count(place uuid) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.tws_reviews where place_id = place;
$$;

create function public.tws_review_authors()
returns table (place_id uuid, autor_id uuid)
language sql stable security definer set search_path = '' as $$
  select r.place_id, r.autor_id
  from public.tws_reviews r
  where public.tws_is_member();
$$;

revoke execute on function
  public.tws_is_member(),
  public.tws_claim_membership(),
  public.tws_review_count(uuid),
  public.tws_review_authors()
from public, anon;

grant execute on function
  public.tws_is_member(),
  public.tws_claim_membership(),
  public.tws_review_count(uuid),
  public.tws_review_authors()
to authenticated;

alter table public.tws_members enable row level security;
alter table public.tws_places enable row level security;
alter table public.tws_reviews enable row level security;
alter table public.tws_photos enable row level security;
alter table public.tws_wishlist enable row level security;

create policy tws_members_select on public.tws_members
  for select to authenticated using (public.tws_is_member());

create policy tws_places_select on public.tws_places
  for select to authenticated using (public.tws_is_member());
create policy tws_places_insert on public.tws_places
  for insert to authenticated with check (public.tws_is_member() and criado_por = auth.uid());
create policy tws_places_update on public.tws_places
  for update to authenticated using (public.tws_is_member()) with check (public.tws_is_member());
create policy tws_places_delete on public.tws_places
  for delete to authenticated using (public.tws_is_member());

create policy tws_reviews_select on public.tws_reviews
  for select to authenticated using (
    public.tws_is_member()
    and (autor_id = auth.uid() or public.tws_review_count(place_id) = 2)
  );
create policy tws_reviews_insert on public.tws_reviews
  for insert to authenticated with check (public.tws_is_member() and autor_id = auth.uid());

create policy tws_photos_select on public.tws_photos
  for select to authenticated using (public.tws_is_member());
create policy tws_photos_insert on public.tws_photos
  for insert to authenticated with check (public.tws_is_member() and autor_id = auth.uid());
create policy tws_photos_delete on public.tws_photos
  for delete to authenticated using (public.tws_is_member());

create policy tws_wishlist_select on public.tws_wishlist
  for select to authenticated using (public.tws_is_member());
create policy tws_wishlist_insert on public.tws_wishlist
  for insert to authenticated with check (public.tws_is_member() and criado_por = auth.uid());
create policy tws_wishlist_update on public.tws_wishlist
  for update to authenticated using (public.tws_is_member()) with check (public.tws_is_member());
create policy tws_wishlist_delete on public.tws_wishlist
  for delete to authenticated using (public.tws_is_member());
