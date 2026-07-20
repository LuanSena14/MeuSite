# 14. Guias Rápidos das Páginas & Recursos

## Resumo de cada página

### Home/Overview
**Arquivos:** `pages/home/home.html`, `pages/home/home.js`
**Fluxo:** `initHomeSection()` → `Promise.allSettled([fetchCheckins(), fetchExercicios(), fetchGoalsEntradas(), fetchGoalsMetas(), fetchLancamentos()...])` → `_homeRenderAll()`. Card de Goals sempre vazio hoje (ver [09-PAGE-GOALS.md](09-PAGE-GOALS.md)).

### Body/Métricas
**Arquivos:** `pages/body/body.html`, `body.js`, `checkin.js`, `checkin-modal.html`
**Funcionalidades:** check-in (modal) → `postCheckin()` → 3 gráficos (peso, composição, métrica selecionável) + tabela de histórico.
```javascript
IMC = peso / (altura²)
% Gordura = (gordura / peso) × 100
FFMI = (peso - gordura) / (altura²)
```

### Exercises/Treinos
**Arquivos:** `pages/exercises/exercises.html`, `exercises.js`, `exercise-modal.html`
**Funcionalidades:** modal de novo treino → `postExercise()`; filtros (data, grupo, exercício); gráficos de frequência, distribuição por grupo, período do dia.

### Goals — iframe mask
**Arquivos:** `pages/goals/goals.html` (só o iframe), `goals.js` (código antigo inerte)
Não é mais um sistema próprio — embute `https://make-it-nine-delta.vercel.app/app.html`. Ver [09-PAGE-GOALS.md](09-PAGE-GOALS.md) pra detalhes e por que o código antigo ainda existe no repo.

### Finances/Financeiro
**Arquivos:** `pages/finances/finances.html`, `fin-core.js`, `fin-overview.js`, `fin-lancamentos.js`, `fin-investimentos.js`, `fin-viagens.js`, `fin-modals.js`
**Categorias hierárquicas:** `Receita → Salario, Bonus(...)` | `Despesa → Recorrente, Variavel, Pontual, Caixinha` | `Investimento → Patrimonio(...)`
**Módulos:** Overview (KPIs + validador mês + resumo do ano), Lançamentos, Investimentos (+ regras de débito), Viagens.
**PIN:** `sessionStorage.finances_ok`, validado contra `FINANCES_PIN` em `nav.js` — é só uma cortina de UI, não segurança real.

Ver [06](06-PAGE-HOME.md)–[10-PAGE-FINANCES.md](10-PAGE-FINANCES.md) para detalhe completo de cada uma.

---

## Como adicionar uma nova página/seção

Exemplo: adicionar uma seção "Meals" (Refeições), do zero, no modelo atual (Supabase direto, sem backend).

### Passo 1 — Schema no Supabase
```sql
-- Rodar no SQL Editor do projeto Supabase (ou psql)
create table codigo_refeicao (
  id   integer generated always as identity primary key,
  nome varchar not null
);

create table entrada_refeicao (
  id        integer generated always as identity primary key,
  data      date not null,
  tipo      varchar,      -- "café", "almoço", "lanche", "ceia"
  calorias  float
);

alter table codigo_refeicao enable row level security;
alter table entrada_refeicao enable row level security;
create policy "public_full_access" on codigo_refeicao for all to anon, authenticated using (true) with check (true);
create policy "public_full_access" on entrada_refeicao for all to anon, authenticated using (true) with check (true);
```
Depois, adicionar as tabelas ao [`supabase/schema.sql`](../supabase/schema.sql) como registro histórico.

### Passo 2 — Funções em `shared/js/api.js`
```javascript
async function fetchMeals() {
  const { data, error } = await sb.from('entrada_refeicao').select('*').order('data', { ascending: false })
  _throwIfError(error)
  return data
}

async function postMeal({ date, tipo, calorias }) {
  const { error } = await sb.from('entrada_refeicao').insert({ data: date, tipo, calorias })
  _throwIfError(error)
  return { ok: true }
}
```

### Passo 3 — HTML da página
```html
<!-- pages/meals/meals.html -->
<div class="page-meals">
  <h1>Refeições</h1>
  <button onclick="showMealModal()">Nova Refeição</button>
  <div id="meals-chart"></div>
  <table id="meals-table"></table>
</div>
```

