-- Itens da lista "Queremos ir" guardam o lugar escolhido no Google, para o "Fomos!" já vir preenchido.
alter table public.wishlist
  add column endereco text,
  add column lat double precision,
  add column lng double precision,
  add column google jsonb,
  add constraint wishlist_lat_lng_together check ((lat is null) = (lng is null));
