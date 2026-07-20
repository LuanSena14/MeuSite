# 2. Documentação de Arquitetura - BodyLog

## 🏗️ Visão Geral da Arquitetura

BodyLog é uma aplicação **front-end only**: não existe mais um servidor de aplicação (backend) próprio. O navegador fala **diretamente** com o Supabase (banco Postgres + API REST autogerada), usando a biblioteca `supabase-js`.

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                          │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  FrontEnd: HTML + CSS + JavaScript (SPA - Single Page App)  │  │
│  │  ├── index.html (estrutura base)                            │  │
│  │  ├── pages/* (Body, Exercises, Goals, Finances, Home)       │  │
│  │  └── shared/* (CSS, JS helpers, componentes)                │  │
│  │      ├── supabase-client.js → cria o cliente supabase-js    │  │
│  │      └── api.js              → todas as queries ao Supabase │  │
│  └────────────────┬──────────────────────────────────────────┘  │
│                   │ HTTPS (REST autogerado pelo PostgREST)       │
│                   │ supabase-js / fetch                          │
└───────────────────┼────────────────────────────────────────────┘
                    │ ☁ INTERNET ☁
┌───────────────────┼────────────────────────────────────────────┐
│                   ↓                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    SUPABASE (Cloud)                          │  │
│  │  ├── Postgres (tabelas + Row Level Security)                │  │
│  │  ├── PostgREST (API REST autogerada a partir do schema)     │  │
│  │  └── Auth / chaves de API (anon/publishable, service_role)  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

Exceção: a seção Goals não usa Supabase — é um <iframe> que embute um
app externo (MakeIt, hospedado separadamente). Veja 09-PAGE-GOALS.md.
```

---

## 🌐 Componentes

### Frontend (Browser)
- **Localização:** máquina do usuário (navegador)
- **Tecnologia:** HTML, CSS, JavaScript vanilla (sem frameworks, sem build step)
- **Arquivo raiz:** `index.html`
- **Responsabilidade:** interface, validação local, todas as queries de dados (via `supabase-js`), renderização

### Supabase (Postgres + API REST)
- **Localização:** projeto hospedado na nuvem da Supabase
- **O que é:** Postgres gerenciado + PostgREST, que expõe cada tabela como um endpoint REST automaticamente (não existe código de rota escrito à mão)
- **Segurança:** Row Level Security (RLS) — cada tabela tem uma policy que decide o que a chave `anon`/`publishable` pode ler/gravar
- **Responsabilidade:** armazenamento persistente + controle de acesso (RLS) + validações de schema (constraints, FKs)

### Não existe mais
- ❌ Servidor Python/FastAPI (`backend/` foi removido do projeto)
- ❌ ORM (SQLAlchemy) — as queries são feitas via `supabase-js` (`sb.from('tabela').select(...)`)
- ❌ Camada de validação server-side própria — quem valida é o Postgres (constraints/FKs) e, superficialmente, o próprio `api.js` antes de enviar

---

## 🔄 Fluxo Completo de uma Ação (Exemplo Real)

### Cenário: Usuário faz um check-in de peso

**PASSO 1: Página carrega**
```
URL no Browser: index.html (hospedado como site estático)
                         ↓
index.html carrega: <script src=".../supabase-js@2">  (CDN)
                    <script src="shared/js/supabase-client.js">  (cria `sb`)
                    <script src="shared/js/nav.js">
                    <script src="shared/js/api.js">
                    <script src="shared/js/app.js">
                         ↓
app.js executa: init() → loadHTML('pages/home/home.html', 'section-home')
                         ↓
Home section carrega (por padrão)
```

**PASSO 2: Usuário navega para Body**
```
Usuário clica: <button onclick="switchSection('body')">
                         ↓
nav.js executa: switchSection('body')
                         ↓
Dispara evento: window.dispatchEvent(new CustomEvent('sectionchange', {detail: {section: 'body'}}))
                         ↓
app.js escuta o evento sectionchange
                         ↓
Se body não carregou ainda:
  loadHTML('pages/body/body.html', 'section-body')
  ensureSectionScripts('body')   → injeta body.js, checkin.js, etc.
                         ↓
initBodySection() é chamada (função em body.js)
```

**PASSO 3: Consulta ao Supabase**
```
body.js chama: fetchCheckins()
                         ↓
api.js executa:
  sb.from('checkins')
    .select('date, valor, codigo_medida!inner(descricao, cd_pai)')
    .not('codigo_medida.cd_pai', 'is', null)
    .order('date', { ascending: true })
                         ↓
supabase-js monta a requisição HTTPS (GET com querystring PostgREST)
                         ↓
║ ─ ─ ─ ─ ─ ─ │ INTERNET │ ─ ─ ─ ─ ─ ─
║
PostgREST recebe o GET, valida a policy RLS da tabela `checkins`,
executa o SELECT no Postgres e devolve JSON
║
║ ─ ─ ─ ─ ─ ─ │ INTERNET │ ─ ─ ─ ─ ─ ─
                         ↓
api.js recebe { data, error }, agrupa por data em memória (JS)
                         ↓
body.js: entries = await fetchCheckins()
         renderBodyCharts(entries)
         renderHistoricoCheckins(entries)
```

> Nota: o Supabase (PostgREST) limita cada SELECT a 1000 linhas por padrão.
> Tabelas que podem ultrapassar isso (`entrada_exercicio`, `lancamento_financeiro`)
> usam `_fetchAllPaginated()` em `api.js`, que faz `.range()` em loop até
> esgotar os dados. Qualquer nova query sobre uma tabela grande deve considerar isso.

**PASSO 4-5: Modal e salvar**
```
Usuário preenche o modal de check-in e clica "Salvar"
                         ↓
checkin.js chama: postCheckin(date, medidas)
                         ↓
api.js:
  1. busca o mapa {descricao → id} em codigo_medida (só folhas, cd_pai != null)
  2. monta um array de linhas { date, cd_medida, valor }
  3. sb.from('checkins').insert(rows)
                         ↓
║ ─ ─ ─ ─ ─ ─ │ INTERNET │ ─ ─ ─ ─ ─ ─
║
PostgREST valida a policy RLS de INSERT, Postgres executa o INSERT
║
║ ─ ─ ─ ─ ─ ─ │ INTERNET │ ─ ─ ─ ─ ─ ─
                         ↓
checkin.js:
  showAppToast('✓ Check-in salvo com sucesso!')
  closeModal()
  entries = await fetchCheckins()   // recarrega
  renderBodyCharts(entries)
```

---

## 🎯 Padrões Arquiteturais Utilizados

### 1. Single Page Application (SPA)
Igual antes: um único `index.html`, seções carregadas dinamicamente via `loadHTML()`/`ensureSectionScripts()` em `shared/js/app.js`. Nada mudou aqui.

### 2. Backend-as-a-Service (BaaS) via Supabase
Em vez de escrever rotas HTTP e um ORM, o schema do Postgres (`supabase/schema.sql`) já *é* a API: toda tabela vira automaticamente um endpoint REST (PostgREST), e o controle de acesso é feito com **Row Level Security** (policies SQL), não com código de validação em uma camada de aplicação.

```sql
-- supabase/schema.sql (trecho)
create table checkins (
  id        integer generated always as identity primary key,
  date      date not null,
  cd_medida integer not null references codigo_medida(id),
  valor     float not null
);

alter table checkins enable row level security;
create policy "public_full_access" on checkins
  for all to anon, authenticated using (true) with check (true);
```

Isso é aceitável aqui porque é um app **pessoal**, sem login — a chave `anon`/`publishable` fica exposta no frontend por design (é assim que o Supabase funciona no client-side), e a policy libera tudo. Se algum dia precisar de multiusuário, a policy precisa mudar para checar `auth.uid()`.

### 3. Client-side query layer (`shared/js/api.js`)
`api.js` concentra **toda** a lógica que antes vivia no backend Python: junção de tabelas (via `select` aninhado do PostgREST), agregações (somas, hierarquia de categorias), e regras de negócio como o cálculo de rendimento de investimentos. Isso é só JavaScript rodando no navegador — não há mais "servidor" nenhum aplicando essas regras.

```javascript
// Exemplo real de shared/js/api.js
async function fetchLancamentos() {
  const lookup = await _fetchAllCodigoFinanca()
  const data = await _fetchAllPaginated(() => sb
    .from('lancamento_financeiro')
    .select('id, data, cd_financa, valor, descricao, forma_pagamento')
    .order('data', { ascending: false })
  )
  return data.map(l => {
    const cat = lookup.get(l.cd_financa)
    const pai = cat && cat.cd_pai != null ? lookup.get(cat.cd_pai) : null
    return {
      id: l.id, data: l.data, cd_financa: l.cd_financa,
      categoria_nome: cat ? cat.nome : '',
      grupo_nome: pai ? pai.nome : (cat ? cat.nome : ''),
      tipo: _deriveTipo(l.cd_financa, lookup),
      valor: l.valor, descricao: l.descricao, forma_pagamento: l.forma_pagamento,
    }
  })
}
```

### 4. Iframe mask (Goals)
A seção Goals não segue o padrão acima: ela não tem dados próprios no Supabase (as tabelas de goals foram removidas de propósito). Em vez disso, `pages/goals/goals.html` é só:

```html
<div id="goals-mask">
  <iframe id="goals-mask-frame" src="https://make-it-nine-delta.vercel.app/app.html"></iframe>
</div>
```

O app externo (MakeIt) tem seu **próprio** projeto Supabase, independente do BodyLog. Do ponto de vista do BodyLog, é uma "máscara" — a sidebar/navegação são do BodyLog, o conteúdo é 100% do outro app.

### 5. Component-Based CSS
Sem mudanças: BEM, tokens em `tokens.css`, arquivos por página.

---

## 🗂️ Estrutura de Pastas Detalhada

```
MeuSite/
├── supabase/
│   └── schema.sql          ← DDL das tabelas + policies RLS (fonte da verdade do schema)
│
├── FrontEnd/
│   ├── index.html           ← Arquivo HTML único (SPA)
│   ├── style.css
│   │
│   ├── shared/
│   │   ├── js/
│   │   │   ├── supabase-client.js  ← cria `sb` (cliente supabase-js), URL + chave anon
│   │   │   ├── nav.js              ← Navegação (switchSection)
│   │   │   ├── api.js              ← TODA a lógica de dados (era o backend)
│   │   │   └── app.js              ← Inicialização, loadHTML, cache por seção
│   │   │
│   │   └── css/
│   │       ├── app.css
│   │       ├── polish.css
│   │       └── base/
│   │           ├── shared.css
│   │           ├── shell.css
│   │           └── tokens.css
│   │
│   └── pages/
│       ├── home/            ← Overview
│       ├── body/            ← Métricas corporais
│       ├── exercises/       ← Treinos
│       ├── goals/           ← iframe mask (MakeIt)
│       └── finances/        ← Financeiro (maior módulo)
│
├── docs/                    ← esta documentação
└── start-local.ps1          ← sobe um servidor estático (python -m http.server) pro FrontEnd/
```

> `backend/`, `migrate_db.py` e `bodylog.sql` existiram no passado e foram removidos —
> não há mais nenhum código de servidor no repositório.

---

## 🔗 Relacionamentos entre Camadas

### Como Frontend consulta o Supabase

```javascript
// FRONTEND CODE (JavaScript) — shared/js/supabase-client.js
const sb = supabase.createClient(
  'https://jgqzclewwxmgjlqpxejc.supabase.co',
  'sb_publishable_...'   // chave anon/publishable, ok expor no client
)

// shared/js/api.js
async function postExercise(entry) {
  const { error } = await sb.from('entrada_exercicio').insert({
    data: entry.date,
    hora: entry.hora,
    cd_exercicio: entry.cd_exercicio,
    duracao: entry.duracao ?? null,
    esforco: entry.esforco ?? null,
  })
  _throwIfError(error)
  return { ok: true }
}
```

### Como o Postgres garante integridade

```sql
-- supabase/schema.sql
create table entrada_exercicio (
  id           integer generated always as identity primary key,
  data         date not null,
  hora         time not null,
  cd_exercicio integer not null references codigo_exercicio(id),
  duracao      integer,
  esforco      integer
);
```
Não existe mais "modelo Python" — o schema SQL é a única definição de estrutura de dados. Alterações de schema são feitas rodando SQL diretamente no projeto Supabase (via SQL Editor ou psql), e o arquivo `supabase/schema.sql` deve ser mantido em sincronia manualmente como registro histórico.

---

## 🧩 Responsabilidades por Camada

### Frontend (Cliente/Browser)
**Responsável por:**
- ✅ Interface do usuário
- ✅ Capturar eventos (cliques, submissão de formulário)
- ✅ Todas as consultas e regras de agregação/negócio (em `api.js`)
- ✅ Renderização de charts/gráficos
- ✅ Cache local (TTL) por seção
- ✅ Navegação entre seções (SPA)

**NÃO é responsável por:**
- ❌ Esconder segredos de verdade — a chave usada é pública por design (RLS é quem protege)

### Supabase (Postgres + PostgREST)
**Responsável por:**
- ✅ Armazenar dados persistentemente
- ✅ Integridade referencial (foreign keys, constraints)
- ✅ Controle de acesso via RLS (policies)
- ✅ Expor cada tabela como endpoint REST automaticamente

**NÃO é responsável por:**
- ❌ Lógica de negócio específica do BodyLog (isso é tudo `api.js`)
- ❌ Renderizar nada

---

## 🔐 Fluxo de Segurança

### RLS (Row Level Security) — substitui a validação de backend
```sql
alter table lancamento_financeiro enable row level security;
create policy "public_full_access" on lancamento_financeiro
  for all to anon, authenticated using (true) with check (true);
```
Como é um app pessoal sem login, a policy libera tudo pra chave anon. Isso é intencional — não é uma falha de configuração.

### PIN Protection (Finances) — inalterado
```
Usuário acessa Finances
             ↓
Sem PIN autenticado (sessionStorage.finances_ok)?
             ↓
Mostrar modal PIN (constante FINANCES_PIN em nav.js)
             ↓
Correto? → Desbloqueado para a sessão do navegador
```
Isso é só uma cortina de privacidade de UI — não é segurança de verdade (o PIN vive no código-fonte do frontend). A proteção real de dados é a RLS lá no Supabase.

### CORS
Não existe mais CORS para configurar — não há servidor próprio. O Supabase já responde com os headers corretos para chamadas vindas de qualquer origem (controlado pelas configurações do projeto Supabase, não pelo código do BodyLog).

---

## 🚀 Fluxo de Deployment

```
DESENVOLVIMENTO LOCAL
│ start-local.ps1 → python -m http.server 8080 servindo FrontEnd/
│ (sem nada pra "rodar" além do servidor estático — sem venv, sem uvicorn)
│
        ↓
│ Teste tudo localmente (aponta pro Supabase de produção, não tem "local DB")
│
        ↓
│ git commit + git push
│
        ↓
HOSPEDAGEM DO FRONTEND (estático)
│  Qualquer host de arquivos estáticos serve — GitHub Pages, Vercel,
│  Netlify, Render (static site), etc. Não precisa de runtime de servidor.
│
SUPABASE (já está sempre no ar, não tem deploy nem cold start)
│  Postgres + PostgREST gerenciados
```

Veja [13-DEPLOYMENT.md](13-DEPLOYMENT.md) para o passo a passo completo.

---

✅ **Próximo:** Veja [03-DATABASE.md](03-DATABASE.md) para entender o banco de dados em profundidade.

✅ **Depois:** Explore [04-BACKEND.md](04-BACKEND.md) para entender a camada de dados (`api.js`) que substituiu o backend.
