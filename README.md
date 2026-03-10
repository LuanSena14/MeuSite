# BodyLog — Guia de Entendimento do Projeto

> Objetivo deste documento: te dar autonomia para criar, modificar e entender qualquer parte da aplicação sem depender de IA.

---

## Índice
exercises
1. [O que é o BodyLog?](#1-o-que-é-o-bodylog)
2. [Visão geral da arquitetura](#2-visão-geral-da-arquitetura)
3. [Estrutura de arquivos](#3-estrutura-de-arquivos)
4. [Como funciona o Frontend](#4-como-funciona-o-frontend)
5. [Como funciona o Backend](#5-como-funciona-o-backend)
6. [Fluxo de dados completo (ponta a ponta)](#6-fluxo-de-dados-completo-ponta-a-ponta)
7. [Como criar uma nova tela (passo a passo)](#7-como-criar-uma-nova-tela-passo-a-passo)
8. [Padrões e convenções do projeto](#8-padrões-e-convenções-do-projeto)
9. [Variáveis CSS e design tokens](#9-variáveis-css-e-design-tokens)
10. [Dicas de debug](#10-dicas-de-debug)

---

## 1. O que é o BodyLog?

BodyLog é um app pessoal de acompanhamento com três seções:

| Seção | O que faz |
|---|---|
| **Body** | Registra e visualiza métricas corporais (peso, gordura, músculo, FFMI, etc.) via check-ins periódicos |
| **Exercises** | Registra treinos (grupo muscular, exercício, duração, esforço) e mostra dashboards com frequência, distribuição e histórico |
| **Finances** | Placeholder — ainda não implementado |

---

## 2. Visão geral da arquitetura

```
┌─────────────────────────────┐        HTTPS         ┌──────────────────────────────┐
│        FRONTEND             │ ──────────────────► │         BACKEND              │
│   HTML + CSS + JS puro      │                      │   Python + FastAPI           │
│   Sem framework (Vanilla)   │ ◄────────────────── │   PostgreSQL (Render.com)    │
│   Hospedado localmente      │        JSON          │   Hospedado em Render.com    │
└─────────────────────────────┘                      └──────────────────────────────┘
```

**Por que Vanilla JS?**
Sem build step, sem npm, sem bundler. Você abre o `index.html` no browser e funciona. Ótimo para aprender porque você vê exatamente o que acontece.

**Por que FastAPI?**
API REST simples. Cada rota é uma função Python. Fácil de ler, fácil de adicionar rotas.

---

## 3. Estrutura de arquivos

```
MeuSite/
├── README.md                  ← este arquivo
├── bodylog.sql                ← script para recriar o banco do zero
│
├── backend/
│   ├── database.py            ← conecta ao PostgreSQL via variável de ambiente
│   ├── models.py              ← define as tabelas (SQLAlchemy ORM)
│   ├── main.py                ← rotas da API (FastAPI)
│   └── requirements.txt       ← dependências Python
│
└── FrontEnd/
    ├── index.html             ← ÚNICO arquivo HTML — esqueleto da aplicação
    ├── style.css              ← TODOS os estilos
    │
    ├── sections/              ← cada seção é um fragmento HTML carregado sob demanda
    │   ├── body.html          ← KPIs + gráficos de métricas corporais
    │   ├── exercises.html     ← KPIs + gráficos de treinos
    │   └── finances.html      ← placeholder
    │
    ├── modals/                ← modais carregados sob demanda
    │   ├── checkin-modal.html ← formulário de novo check-in
    │   └── exercise-modal.html← formulário de novo treino
    │
    └── js/
        ├── nav.js             ← NAVEGAÇÃO: troca de seções, sidebar, filtros
        ├── api.js             ← DADOS: todas as chamadas ao backend ficam aqui
        ├── app.js             ← INIT: carrega HTML, inicializa seções, modais, toast
        ├── checkin.js         ← FORMULÁRIO: submit do check-in
        ├── dashboard.js       ← RENDERIZAÇÃO: gráficos e KPIs da seção Body
        └── exercicios.js      ← RENDERIZAÇÃO: gráficos e KPIs da seção Exercises
```

**Regra de ouro dos arquivos JS:**

| Arquivo | Responsabilidade única |
|---|---|
| `nav.js` | Sabe *onde* o usuário está e *troca* de lugar |
| `api.js` | Sabe *como falar* com o backend |
| `app.js` | Sabe *o que carregar* quando a seção muda |
| `dashboard.js` | Sabe *como desenhar* o dashboard Body |
| `exercicios.js` | Sabe *como desenhar* o dashboard Exercises |
| `checkin.js` | Sabe *como enviar* o formulário de check-in |

---

## 4. Como funciona o Frontend

### 4.1 O shell: `index.html`

O `index.html` **nunca muda de página**. Ele é o esqueleto permanente que fica na tela o tempo todo. Nele estão:

- A **sidebar** com os botões de navegação
- O **topbar** (barra superior com hamburger no mobile)
- A barra de **filtros** de exercícios (colapsável)
- Os **containers de seção** — `<section id="section-body">`, etc. — que começam **vazios**
- Os **containers de modal** — que também começam vazios
- Os **toasts** de sucesso/erro

```html
<!-- As seções existem no DOM, mas estão vazias e invisíveis -->
<section class="section active" id="section-body"></section>
<section class="section"        id="section-finances"></section>
<section class="section"        id="section-exercises"></section>
```

O conteúdo dessas seções é **injetado via JavaScript** quando o usuário navega pela primeira vez. Isso se chama **lazy loading** — só carrega quando precisa.

### 4.2 Navegação: `nav.js`

Este é o cérebro da navegação. Contém:

**`DEFAULT_SECTION`** — a única fonte de verdade sobre qual seção abre por padrão:
```js
const DEFAULT_SECTION = 'body'
```

**`SECTION_META`** — dicionário com tudo que cada seção precisa exibir:
```js
const SECTION_META = {
  body:      { title: 'Body metrics',      action: { label: 'Novo check-in', fn: 'openModal()' },   filters: false },
  exercises: { title: 'Exercises tracker', action: { label: 'Novo treino',   fn: 'openExModal()' }, filters: true  },
  finances:  { title: 'Finances overview', action: null,                                              filters: false },
}
```

**`switchSection(name)`** — função principal chamada pelos botões da sidebar. Ela:
1. Marca a seção como ativa no DOM (`.active`)
2. Atualiza o item destacado na sidebar
3. Atualiza o título e botão de ação no topbar
4. Mostra/esconde o botão de filtros
5. Fecha filtros se a nova seção não tiver
6. Fecha a sidebar mobile
7. **Dispara um `CustomEvent('sectionchange')`** que o `app.js` escuta

```
Usuário clica em "Exercises"
        ↓
switchSection('exercises')       ← nav.js
        ↓
dispatchEvent('sectionchange')   ← nav.js avisa o resto do app
        ↓
app.js ouve o evento e carrega exercises.html + inicializa dados
```

### 4.3 Carregamento e init: `app.js`

**`loadHTML(file, targetId)`** — busca um arquivo HTML e injeta dentro de um elemento:
```js
async function loadHTML(file, targetId) {
  const response = await fetch(file + '?v=3', { cache: 'no-cache' })
  const html = await response.text()
  document.getElementById(targetId).innerHTML = html
}
```
> O `?v=3` é um **cache buster** — força o browser a baixar sempre a versão mais recente.

**`loadedSections`** — Set que guarda quais seções já foram carregadas. Evita baixar o mesmo HTML duas vezes:
```js
const loadedSections = new Set()

window.addEventListener('sectionchange', async e => {
  const section = e.detail.section
  if (!loadedSections.has(section)) {        // só carrega se ainda não carregou
    await loadHTML(SECTIONS[section], 'section-' + section)
    loadedSections.add(section)
  }
  if (section === 'body')      renderDash()
  if (section === 'exercises') initExSection()
})
```

**`init()`** — executado uma vez ao abrir o app:
1. Carrega o HTML da seção padrão (`body`) e o modal de check-in em paralelo
2. Busca os dados do backend (`fetchCheckins`, `fetchMedidas`)
3. Renderiza o dashboard
4. Inicia o carregamento de exercises em background (não bloqueia a tela)

### 4.4 API: `api.js`

Centraliza **todas** as chamadas HTTP. Se o endereço do backend mudar, você muda em um só lugar.

```js
const API = "https://meusite-3.onrender.com"
```

Cada função é `async` e retorna dados como objeto JavaScript (`.json()`):

| Função | Método | Endpoint | O que retorna |
|---|---|---|---|
| `fetchCheckins()` | GET | `/api/checkins` | Array de check-ins por data |
| `fetchMedidas()` | GET | `/api/medidas` | Árvore de grupos e métricas |
| `postCheckin(date, medidas)` | POST | `/api/checkins` | `{ok: true}` |
| `fetchCodigosExercicio()` | GET | `/api/exercicios/codigos` | Árvore de grupos e exercícios |
| `fetchExercicios()` | GET | `/api/exercicios` | Array de treinos |
| `postExercise(entry)` | POST | `/api/exercicios` | `{ok: true}` |

### 4.5 Dashboard Body: `dashboard.js`

Variáveis globais que ficam na memória durante a sessão:
```js
let entries = []   // todos os check-ins
let medidas = []   // árvore de grupos/métricas
```

Funções de cálculo independentes (não mexem no DOM, só calculam):
- `calcIMC(peso, altura)` → número
- `calcGorduraDobras(entry)` → número (fórmula de dobras cutâneas)
- `calcFFMI(peso, gorduraPct, altura)` → número
- `resolveGorduraPct(entry)` → tenta várias fontes de dado para achar % gordura

`renderDash()` — lê os `entries` e atualiza todos os elementos do DOM em `body.html`:
- KPIs (`#kpi-peso`, `#kpi-gordura`, etc.)
- Gráficos Chart.js (`#chart-peso`, `#chart-composicao`, `#chart-metrica`)
- Tabela de histórico

### 4.6 Exercícios: `exercicios.js`

Mesma estrutura do `dashboard.js`, mas com dois recursos extras:

**Cross-filtering** — clicar num gráfico filtra o outro:
```js
const exCross = { mes: null, grupo: null }
// clicar numa barra de "outubro" filtra a rosca para mostrar só outubro
```

**Drill-down** — clicar abre um nível mais detalhado:
```js
const exDrill = {
  barMode:   'mes',   // modo normal: barras por mês
  barMes:    null,    // quando não-null, mostra os dias DAQUELE mês
  roscaMode: 'grupo', // modo normal: fatias por grupo muscular
  roscaGrupo: null,   // quando não-null, mostra exercícios DAQUELE grupo
}
```

### 4.7 Estilos: `style.css`

Um único arquivo organizado em seções com comentários:

```
:root { ... }           ← variáveis CSS (design tokens)
* { ... }               ← reset global
body { ... }            ← layout base (display:flex)
#sidebar { ... }        ← sidebar fixa
#app-wrapper { ... }    ← área de conteúdo (margem esquerda = largura da sidebar)
#topbar { ... }         ← barra superior
#ex-filters-bar { ... } ← barra de filtros colapsável
.section { ... }        ← seções de conteúdo
.kpi-card { ... }       ← cards de KPI
.chart-card { ... }     ← cards de gráfico
.modal { ... }          ← modais
@media (≤768px) { ... } ← responsividade mobile
```

---

## 5. Como funciona o Backend

### 5.1 Banco de dados

Localizado em **PostgreSQL no Render.com**. A URL de conexão vem de uma variável de ambiente `DATABASE_URL` — nunca hardcoded por segurança.

**Tabelas:**

```
unidade_medida          ← kg, cm, mm, kcal, etc.
    id, sigla, nome

codigo_medida           ← árvore de grupos e métricas (auto-referência)
    id, descricao, cd_pai (NULL = é grupo), id_unidade

checkins                ← cada linha é UMA métrica de UM dia
    id, date, cd_medida, valor

codigo_exercicio        ← árvore de grupos e exercícios (auto-referência)
    id, descricao, cd_pai (NULL = é grupo)

entrada_exercicio       ← cada linha é UM treino
    id, data, hora, cd_exercicio, duracao, esforco
```

**Por que `codigo_medida` tem `cd_pai`?**
Para modelar hierarquia sem precisar de tabela separada. Registros com `cd_pai = NULL` são grupos (ex: "Bioimpedância"). Registros com `cd_pai = <id>` são métricas filhas (ex: "peso", "gordura").

**Por que os check-ins têm uma linha por métrica?**
Formato EAV (Entity-Attribute-Value). Em vez de uma tabela com colunas `peso`, `gordura`, `cintura`... cada número é uma linha separada. Isso permite adicionar novas métricas sem alterar o schema do banco.

### 5.2 Rotas da API

```
GET  /api/medidas              → árvore de grupos e métricas
GET  /api/checkins             → todos os check-ins agrupados por data
POST /api/checkins             → salva novo check-in (body: {date, medidas: {...}})

GET  /api/exercicios/codigos   → árvore de grupos e exercícios
GET  /api/exercicios           → todos os treinos com nome do exercício e grupo
POST /api/exercicios           → salva novo treino

GET  /health                   → verifica se a API está no ar
```

---

## 6. Fluxo de dados completo (ponta a ponta)

Exemplo: usuário abre o app e vê o peso atual.

```
1. Browser abre index.html
        ↓
2. Os scripts carregam em ordem: nav.js → api.js → checkin.js → dashboard.js → exercicios.js → app.js
   app.js chama init() automaticamente ao carregar
        ↓
3. init() faz em paralelo:
   - loadHTML('sections/body.html', 'section-body')    → injeta HTML da seção
   - loadHTML('modals/checkin-modal.html', 'modal-container')
        ↓
4. init() busca dados:
   entries = await fetchCheckins()    ← GET /api/checkins
   medidas = await fetchMedidas()     ← GET /api/medidas
        ↓
5. Backend recebe GET /api/checkins
   Faz query no PostgreSQL, agrupa por data
   Retorna JSON: [{date:"2024-01-15", peso:82.3, gordura:18.2, ...}, ...]
        ↓
6. renderDash() recebe os entries
   Pega o último entry, extrai entry.peso
   document.getElementById('kpi-peso').textContent = "82.3"
   Cria gráficos Chart.js com todos os entries
        ↓
7. Usuário vê o dashboard com seus dados
```

---

## 7. Como criar uma nova tela (passo a passo)

Vamos criar uma tela fictícia chamada **"Sleep"** para rastrear sono.

### Passo 1 — Criar o arquivo de seção HTML

Crie `FrontEnd/sections/sleep.html`:

```html
<div id="sleep-empty" class="empty-state" style="display:none">
  <div class="empty-icon">◑</div>
  <h3>Nenhum dado ainda</h3>
  <p>Adicione seu primeiro registro de sono.</p>
</div>

<div id="sleep-content">
  <div class="kpi-grid">
    <div class="kpi-card" style="--kpi-color: var(--accent)">
      <div class="kpi-label">Média de sono</div>
      <div class="kpi-value" id="sleep-kpi-media">—<span class="kpi-unit">hrs</span></div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-title">Histórico de sono</div>
    <canvas id="sleep-chart-horas" height="120"></canvas>
  </div>
</div>
```

> Use os mesmos nomes de classes (`kpi-grid`, `kpi-card`, `chart-card`) — o estilo já existe em `style.css`.
> Use um prefixo único nos IDs (`sleep-*`) para não colidir com outras seções.

### Passo 2 — Registrar no `nav.js`

```js
const SECTION_META = {
  // ... existentes ...
  sleep: { title: 'Sleep tracker', action: null, filters: false },
}
```

### Passo 3 — Registrar no `app.js`

```js
// Adicionar ao objeto SECTIONS:
const SECTIONS = {
  // ... existentes ...
  sleep: 'sections/sleep.html',
}

// Adicionar ao listener sectionchange:
if (section === 'sleep') initSleepSection()
```

### Passo 4 — Adicionar botão na sidebar (`index.html`)

Dentro de `<nav class="sidebar-nav">`:
```html
<button class="sidebar-item" data-section="sleep" data-label="Sleep" onclick="switchSection('sleep')">
  <span class="sidebar-item-icon">◑</span>
  <span class="sidebar-item-label">Sleep</span>
</button>
```

### Passo 5 — Adicionar container da seção (`index.html`)

Dentro de `<div id="main-content">`:
```html
<section class="section" id="section-sleep"></section>
```

### Passo 6 — Criar função na API (`api.js`)

```js
async function fetchSleep() {
  const response = await fetch(`${API}/api/sleep`)
  if (!response.ok) throw new Error(`Erro: ${response.status}`)
  return response.json()
}
```

### Passo 7 — Criar arquivo de renderização (`js/sleep.js`)

```js
let sleepData = []

async function initSleepSection() {
  try { sleepData = await fetchSleep() }
  catch (err) { sleepData = [] }
  renderSleepDash()
}

function renderSleepDash() {
  const empty   = document.getElementById('sleep-empty')
  const content = document.getElementById('sleep-content')

  if (sleepData.length === 0) {
    empty.style.display   = ''
    content.style.display = 'none'
    return
  }
  empty.style.display   = 'none'
  content.style.display = ''
  // atualiza KPIs e gráficos...
}
```

### Passo 8 — Incluir o script no `index.html`

```html
<script src="js/sleep.js"></script>  <!-- antes de app.js -->
<script src="js/app.js"></script>    <!-- sempre por último -->
```

### Passo 9 — Criar rota no backend (`main.py`)

```python
@app.get("/api/sleep")
def get_sleep():
    # query no banco e retorna lista
    return [{"date": "2024-01-15", "horas": 7.5}]
```

### Checklist resumido

- [ ] `sections/sleep.html` — HTML com IDs únicos (prefixo `sleep-*`)
- [ ] `nav.js` → `SECTION_META` — titulo, ação, filters
- [ ] `app.js` → `SECTIONS` — caminho do arquivo HTML
- [ ] `app.js` → listener `sectionchange` — chama `initSleepSection()`
- [ ] `index.html` → sidebar — novo botão `<button class="sidebar-item">`
- [ ] `index.html` → `#main-content` — novo `<section id="section-sleep">`
- [ ] `index.html` → scripts — `<script src="js/sleep.js">` (antes de `app.js`)
- [ ] `api.js` — funções de fetch para a nova seção
- [ ] `js/sleep.js` — `initSleepSection()` + `renderSleepDash()`
- [ ] `main.py` — rotas GET e POST (se precisar salvar dados)
- [ ] `models.py` + `bodylog.sql` — tabelas novas (se precisar)

---

## 8. Padrões e convenções do projeto

### Nomenclatura de IDs no HTML

| Prefixo | Seção |
|---|---|
| `kpi-*` | Componentes da seção Body |
| `ex-*` | Componentes da seção Exercises |
| `section-*` | Containers de seção no shell |
| `modal-*` | Elementos de modal |

Ao criar nova seção, use um prefixo único para evitar conflitos.

### Variáveis globais JS

Os dados principais ficam em variáveis globais (sem módulos ES6):
```js
let entries = []         // dashboard.js — check-ins de body
let medidas = []         // dashboard.js — estrutura de medidas
window.exercicios = []   // exercicios.js
window.codigosEx  = []   // exercicios.js
```

Isso funciona porque todos os scripts compartilham o mesmo `window`. É a forma mais simples sem bundler.

### Comunicação entre módulos

Os scripts se comunicam via **CustomEvent** — isso mantém `nav.js` desacoplado de `app.js`:
```js
// nav.js dispara (produtor)
window.dispatchEvent(new CustomEvent('sectionchange', { detail: { section: 'exercises' } }))

// app.js escuta (consumidor)
window.addEventListener('sectionchange', async e => { ... })
```

### Ordem dos scripts no `index.html`

A ordem importa porque não há módulos:
```html
<script src="js/nav.js"></script>       <!-- 1. navegação (funções usadas pelo HTML inline) -->
<script src="js/api.js"></script>       <!-- 2. API (usada por todos) -->
<script src="js/checkin.js"></script>   <!-- 3. formulário -->
<script src="js/dashboard.js"></script> <!-- 4. renderização body -->
<script src="js/exercicios.js"></script><!-- 5. renderização exercises -->
<script src="js/app.js"></script>       <!-- 6. SEMPRE POR ÚLTIMO — usa tudo que veio antes -->
```

---

## 9. Variáveis CSS e design tokens

Definidas em `:root` em `style.css`. Use sempre variáveis, nunca valores hardcoded:

```css
:root {
  --bg:          #0d0f0e;   /* fundo principal (quase preto) */
  --surface:     #141716;   /* fundo de cards e sidebar */
  --surface2:    #1c1f1d;   /* fundo de inputs e elementos secundários */
  --border:      #2a2e2c;   /* bordas */
  --accent:      #b5f542;   /* verde lima — ações principais */
  --accent2:     #42f5b5;   /* verde água — KPI secundário */
  --accent3:     #f5a742;   /* laranja — KPI terciário */
  --text:        #e8ede9;   /* texto principal */
  --text-muted:  #6b7570;   /* texto desabilitado/placeholder */
  --text-dim:    #9aa39d;   /* texto secundário */
  --danger:      #f55a42;   /* vermelho — erros */
  --card-radius: 16px;      /* raio padrão de bordas arredondadas */
}
```

**Exemplo de uso ao criar um novo componente:**
```css
.meu-componente {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--card-radius);
}
```

**Fontes disponíveis:**
- `'DM Sans', sans-serif` — fonte padrão do corpo
- `'DM Mono', monospace` — números, valores, labels de dados
- `'DM Serif Display', serif` — títulos decorativos (logo)

---

## 10. Dicas de debug

**API não responde / erro CORS:**
1. Verifique se o backend está ativo: acesse `https://meusite-3.onrender.com/health` no browser
2. O Render.com "dorme" serviços gratuitos — pode demorar ~30s para acordar na primeira requisição

**Seção não atualiza após editar o HTML:**
- O `loadHTML` usa `?v=3` como cache buster. Se não aparecer, incremente: `?v=4`
- Ou force hard-refresh: `Ctrl+Shift+R`

**Gráfico não aparece:**
- Abra DevTools (`F12`) → Console → veja os erros
- Verifique se o `<canvas id="...">` existe no DOM no momento do render
- Chart.js não renderiza em containers com `display:none`

**Dado não aparece no KPI:**
- `console.log(entries)` no início de `renderDash()` para ver o que veio da API
- Verifique se o nome do campo bate exatamente (ex: `entry.peso` não é igual a `entry.Peso`)

**Adicionei uma seção mas não aparece:**
- Verifique se o `<section>` tem `class="section"` e `id="section-NOME"` com o nome exato
- Verifique se `SECTIONS` em `app.js` tem a mesma chave
- Verifique se `SECTION_META` em `nav.js` tem a mesma chave
- Verifique se o `<button>` na sidebar tem `data-section="NOME"` com o nome exato

---

*Última atualização: março de 2026*
    ├── dashboard.js        ← não muda
    └── app.js              ← atualizado