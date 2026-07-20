# 11. Stack Tecnológico - BodyLog

## 📚 Visão Geral do Stack

```
┌──────────────────────┐
│   FRONTEND           │
│ HTML / CSS / JS      │
│ Vanilla (no libs)    │
│ Chart.js + supabase-js│
└──────────────────────┘
         ↕
   [HTTPS/REST via PostgREST]
         ↕
┌──────────────────────┐
│   SUPABASE           │
│ Postgres             │
│ PostgREST (API auto) │
│ Row Level Security   │
└──────────────────────┘
```

Não existe camada de backend própria. O que antes era Python/FastAPI/SQLAlchemy virou: schema SQL + policies de RLS (do lado do banco) e funções JavaScript em `api.js` (do lado do cliente).

---

## 🎨 FRONTEND Stack

### HTML5 / CSS3
Sem mudanças: markup semântico, CSS puro (sem preprocessador), BEM, Flexbox + Grid. Arquivos em `shared/css/base/` (tokens, shell, shared) + um CSS por página, todos importados via `app.css`.

### JavaScript (ES6+, vanilla)
Sem framework, sem bundler, sem transpiler. `fetch()` continua existindo (usado por `loadHTML()` pra buscar fragmentos HTML das páginas), mas todo acesso a **dados** agora é via `supabase-js`, não `fetch()` direto pra uma API própria.

### supabase-js
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 2.x (via CDN, `@supabase/supabase-js@2`) |
| **Objetivo** | Cliente JS que fala com o Postgres via PostgREST |
| **Carregamento** | `<script>` clássico no `index.html`, antes de `api.js` |
| **Uso** | `sb.from('tabela').select()/.insert()/.update()/.delete()` |

```javascript
// shared/js/supabase-client.js
const sb = supabase.createClient(
  'https://jgqzclewwxmgjlqpxejc.supabase.co',
  'sb_publishable_...'
)
```

### Chart.js
Sem mudanças: versão 4.4.1, usado em Body/Exercises/Finances.

### Google Fonts
Sem mudanças: DM Sans, DM Serif Display, DM Mono.

---

## 🟢 SUPABASE Stack (o que substituiu o backend + database)

### Postgres
| Aspecto | Descrição |
|---------|-----------|
| **Tipo** | Banco relacional, gerenciado pelo Supabase |
| **Schema** | Definido em [`supabase/schema.sql`](../supabase/schema.sql) |
| **Migração de schema** | Manual (SQL Editor do Supabase ou conexão Postgres direta) — não há Alembic/migration tool |

### PostgREST
| Aspecto | Descrição |
|---------|-----------|
| **O que é** | Servidor que expõe automaticamente cada tabela/view do Postgres como um endpoint REST, baseado no schema (incluindo joins via foreign keys) |
| **Por que isso substitui o backend** | Não é preciso escrever rota nenhuma — criar uma tabela já cria a "API" dela |
| **Limite importante** | Cada `select` retorna no máximo 1000 linhas por padrão; paginar com `.range()` quando a tabela pode crescer além disso |

### Row Level Security (RLS)
| Aspecto | Descrição |
|---------|-----------|
| **O que é** | Policies SQL que decidem, por tabela e por operação, o que uma chave de API pode fazer |
| **Configuração atual** | Todas as tabelas do BodyLog têm uma policy única liberando tudo pra `anon`/`authenticated` (app pessoal, sem login) |
| **Por que não é uma falha de segurança** | A chave anon é pública por design em qualquer app Supabase client-side — quem protege é a RLS, não o sigilo da chave |

### Chaves de API
| Chave | Uso |
|-------|-----|
| **`sb_publishable_...` (anon)** | Usada no frontend (`supabase-client.js`), pública por design |
| **`sb_secret_...` (service_role)** | Ignora RLS — nunca deve ir pro frontend; só usada manualmente (ex.: scripts de migração de dados) |
| **Connection string do Postgres** | Usada só pra tarefas administrativas (criar tabelas, rodar migrações de dados) — não é usada pelo app em produção |

---

## 🚫 O que saiu do projeto

| Tecnologia | Papel antigo | Por quê saiu |
|---|---|---|
| Python 3.x | Linguagem do backend | Não há mais backend |
| FastAPI | Framework REST | Substituído pelo PostgREST (autogerado) |
| Uvicorn | ASGI server | Não há servidor pra rodar |
| SQLAlchemy | ORM | Substituído por `supabase-js` (queries diretas) |
| Pydantic | Validação de request | Validação agora é: constraints do Postgres + checagens simples em `api.js` |
| psycopg2 | Driver Postgres em Python | Não há mais código Python no projeto |
| python-dotenv | Carregar `.env` do backend | Não há `.env` de servidor — a config do Supabase fica direto em `supabase-client.js` |

---

## 🚀 DEPLOYMENT Stack

| Componente | Onde roda | Observação |
|------------|-----------|------------|
| **Frontend** | Qualquer host de arquivos estáticos (Render static site, Vercel, Netlify, GitHub Pages) | Sem runtime de servidor — é só HTML/CSS/JS |
| **Supabase** | Projeto na nuvem da Supabase | Sempre online, sem cold start (diferente do antigo backend no Render free tier) |

Ver [13-DEPLOYMENT.md](13-DEPLOYMENT.md) para o passo a passo.

---

## ✅ Checklist de Stack

- ✅ Frontend: HTML5 + CSS3 + ES6+ JS (vanilla)
- ✅ Gráficos: Chart.js 4.4.1
- ✅ Tipografia: Google Fonts (DM Sans/Serif/Mono)
- ✅ Dados: supabase-js 2.x → Supabase (Postgres + PostgREST + RLS)
- ✅ Deploy: hospedagem estática (frontend) + Supabase (dados), sem servidor de aplicação
- ✅ Protocol: HTTPS
- ✅ API: REST autogerada (PostgREST), sem rota escrita à mão

---

✅ **Próximo:** Veja [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md) para rodar localmente.

✅ **Depois:** Explore [13-DEPLOYMENT.md](13-DEPLOYMENT.md) para deploy em produção.
