begin;

insert into auth.users (id, email, aud, role) values
  ('00000000-0000-4000-a000-00000000000a', 'a@tws.test', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-00000000000c', 'c@tws.test', 'authenticated', 'authenticated');

insert into public.tws_members (email, nome) values ('a@tws.test', 'A');

create function pg_temp.act_as(uid uuid, mail text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'email', mail, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

select pg_temp.act_as('00000000-0000-4000-a000-00000000000a', 'a@tws.test');

insert into storage.objects (bucket_id, name, owner)
values ('tws-photos', 'p/foto.jpg', '00000000-0000-4000-a000-00000000000a');

do $$ begin
  if (select count(*) from storage.objects where bucket_id = 'tws-photos') <> 1 then
    raise exception 'membro lê fotos';
  end if;
end $$;

select pg_temp.act_as('00000000-0000-4000-a000-00000000000c', 'c@tws.test');

do $$ begin
  if (select count(*) from storage.objects where bucket_id = 'tws-photos') <> 0 then
    raise exception 'não membro não lê fotos';
  end if;
end $$;

select 'storage ok' as result;

rollback;
