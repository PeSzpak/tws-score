create or replace function public.tws_review_count(place uuid) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.tws_reviews
  where place_id = place and public.tws_is_member();
$$;
