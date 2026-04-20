# A Nossa Despensa

Aplicação web para controlo de stock da despensa e lista de compras alinhada ao **stock ideal**, com scanner de código de barras e dados do **Open Food Facts**.

## Stack

| Camada | Escolha | Porquê |
|--------|---------|--------|
| **Framework** | Next.js 16 (App Router) + React 19 | SSR, server actions, ótimo em iPad/telemóvel como PWA. |
| **UI** | Tailwind CSS 4 | Layout responsivo e “touch-first”. |
| **Base de dados** | Prisma 5 + **PostgreSQL (Supabase)** | Dados persistentes e compatível com deploy na Vercel. |
| **Validação** | Zod | Contratos claros nas server actions. |
| **Scanner** | html5-qrcode | Câmara no browser sem app nativa. |
| **Produto por código** | Open Food Facts API v2 | Base aberta para nome, marca e imagem. |

## Variáveis de ambiente

Cria um ficheiro `.env` a partir de `.env.example`.

| Variável | Obrigatória? | Onde obter |
|----------|----------------|------------|
| **`DATABASE_URL`** | **Sim** | Supabase → **Project Settings** → **Database** → **Direct connection** (porta **5432**). Mesmo valor na **Vercel** (Production / Preview). O Prisma usa isto para aceder ao Postgres. |
| **`NEXT_PUBLIC_SUPABASE_URL`** | Não | Supabase → **Project Settings** → **API** → **Project URL**. Só é precisa se no futuro usares o cliente JavaScript (`@supabase/supabase-js`) no browser — **neste código não está em uso**. |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Não | Supabase → **Project Settings** → **API** → **anon public**. Idem: só para Auth / Storage / Realtime com o SDK oficial; **não é lida pela app actual**. |

Resumo: para a despensa tal como está, **basta `DATABASE_URL`**. As variáveis `NEXT_PUBLIC_*` são o padrão de outros projectos Supabase (cliente no cliente); aqui os dados vão sempre pelo **Prisma** no servidor.

Na **Vercel**, o `vercel.json` corre `prisma migrate deploy` antes do `next build` — o `DATABASE_URL` tem de estar definido no painel. Em local, `npm run build` só compila; para migrar: `npx prisma migrate deploy` com `.env` preenchido.

## Desenvolvimento

```bash
cp .env.example .env
# Edita .env e cola o DATABASE_URL do Supabase (ligação directa :5432)
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) (redireciona para `/stock`).

## Modelo de dados

- **`Product`**: `barcode` (único, opcional), `name`, `brand`, `imageUrl`, `quantity`, `idealStock`, `unit`, `expiryDate`, `category`, `notes`, timestamps.
- **`ManualShoppingItem`**: itens extra na lista com `title`, `quantity`, `unit`, `isDone`.

## Estrutura útil

- `src/app/(main)/stock` — Controlo de stock.
- `src/app/(main)/compras` — Lista de compras.
- `src/app/(main)/scan` — Scanner + Open Food Facts.
- `src/actions/*` — Server actions.
- `src/lib/openfoodfacts.ts` — Integração OFF.
