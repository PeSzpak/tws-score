begin;

insert into auth.users (id, email, aud, role) values
  ('00000000-0000-4000-a000-00000000000a', 'a@tws.test', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-00000000000b', 'b@tws.test', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-a000-00000000000c', 'c@tws.test', 'authenticated', 'authenticated');

insert into public.tws_members (email, nome, avatar_emoji) values
  ('a@tws.test', 'A', '☕'),
  ('b@tws.test', 'B', '🍰');

create function pg_temp.act_as(uid uuid, mail text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'email', mail, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

select pg_temp.act_as('00000000-0000-4000-a000-00000000000a', 'a@tws.test');

do $$ begin
  insert into public.tws_places (id, nome, tipo, visitado_em, criado_por)
  values ('00000000-0000-4000-b000-000000000001', 'Café Teste', 'cafe', current_date, auth.uid());
exception when others then
  raise exception 'membro cria lugar: %', sqlerrm;
end $$;

insert into public.tws_reviews (place_id, autor_id, nota_geral, comida, ambiente, atendimento, preco)
values ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-00000000000a', 4, 4, 5, 4, 3);

select pg_temp.act_as('00000000-0000-4000-a000-00000000000b', 'b@tws.test');

do $$ begin
  if (select count(*) from public.tws_reviews where place_id = '00000000-0000-4000-b000-000000000001') <> 0 then
    raise exception 'nota do outro escondida';
  end if;
  if not exists (select 1 from public.tws_review_authors()
                 where place_id = '00000000-0000-4000-b000-000000000001'
                   and autor_id = '00000000-0000-4000-a000-00000000000a') then
    raise exception 'status sem nota';
  end if;
end $$;

insert into public.tws_reviews (place_id, autor_id, nota_geral, comida, ambiente, atendimento, preco)
values ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-00000000000b', 5, 5, 5, 5, 4);

select pg_temp.act_as('00000000-0000-4000-a000-00000000000a', 'a@tws.test');

do $$
declare n int;
begin
  if (select count(*) from public.tws_reviews where place_id = '00000000-0000-4000-b000-000000000001') <> 2 then
    raise exception 'revelada após as duas';
  end if;
  update public.tws_reviews set nota_geral = 1 where place_id = '00000000-0000-4000-b000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'avaliação travada (update)'; end if;
  delete from public.tws_reviews where place_id = '00000000-0000-4000-b000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'avaliação travada (delete)'; end if;

  perform public.tws_claim_membership();
  perform public.tws_claim_membership();
  if (select user_id from public.tws_members where email = 'a@tws.test') <> '00000000-0000-4000-a000-00000000000a' then
    raise exception 'claim idempotente';
  end if;
end $$;

select pg_temp.act_as('00000000-0000-4000-a000-00000000000c', 'c@tws.test');

do $$ begin
  if (select count(*) from public.tws_places) <> 0
     or exists (select 1 from public.tws_review_authors())
     or (select count(*) from public.tws_members) <> 0 then
    raise exception 'não membro não lê';
  end if;
  if public.tws_review_count('00000000-0000-4000-b000-000000000001') <> 0 then
    raise exception 'não membro não conta avaliações';
  end if;
  begin
    insert into public.tws_wishlist (nome, tipo, criado_por) values ('Intruso', 'cafe', auth.uid());
    raise exception 'não membro não grava';
  exception when insufficient_privilege then null;
  end;
end $$;

select 'rls ok' as result;

rollback;
