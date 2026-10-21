-- Informações do Google Places guardadas junto do lugar (place_id, horários, telefone, site, nota).
alter table public.places add column google jsonb;