### Passo 4 — JavaScript da página
```javascript
// pages/meals/meals.js
let meals = []
let chartMeals = null

async function initMealsSection(forceRefresh) {
  try {
    meals = await fetchMeals()
    renderMealsTable(meals)
    createMealsChart(meals)
  } catch (err) {
    showAppError('Erro ao carregar refeições', err)
  }
}

function renderMealsTable(data) {
  document.getElementById('meals-table').innerHTML = `
    <tr><th>Data</th><th>Tipo</th><th>Calorias</th></tr>
    ${data.map(m => `<tr><td>${m.data}</td><td>${m.tipo}</td><td>${m.calorias}</td></tr>`).join('')}
  `
}

function destroyMealsCharts() {
  if (chartMeals) { chartMeals.destroy(); chartMeals = null }
}
```

### Passo 5 — Registrar a seção
```javascript
// shared/js/nav.js
const SECTION_META = {
  ...
  meals: { title: 'Meals', action: { label: 'Nova refeição', fn: 'showMealModal()' }, filters: false },
}

// shared/js/app.js
const SECTIONS = { ..., meals: 'pages/meals/meals.html' }
const SECTION_SCRIPTS = { ..., meals: ['pages/meals/meals.js?v=1'] }
// dentro do listener de 'sectionchange':
if (section === 'meals') await initMealsSection(!_isSectionDataFresh('meals'))
```

### Passo 6 — index.html
```html
<!-- sidebar -->
<button class="sidebar-item" data-section="meals" onclick="switchSection('meals')">
  <span class="sidebar-item-icon">🍽️</span>
  <span class="sidebar-item-label">Meals</span>
</button>

<!-- área de seções -->
<section class="section" id="section-meals"></section>
```

### Passo 7 — CSS
```css
/* pages/meals/meals.css */
.page-meals { padding: var(--space-lg); }
```
E adicionar o `@import` em `shared/css/app.css`.

**Pronto!** Sem rota de backend pra escrever, sem modelo ORM — a tabela já é a "API".

---

## Fonte de dados por módulo (substitui a antiga "API Reference")

Não existem mais endpoints HTTP com rota própria — cada função abaixo é definida em `FrontEnd/shared/js/api.js` e fala direto com o Supabase.

### Body
`fetchCheckins()`, `fetchMedidas()`, `postCheckin(date, medidas)`, `patchCheckinDate(oldDate, newDate)`

### Exercises
`fetchCodigosExercicio()`, `fetchExercicios()`, `postExercise(entry)`, `patchExercicioDate(id, novaData)`

### Goals
`fetchGoalsCodigos()`, `fetchGoalsMetas()`, `fetchGoalsEntradas()`, `postGoalEntrada()` — todas neutralizadas (sempre retornam vazio/ok), ver [09-PAGE-GOALS.md](09-PAGE-GOALS.md).

### Finances
`fetchFinancasCodigos()`, `postFinancaCodigo()`, `deleteFinancaCodigo()`, `fetchLancamentos()`, `postLancamento()`, `deleteLancamento()`, `patchLancamentoDate()`, `fetchOrcamento()`, `postOrcamento()`, `deleteOrcamento()`, `fetchInvestimentos()`, `postInvestimento()`, `deleteInvestimento()`, `fetchDebitoInvestimento()`, `postDebitoInvestimento()`, `deleteDebitoInvestimento()`, `fetchViagens()`, `renameViagem()`, `unlinkViagem()`, `postIndicador()`

---

## Padrões de Código Utilizados

### JavaScript
```javascript
// 1. Query Supabase + tratamento de erro
const { data, error } = await sb.from('tabela').select('*')
if (error) throw new Error(error.message)

// 2. Async/Await em toda função de api.js
async function fetchX() { ... }

// 3. Template literals pra render
const html = `<div>${variable}</div>`

// 4. Array methods pra transformar resultado do Supabase
data.map(x => ({ ...x, tipo: _deriveTipo(x.cd_financa, lookup) }))
```

### CSS
```css
/* BEM Naming */
.button {}
.button__label {}
.button--primary {}

/* Variables */
:root { --accent: #4ecca3; }
color: var(--accent);

/* Responsive */
@media (max-width: 768px) { ... }
```

### SQL (Supabase)
```sql
-- Toda tabela nova precisa disso:
alter table minha_tabela enable row level security;
create policy "public_full_access" on minha_tabela
  for all to anon, authenticated using (true) with check (true);
```

---

✅ **Documentação Básica Completa!**
Consulte os arquivos detalhados para mais informações.
