# TWS Score

PWA para um casal avaliar os cafés e restaurantes que visita junto. Cada pessoa avalia no próprio celular, e a nota do outro só aparece quando os dois terminam: a **nota surpresa**.

## Funcionalidades

- Login por link mágico, restrito aos dois membros.
- Nova visita em dois passos: o lugar (nome, tipo, localização, data) e a avaliação.
- Busca de lugares no Google: ao digitar o nome, escolher uma sugestão preenche tipo, endereço e localização e guarda nota, faixa de preço, horários, telefone e site do lugar.
- Avaliação com nota geral de 1 a 5 corações, quatro critérios (comida/bebida, ambiente, atendimento, preço), comentário e fotos.
- Nota surpresa: a avaliação do outro fica fechada até as duas existirem. Depois, aparece a nota do casal.
- Lista "Queremos ir", com atalho "Fomos!" que já abre a nova visita.
- Mapa com todos os lugares que têm localização.
- Instalável na tela inicial, com tema claro e escuro.

## Como a nota surpresa é garantida

A regra vive no banco, não na interface. A política de RLS de `reviews` só devolve uma avaliação a quem a escreveu, ou a qualquer membro quando o lugar já tem duas avaliações:

```sql
create policy reviews_select on public.reviews
  for select to authenticated using (
    public.is_member()
    and (autor_id = auth.uid() or public.review_count(place_id) = 2)
  );
```

Não existe política de `update` nem de `delete`, então uma avaliação enviada não muda mais. Os selos "esperando você" usam `review_authors()`, que informa só quem já avaliou, nunca a nota.

Os testes em `supabase/tests/` provam essas regras contra o banco real, dentro de uma transação desfeita no final.

## Stack

- React 19, TypeScript, Vite, React Router
- Supabase: Auth (link mágico), Postgres com RLS, Storage
- Google Places API (New) para buscar lugares
- Leaflet com OpenStreetMap
- `vite-plugin-pwa`
- Vitest e Testing Library

## Rodando localmente

Pré-requisitos: Node 20 ou mais recente e um projeto Supabase.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha a URL e a chave publicável do projeto. `VITE_GOOGLE_MAPS_KEY` é opcional: sem ela, o nome do lugar é digitado à mão. A chave precisa ter a Places API (New) ativada e ficar restrita aos domínios do app.

3. Aplique as migrações de `supabase/migrations/` em ordem, pelo SQL Editor ou pela Supabase CLI.

4. Crie as contas dos membros no Auth (Authentication > Users > Add user) e cadastre-os em `members`. Use `supabase/members.example.sql` como modelo. Deixe o cadastro de novos usuários desligado.

5. No painel do Supabase, em **Authentication > URL Configuration**, adicione `http://localhost:5173` às Redirect URLs.

6. Inicie o app:

   ```bash
   npm run dev
   ```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm test` | Testes unitários e de componentes |
| `npm run typecheck` | Checagem de tipos |
| `npm run lint` | Lint com oxlint |
| `npm run build` | Build de produção com service worker |

Para rodar os testes de RLS, execute `supabase/tests/rls_test.sql` e `supabase/tests/storage_test.sql` no banco. Cada um termina com `rollback` e não deixa dados.

## Estrutura

```
src/
  auth/        login, sessão e acesso restrito
  components/  peças de interface reutilizadas (corações, pontinhos, navegação)
  data/        acesso ao Supabase; converte linhas do banco em tipos de domínio
  features/    lógica e componentes de cada tela
  lib/         tipos de domínio e lógica pura (nota surpresa, rascunho, imagem)
  pages/       telas
supabase/
  migrations/  schema, RLS e storage
  tests/       testes das regras de acesso
```
