insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tws-photos', 'tws-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy tws_photos_objects_select on storage.objects
  for select to authenticated
  using (bucket_id = 'tws-photos' and public.tws_is_member());

create policy tws_photos_objects_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'tws-photos' and public.tws_is_member());

create policy tws_photos_objects_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'tws-photos' and public.tws_is_member());
