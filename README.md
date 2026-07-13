# LeadFlow CRM

CRM simples + funil de leads + WhatsApp automático para negócios locais (academias, clínicas, lojas).

## Funcionalidades

- **Autenticação** — Login e registro com proteção de rotas
- **Dashboard** — Métricas, gráfico de 7 dias e atividades recentes
- **Funil Kanban** — Drag and drop entre 6 etapas
- **Gestão de Leads** — CRUD completo com filtros por origem, status e tags
- **WhatsApp** — Templates prontos, copiar mensagem e abrir WhatsApp Web
- **Follow-ups** — Agendamento automático (1h, 1d, 3d)
- **Configurações** — Templates editáveis e pipeline personalizável

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (dark mode)
- Supabase (Auth + Database + Realtime)
- @dnd-kit (drag and drop)
- Recharts (gráficos)

## Início Rápido (Modo Demo)

O app funciona imediatamente sem Supabase, usando localStorage com 20 leads de demonstração da **PowerGym Academia**.

```bash
cd leadflow-crm
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

**Login demo:** `admin@powergym.com.br` / `demo123`

## Setup Supabase (Produção)

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **Settings → API** e copie a URL e anon key

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais do Supabase.

### 3. Executar o schema

No **SQL Editor** do Supabase, execute na ordem:

1. `supabase/schema.sql` — cria todas as tabelas e RLS
2. `supabase/seed.sql` — insere 20 leads (substitua o UUID do usuário)

### 4. Habilitar Auth

No Supabase Dashboard → **Authentication → Providers**, habilite Email.

## Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Importe no [vercel.com](https://vercel.com)
3. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Estrutura do Projeto

```
leadflow-crm/
├── app/
│   ├── (dashboard)/     # Rotas protegidas
│   │   ├── dashboard/
│   │   ├── kanban/
│   │   ├── leads/
│   │   ├── whatsapp/
│   │   └── settings/
│   ├── login/
│   └── register/
├── components/
│   ├── ui/              # shadcn/ui
│   ├── layout/          # Sidebar, AuthGuard
│   ├── dashboard/
│   ├── kanban/
│   └── leads/
├── lib/
│   ├── supabase/        # Cliente Supabase
│   ├── store.ts         # Data layer (localStorage)
│   └── seed.ts          # Dados demo
├── hooks/
├── types/
└── supabase/
    ├── schema.sql
    └── seed.sql
```

## Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do usuário/negócio |
| `leads` | Leads com origem, status, valor |
| `lead_activities` | Histórico de interações |
| `message_templates` | Templates de WhatsApp |
| `pipelines` | Funis de vendas |
| `pipeline_stages` | Etapas do funil |
| `scheduled_messages` | Follow-ups agendados |

## Licença

MIT