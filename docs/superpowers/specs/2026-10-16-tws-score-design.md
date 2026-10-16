# TWS Score — Design

**Data:** 2026-10-16
**Status:** aguardando revisão

## 1. Objetivo

PWA pessoal para o casal (Pedro e namorada) avaliar cafés e restaurantes que visitam juntos. Uso principal no celular, pelo navegador, com opção de "Adicionar à tela inicial".

**Critério de sucesso:** sair de um café, abrir o app e avaliar em menos de 1 minuto, com uma experiência calma e agradável.

**Princípio guia:** o básico que funciona. Nada que não ajude a avaliar ou relembrar.

## 2. Escopo

### Dentro
- Login por link mágico, restrito a 2 e-mails.
- Cadastro de lugar (nome, tipo café/restaurante, endereço, localização).
- Avaliação individual com **nota surpresa**: a nota do outro só é revelada quando os dois avaliaram.
- Avaliação = nota geral (1–5 corações) + 4 critérios (comida/bebida, ambiente, atendimento, preço; 1–5 cada) + comentário opcional.
- Fotos por lugar.
- Lista "Queremos ir".
- Mapa dos lugares avaliados.
- Modo claro/escuro seguindo o sistema.

### Fora (YAGNI)
- Múltiplas visitas ao mesmo lugar (1 lugar = 1 visita).
- Cadastro aberto, funções sociais, compartilhamento público.
- Notificações push, gamificação, estatísticas.
- Modo offline completo.
- Edição/remoção de avaliação já enviada.

## 3. Stack

| Camada | Escolha |
|---|---|
| Front-end | React + Vite + TypeScript, React Router |
| Estilo | CSS Modules + variáveis CSS (tokens) |
| PWA | `vite-plugin-pwa` (manifest, ícones, service worker com cache do app shell) |
| Backend | Supabase: Auth (magic link), Postgres + RLS, Storage |
| Mapa | Leaflet + OpenStreetMap (tiles em tons suaves) |
| Geocodificação | Nominatim (OpenStreetMap) para busca de endereço |
| Ícones | Lucide |
| Fontes | Fraunces (títulos), Inter (texto) |
| Testes | Vitest + Testing Library; testes SQL de RLS no Supabase local |
| Deploy | Vercel |

## 4. Telas e fluxo

Navegação inferior: **Início · [+] · Mapa · Queremos ir**.

### 4.1 Login
Campo de e-mail → envia link mágico. E-mails fora da lista recebem mensagem gentil de "acesso restrito".

### 4.2 Início (lista de lugares)
- Cards: foto de capa, nome, ícone do tipo, nota do casal (média das duas notas gerais, só quando ambas existem).
- Selo de status: "esperando você" / "esperando {nome do outro}".
- Filtro (Todos / Cafés / Restaurantes) e busca por nome.
- Estado vazio com convite para registrar o primeiro lugar.

### 4.3 Nova visita (+)
1. **Lugar:** nome, tipo, localização (GPS atual ou busca de endereço), data da visita (padrão hoje).
2. **Sua avaliação:** corações da nota geral, 4 critérios em pontinhos, comentário, fotos.
3. **Enviar:** avaliação travada.

### 4.4 Detalhe do lugar
- Galeria de fotos, data, mini-mapa, endereço.
- Dois cards lado a lado: o seu (aberto) e o do outro.
  - Antes de ambos avaliarem: card do outro fechado com coraçãozinho ("ainda não avaliou"). Se você ainda não avaliou, botão "avaliar".
  - Depois: card do outro revela com animação suave; aparece a média do casal.
- Adicionar fotos a qualquer momento.

### 4.5 Mapa
Pins para cada lugar; tocar abre mini-card que leva ao detalhe.

### 4.6 Queremos ir
Lista com nome, tipo, observação. Ação "fomos!" cria o lugar a partir do item (removendo-o da lista) e abre o passo 2 da nova visita.

## 5. Dados

```
allowed_emails  email (pk)
profiles        id (pk, = auth.users.id), nome, avatar_emoji
places          id, nome, tipo ('cafe'|'restaurante'), endereco,
                lat, lng, visitado_em (date), criado_por, criado_em
reviews         id, place_id, autor_id, nota_geral, comida, ambiente,
                atendimento, preco (smallint 1–5, check), comentario,
                criado_em; UNIQUE (place_id, autor_id)
photos          id, place_id, autor_id, storage_path, criado_em
wishlist        id, nome, tipo, observacao, criado_por, criado_em
```

## 6. Segurança e nota surpresa

- **Acesso:** trigger em `auth.users` (before insert) rejeita e-mails fora de `allowed_emails`. Todas as tabelas exigem usuário autenticado presente em `profiles`.
- **`reviews` — SELECT:** permitido se `autor_id = auth.uid()` **ou** se existem 2 avaliações para o `place_id`.
- **`reviews` — INSERT:** apenas com `autor_id = auth.uid()`.
- **`reviews` — UPDATE/DELETE:** nenhuma política → bloqueado.
- **`review_status(place_id)`:** função `security definer` que retorna apenas quais autores já avaliaram (sem notas), para os selos de status.
- **Média do casal:** calculada no cliente quando as duas avaliações estão visíveis.
- **`places`, `photos`, `wishlist`:** leitura/escrita para os dois usuários autenticados.
- **Storage:** bucket privado `photos`; leitura via URLs assinadas para usuários autenticados.

## 7. Comportamentos e erros

- Imagens comprimidas no cliente (lado maior ≤ 1600px, JPEG ~0.8) antes do upload.
- Rascunho da avaliação salvo em `localStorage` enquanto preenche; em falha de rede, mantém o rascunho e oferece "tentar de novo".
- Falha no GPS → cai para busca de endereço.
- Erros exibidos com mensagens curtas e gentis, sem jargão técnico.

## 8. Visual

- **Paleta clara:** fundo `#FAF7F2`, texto grafite suave, um destaque rosa antigo/terracota, bordas bege claro.
- **Paleta escura:** fundo `#1C1917`, mesmo destaque; segue `prefers-color-scheme`.
- Contraste WCAG AA.
- Cantos 16–20px, sombras sutis, muito respiro, uma informação de destaque por card.
- Animações curtas; a revelação da nota é o único momento especial. Respeita `prefers-reduced-motion`.
- Proibido: gradientes chamativos, excesso de badges, contadores, gamificação.

## 9. Testes

- **RLS (SQL, Supabase local):** não ler a nota do outro antes de ambos avaliarem; ler depois; não editar/apagar avaliação; e-mail fora da lista não cadastra.
- **Unitários (Vitest):** média do casal, status de espera, compressão de imagem, rascunho local.
- **Componentes (Testing Library):** formulário de avaliação, card de revelação.
- **Manual:** teste no celular (instalação PWA, fluxo completo a dois) antes do deploy.

## 10. Entrega e histórico

- Commits pequenos e separados por etapa, mensagens no padrão Conventional Commits, sem trailer de co-autoria (projeto de portfólio).
- README com descrição, prints e instruções de setup.
