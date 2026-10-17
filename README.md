# TWS Score

PWA para um casal avaliar os cafés e restaurantes que visita junto. Cada pessoa avalia no próprio celular, e a nota do outro só aparece quando os dois terminam: a **nota surpresa**.

## Funcionalidades

- Login por link mágico, restrito aos dois membros.
- Nova visita em dois passos: o lugar (nome, tipo, localização, data) e a avaliação.
- Avaliação com nota geral de 1 a 5 corações, quatro critérios (comida/bebida, ambiente, atendimento, preço), comentário e fotos.
- Nota surpresa: a avaliação do outro fica fechada até as duas existirem. Depois, aparece a nota do casal.
- Lista "Queremos ir", com atalho "Fomos!" que já abre a nova visita.
- Mapa com todos os lugares que têm localização.
- Instalável na tela inicial, com tema claro e escuro.

## Como a nota surpresa é garantida

A regra vive no banco, não na interface. A política de RLS de `tws_reviews` só devolve uma avaliação a quem a escreveu, ou a qualquer membro quando o lugar já tem duas avaliações:

```sql
create policy tws_reviews_select on public.tws_reviews
  for select to authenticated using (
    public.tws_is_member()
    and (autor_id = auth.uid() or public.tws_review_count(place_id) = 2)
  );
```

Não existe política de `update` nem de `delete`, então uma avaliação enviada não muda mais. Os selos "esperando você" usam `tws_review_authors()`, que informa só quem já avaliou, nunca a nota.

Os testes em `supabase/tests/` provam essas regras contra o banco real, dentro de uma transação desfeita no final.

## Stack

- React 19, TypeScript, Vite, React Router
- Supabase: Auth (link mágico), Postgres com RLS, Storage
- Leaflet com OpenStreetMap e CARTO
- `vite-plugin-pwa`
- Vitest e Testing Library

## Rodando localmente

Pré-requisitos: Node 20 ou mais recente e um projeto Supabase.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha a URL e a chave publicável do projeto.

3. Aplique as migrações de `supabase/migrations/` em ordem, pelo SQL Editor ou pela Supabase CLI.

4. Cadastre os membros. Use `supabase/members.example.sql` como modelo.

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
