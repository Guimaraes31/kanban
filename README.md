# NG COMPANY

CRM com funil Kanban, gestão de leads, templates de WhatsApp e follow-ups.

## Stack

- Next.js 16 (App Router), React 19 e TypeScript
- Tailwind CSS
- Supabase Auth + Postgres com Row Level Security
- dnd-kit e Recharts

## Desenvolvimento local

Requer Node.js 20.9 ou superior e um projeto Supabase.

```bash
npm ci
copy .env.local.example .env.local
npm run dev
```

Configure em `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Execute `supabase/migrations/20260714000000_initial_schema.sql` no SQL Editor ou aplique a migration com a CLI do Supabase. A migration cria tabelas, índices, triggers e políticas RLS. Cada cadastro recebe automaticamente perfil, pipeline, etapas e templates iniciais.

## Validação

```bash
npm run lint
npm run build
```

## Deploy na Vercel

Importe o repositório, configure as duas variáveis públicas do Supabase para Production, Preview e Development e faça o deploy. Em Supabase Authentication, adicione a URL pública da Vercel às URLs permitidas.

## Banco de dados

As tabelas `profiles`, `pipelines`, `pipeline_stages`, `leads`, `lead_activities`, `message_templates` e `scheduled_messages` são isoladas por usuário através de RLS.
