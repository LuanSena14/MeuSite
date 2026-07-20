# 5. Documentação Detalhada do Frontend - BodyLog

## 🎨 Visão Geral do Frontend

O frontend do BodyLog é **HTML, CSS e JavaScript vanilla** (sem frameworks, sem build step) — e agora é **o app inteiro**: não existe backend, o navegador fala direto com o Supabase.

- ✅ Sem build step (webpack, rollup, etc.)
- ✅ Sem dependências npm
- ✅ Fácil abrir e debugar (nenhuma abstração de framework)

### Stack Frontend
- **HTML5 / CSS3 / JavaScript (ES6+)** vanilla
- **supabase-js** (CDN) — cliente que fala com o Supabase
- **Chart.js** — gráficos
- **Google Fonts** — tipografia

---

## 📁 Estrutura de Pastas

```
FrontEnd/
├── index.html                 ← Arquivo HTML ÚNICO (SPA)
├── style.css
│
├── shared/
│   ├── js/
│   │   ├── supabase-client.js ← cria `sb` (cliente supabase-js)
│   │   ├── nav.js             ← Navegação entre seções, PIN de Finances
│   │   ├── api.js             ← TODA a lógica de dados (era o backend)
│   │   └── app.js             ← Inicialização, loadHTML, cache por seção
│   │
│   └── css/
│       ├── app.css            ← @import de tudo (base + páginas)
│       ├── polish.css
│       └── base/
│           ├── tokens.css     ← Design tokens
│           ├── shell.css      ← Layout (sidebar/topbar)
│           └── shared.css     ← Utilities
│
└── pages/
    ├── home/
    ├── body/           ← body.html, body.js, checkin.js, checkin-modal.html
    ├── exercises/      ← exercises.html, exercises.js, exercise-modal.html
    ├── goals/          ← goals.html = iframe mask (ver 09-PAGE-GOALS.md)
    └── finances/       ← finances.html, fin-core.js, fin-overview.js,
                          fin-lancamentos.js, fin-investimentos.js,
                          fin-viagens.js, fin-modals.js
```

---

## 📄 index.html - Arquivo HTML Único (SPA)

### Ordem dos scripts importa

`supabase-js` e `supabase-client.js` precisam carregar **antes** de `api.js`, porque `api.js` usa o objeto global `sb`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="shared/js/supabase-client.js?v=1"></script>
<script src="shared/js/nav.js?v=19"></script>
<script src="shared/js/api.js?v=20"></script>
<script src="shared/js/app.js?v=24"></script>
```

O resto do `index.html` não muda: sidebar, seções vazias (`#section-home`, `#section-body`, ...) que são preenchidas dinamicamente, containers de modal, toasts.

---

## 🧭 shared/js/nav.js - Navegação

Responsabilidade: qual seção está visível, e o PIN de acesso de Finances.

```javascript
const SECTION_META = {
  home:      { title: 'BodyLog',           action: null,                                                           filters: false },
  body:      { title: 'Body metrics',      action: { label: 'Novo check-in',   fn: 'openModal()' },                filters: false },
  finances:  { title: 'Finances overview', action: { label: 'Novo lançamento', fn: "openFinModal('lancamento')" }, filters: false },
  exercises: { title: 'Exercises tracker', action: { label: 'Novo treino',     fn: 'openExModal()' },               filters: true  },
  goals:     { title: 'Goals',             action: null,                                                           filters: false },
}
```
`action: null` significa que a seção não tem botão de ação rápida na sidebar/topbar (Goals não tem mais, desde que virou iframe mask).

```javascript
function switchSection(name) {
  if (name === 'finances' && !_financesUnlocked()) {
    _showFinancesPin(() => switchSection('finances'))
    return
  }
  // ...atualiza classes ativas, título do topbar...
  window.dispatchEvent(new CustomEvent('sectionchange', { detail: { section: name } }))
}
```
O PIN de Finances é uma constante no próprio arquivo (`const FINANCES_PIN = '1234'`) — é só uma cortina de privacidade de UI, não segurança real (a chave do Supabase já está exposta e as policies de RLS liberam tudo).

---

## 🔌 shared/js/api.js - Camada de Dados

Ver [04-BACKEND.md](04-BACKEND.md) em detalhe — esse arquivo faz hoje o que antes era um backend Python inteiro: monta queries pro Supabase, resolve hierarquias, calcula regras de negócio (ex.: rendimento de investimento).

