# A Nossa Despensa

Aplicação web para controlo de stock da despensa e lista de compras alinhada ao **stock ideal**, com scanner de código de barras e dados do **Open Food Facts**.

## Stack

| Camada | Escolha | Porquê |
|--------|---------|--------|
| **Framework** | Next.js 16 (App Router) + React 19 | SSR, server actions, ótimo em iPad/telemóvel como PWA, um só projeto TypeScript. |
| **UI** | Tailwind CSS 4 | Iteração rápida, layout responsivo e “touch-first”. |
| **Base de dados** | Prisma 5 + SQLite (`prisma/dev.db`) | Zero config em desenvolvimento; o mesmo esquema migra para **PostgreSQL/Supabase** em produção. |
| **Validação** | Zod | Contratos claros nas server actions. |
| **Scanner** | html5-qrcode | Câmara no browser sem app nativa. |
| **Produto por código** | Open Food Facts API v2 | Base aberta e gratuita para nome, marca e imagem. |

## Modelo de dados

- **`Product`**: `barcode` (único, opcional), `name`, `brand`, `imageUrl`, `quantity` (stock atual), `idealStock`, `unit`, `expiryDate` (para evoluções), `category`, `notes`, timestamps.
- **`ManualShoppingItem`**: itens extra na lista (sem código de barras), com `title`, `quantity`, `unit`, `isDone`.

A lista “inteligente” de reposição é **derivada**: para cada produto com `quantity < idealStock`, a quantidade a comprar é `idealStock - quantity`. Os itens manuais vivem na tabela própria.

## Funcionalidades extra (roadmap sugerido)

- Alertas de validade (`expiryDate` já existe no modelo).
- Receitas com o que está a acabar (camada de receitas + cruzamento com stock).
- Estatísticas de consumo (histórico de movimentos — nova tabela `StockMovement`).
- Modo offline no supermercado: **PWA + cache** (manifest incluído) e, num passo seguinte, **IndexedDB** ou **Supabase** com sync.

## Desenvolvimento

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) (redireciona para `/stock`).

### Produção

Para hospedar com dados partilhados, usa PostgreSQL (por exemplo **Supabase**): altera `DATABASE_URL` no `.env` e corre `prisma migrate deploy`. O SQLite local não é adequado a ambientes serverless sem disco persistente.

## Estrutura útil

- `src/app/(main)/stock` — Controlo de stock.
- `src/app/(main)/compras` — Lista de compras (repor + manual).
- `src/app/(main)/scan` — Scanner + Open Food Facts.
- `src/actions/*` — Server actions (mutações).
- `src/lib/openfoodfacts.ts` — Integração OFF.
