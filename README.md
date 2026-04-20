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

| Variável | Onde obter |
|----------|------------|
| **`DATABASE_URL`** | Supabase → **Project Settings** → **Database** → secção **Connection string** → modo **Direct connection** (host `db.…supabase.co`, porta **5432**). Cola a mesma variável na **Vercel** (Settings → Environment Variables) para Production (e Preview se quiseres). |

Na **Vercel**, o ficheiro `vercel.json` corre `prisma migrate deploy` antes do `next build`, para criar/atualizar tabelas — o `DATABASE_URL` tem de estar definido no painel da Vercel. Em local, `npm run build` só compila (sem ligar à BD); para migrar manualmente: `npx prisma migrate deploy` com `.env` preenchido.

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
