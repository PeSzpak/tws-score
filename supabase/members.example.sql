insert into public.tws_members (email, nome, avatar_emoji) values
  ('voce@exemplo.com', 'Você', '☕'),
  ('amor@exemplo.com', 'Amor', '🍰')
on conflict (email) do update set nome = excluded.nome, avatar_emoji = excluded.avatar_emoji;