```javascript
async function fetchCheckins() {
  const { data, error } = await sb
    .from('checkins')
    .select('date, valor, codigo_medida!inner(descricao, cd_pai)')
    .not('codigo_medida.cd_pai', 'is', null)
    .order('date', { ascending: true })
  _throwIfError(error)
  // agrupa por data em memória e retorna [{date, peso: .., gordura: ..}, ...]
  ...
}
```

Não existe mais um "endpoint" pra cada operação — cada função de `api.js` é uma unidade de trabalho completa (query + transformação), chamada diretamente pelas páginas.

---

## ⚙️ shared/js/app.js - Inicialização

### Versão & Cache
```javascript
const APP_VERSION = '24'                 // incrementa quando muda HTML/CSS versionado
const SECTION_DATA_TTL_MS = 45000        // 45s de cache por seção
const loadedSections = new Set()         // qual seção já teve o HTML injetado
```

### Scripts por seção (carregados sob demanda)
```javascript
const SECTION_SCRIPTS = {
  home:      ['pages/goals/goals.js?v=24', 'pages/home/home.js?v=5'],
  body:      ['pages/body/checkin.js?v=2', 'pages/body/body.js?v=20'],
  exercises: ['pages/exercises/exercises.js?v=21'],
  goals:     ['pages/goals/goals.js?v=24'],
  finances:  [
    'pages/finances/fin-core.js?v=5',
    'pages/finances/fin-overview.js?v=3',
    'pages/finances/fin-lancamentos.js?v=5',
    'pages/finances/fin-investimentos.js?v=27',
    'pages/finances/fin-viagens.js?v=5',
    'pages/finances/fin-modals.js?v=4',
  ],
}
```
`ensureSectionScripts(section)` injeta um `<script>` por arquivo, uma vez só (cacheado em `_scriptLoadPromises`), antes de chamar a função `init*Section()` daquela seção.

### Event Listener de troca de seção
```javascript
window.addEventListener('sectionchange', async e => {
  const section = e.detail.section
  try {
    if (!loadedSections.has(section)) {
      await loadHTML(SECTIONS[section], 'section-' + section)
      loadedSections.add(section)
    }
    await ensureSectionScripts(section)
    if (section === 'finances') await initFinancesSection(!_isSectionDataFresh('finances'))
    // ...idem pra home/body/exercises/goals
  } catch (err) {
    showAppError(`Não foi possível carregar a seção ${section}.`, err)
  }
})
```

Para a seção **goals**, `initGoalsSection()` hoje começa com uma guarda e não faz nada além disso (não há mais dashboard pra montar — é só o iframe):
```javascript
async function initGoalsSection(forceRefresh = false) {
  if (!document.getElementById('goals-overview')) return   // iframe mask, nada a renderizar
  ...
}
```

---

## 🎨 CSS - Design System

Sem mudanças estruturais: `tokens.css` (variáveis), `shell.css` (layout), `shared.css` (utilities), e um CSS por página, todos importados via `app.css`:

```css
@import url("base/tokens.css?v=4");
@import url("base/shell.css?v=4");
@import url("base/shared.css?v=3");
@import url("../../pages/body/body.css?v=3");
@import url("../../pages/exercises/exercises.css?v=2");
@import url("../../pages/goals/goals.css?v=2");
@import url("../../pages/finances/finances.css?v=7");
@import url("../../pages/home/home.css?v=3");
```
Isso significa que classes CSS de qualquer página (ex.: `.kpi-card`, `.fin-inv-card`) estão disponíveis globalmente, mesmo antes daquela seção carregar — é assim que dá pra reusar estilos entre páginas sem duplicar CSS.

---

## 🧩 Padrão de Página

Cada página em `pages/NOME/` segue o mesmo formato: `NOME.html` (fragmento injetado via `loadHTML`), `NOME.js` (uma função `initNOMESection(forceRefresh)` + renderers), `NOME.css`. A única exceção é **Goals**, cujo `goals.html` é só um iframe (ver [09-PAGE-GOALS.md](09-PAGE-GOALS.md)) e cujo `initGoalsSection()` foi neutralizado.

```javascript
// pages/NOME/NOME.js
async function initNOMESection(forceRefresh) {
  try {
    const dados = await fetchNOME()   // função de api.js, fala com Supabase
    renderNOMEContent(dados)
    createNOMEChart(dados)
  } catch (err) {
    showAppError('Erro ao carregar...', err)
  }
}
```

---

✅ **Próximo:** Veja [11-TECH-STACK.md](11-TECH-STACK.md) para entender as tecnologias.

✅ **Depois:** Explore [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md) para rodar localmente.
