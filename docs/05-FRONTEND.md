# 5. Documentação Detalhada do Frontend - BodyLog

## 🎨 Visão Geral do Frontend

O frontend do BodyLog é construído com **HTML, CSS e JavaScript vanilla** (sem frameworks como React ou Vue). Isso significa:
- ✅ Sem build step (webpack, rollup, etc)
- ✅ Sem dependências npm
- ✅ Arquivo pode ser aberto diretamente no navegador
- ✅ Simples entender o fluxo (não há abstração de framework)
- ✅ Fácil fazer debugging

### Stack Frontend
- **HTML5:** Markup estrutural
- **CSS3:** Estilos, layout (flexbox, grid), animações
- **JavaScript (ES6+):** Vanilla JS, sem frameworks
- **Chart.js:** Biblioteca para gráficos
- **Google Fonts:** Tipografia

---

## 📁 Estrutura de Pastas

```
FrontEnd/
├── index.html                 ← Arquivo HTML ÚNICO (SPA)
├── style.css                  ← Entrada de CSS
│
├── shared/                    ← Recursos compartilhados
│   ├── js/
│   │   ├── nav.js             ← Navegação entre seções
│   │   ├── api.js             ← Chamadas HTTP
│   │   └── app.js             ← Inicialização
│   │
│   └── css/
│       ├── app.css            ← Estilos principais
│       ├── polish.css         ← Refinamentos
│       └── base/
│           ├── tokens.css     ← Design tokens
│           ├── shell.css      ← Layout (sidebar/topbar)
│           └── shared.css     ← Utilities
│
└── pages/                     ← Páginas específicas
    ├── home/
    │   ├── home.html
    │   ├── home.js
    │   └── home.css
    │
    ├── body/
    │   ├── body.html
    │   ├── body.js
    │   ├── body.css
    │   ├── checkin.js
    │   └── checkin-modal.html
    │
    ├── exercises/
    │   ├── exercises.html
    │   ├── exercises.js
    │   ├── exercises.css
    │   └── exercise-modal.html
    │
    ├── goals/
    │   ├── goals.html
    │   ├── goals.js
    │   ├── goals.css
    │   └── goals-modal.html
    │
    └── finances/
        ├── finances.html
        ├── finances.css
        ├── fin-core.js
        ├── fin-overview.js
        ├── fin-lancamentos.js
        ├── fin-investimentos.js
        ├── fin-viagens.js
        └── fin-modals.js
```

---

## 📄 index.html - Arquivo HTML Único (SPA)

### O que é uma SPA?

**SPA = Single Page Application**
- Um único arquivo HTML carregado uma vez
- JavaScript dinamicamente carrega conteúdo após navegação
- Sem reloads de página (experiência fluida)

### Estrutura Base

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <!-- Metadados -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BodyLog</title>
  
  <!-- Fontes externas -->
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap" rel="stylesheet">
  
  <!-- Biblioteca de Gráficos -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
  
  <!-- CSS -->
  <link rel="stylesheet" href="shared/css/app.css?v=3">
  <link rel="stylesheet" href="shared/css/polish.css?v=2">
</head>

<body>
  <!-- Overlay para mobile sidebar -->
  <div id="sidebar-overlay" onclick="closeMobileSidebar()"></div>
  
  <!-- Sidebar (navegação) -->
  <aside id="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">B</div>
      <span class="sidebar-logo-text">Body<span>Log</span></span>
    </div>
    
    <!-- Botão colapsar -->
    <button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="Colapsar menu">
      <svg>...</svg>
    </button>
    
    <!-- Navegação -->
    <nav class="sidebar-nav">
      <button class="sidebar-item active" data-section="home" onclick="switchSection('home')">
        <span class="sidebar-item-icon">⊞</span>
        <span class="sidebar-item-label">Overview</span>
      </button>
      <button class="sidebar-item" data-section="body" onclick="switchSection('body')">
        <span class="sidebar-item-icon">◎</span>
        <span class="sidebar-item-label">Body</span>
      </button>
      <!-- Outros botões... -->
    </nav>
  </aside>
  
  <!-- Conteúdo principal -->
  <div id="app-wrapper">
    <!-- Topbar (mobile) -->
    <div id="topbar">
      <button id="topbar-hamburger" onclick="openMobileSidebar()">
        <svg>...</svg>
      </button>
      <span id="topbar-section-title">Body metrics</span>
    </div>
    
    <!-- Seções dinâmicas -->
    <div id="main-content">
      <section class="section" id="section-home"></section>
      <section class="section" id="section-body"></section>
      <section class="section" id="section-exercises"></section>
      <section class="section" id="section-goals"></section>
      <section class="section" id="section-finances"></section>
    </div>
  </div>
  
  <!-- Modals -->
  <div id="modal-container"></div>
  <div id="modal-container-ex"></div>
  <div id="modal-container-goals"></div>
  
  <!-- PIN Finance -->
  <div id="finances-pin-overlay">...</div>
  
  <!-- Toasts (notificações) -->
  <div class="success-toast" id="toast">✓ Salvo!</div>
  <div class="success-toast" id="toast-erro">✗ Erro!</div>
  
  <!-- Scripts -->
  <script src="shared/js/nav.js"></script>
  <script src="shared/js/api.js"></script>
  <script src="shared/js/app.js"></script>
  <script src="pages/body/checkin.js"></script>
  <script src="pages/body/body.js"></script>
  <script src="pages/exercises/exercises.js"></script>
  <script src="pages/goals/goals.js"></script>
  <script src="pages/home/home.js"></script>
  <script src="pages/finances/fin-core.js"></script>
  <script src="pages/finances/fin-overview.js"></script>
  <script src="pages/finances/fin-lancamentos.js"></script>
  <script src="pages/finances/fin-investimentos.js"></script>
  <script src="pages/finances/fin-viagens.js"></script>
</body>
</html>
```

---

## 🧭 shared/js/nav.js - Navegação

### Responsabilidade
Gerenciar qual seção está visível (Home, Body, Exercises, etc).

### Código

```javascript
// Seção padrão ao iniciar
const DEFAULT_SECTION = 'home'

// Metadados das seções
const SECTION_META = {
  home:      { label: 'Overview', icon: '⊞' },
  body:      { label: 'Body', icon: '◎' },
  exercises: { label: 'Exercises', icon: '◇' },
  finances:  { label: 'Finances', icon: '◈' },
  goals:     { label: 'Goals', icon: '◆' },
}

// Seção atual
let _activeSection = 'home'

// Função principal: muda de seção
function switchSection(section) {
  // Validar
  if (!SECTION_META[section]) {
    console.error(`Seção desconhecida: ${section}`)
    return
  }
  
  // Atualizar UI
  document.querySelectorAll('.sidebar-item').forEach(btn => {
    btn.classList.remove('active')
    if (btn.dataset.section === section) {
      btn.classList.add('active')
    }
  })
  
  // Atualizar title do topbar
  const title = document.getElementById('topbar-section-title')
  title.textContent = SECTION_META[section].label
  
  // Disparar evento para app.js
  window.dispatchEvent(new CustomEvent('sectionchange', {
    detail: { section }
  }))
}

// Colapsar sidebar (mobile)
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar')
  sidebar.classList.toggle('collapsed')
}

function closeMobileSidebar() {
  const overlay = document.getElementById('sidebar-overlay')
  overlay.style.display = 'none'
  document.getElementById('sidebar').classList.remove('mobile-open')
}

function openMobileSidebar() {
  const overlay = document.getElementById('sidebar-overlay')
  overlay.style.display = 'block'
  document.getElementById('sidebar').classList.add('mobile-open')
}
```

### Como Funciona

```
Usuário clica em "Body"
              ↓
JavaScript chama switchSection('body')
              ↓
Atualiza classe 'active' no botão
              ↓
Dispara evento CustomEvent 'sectionchange'
              ↓
app.js escuta evento
              ↓
Se body.html não carregou:
  fetch('pages/body/body.html')
  insere no #section-body
  chama initBodySection()
              ↓
Página Body visível
```

---

## 🔌 shared/js/api.js - Chamadas HTTP

### Responsabilidade
Fazer requisições fetch para o backend e retornar dados em JSON.

### Código Base

```javascript
// URL do backend (muda entre dev e prod)
const API = "https://meusite-3.onrender.com"

// Helper principal: fetch com tratamento de erro
async function _apiFetch(path, options = {}) {
  const response = await fetch(`${API}${path}`, options)
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${path}`)
  }
  
  return response.json()
}
```

### Funções de Dados - Body

```javascript
// GET: listar check-ins
async function fetchCheckins() {
  return _apiFetch('/api/checkins')
}

// GET: listar medidas
async function fetchMedidas() {
  return _apiFetch('/api/medidas')
}

// POST: novo check-in
async function postCheckin(date, medidas) {
  return _apiFetch('/api/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, medidas })
  })
}
```

### Funções de Dados - Exercises

```javascript
// GET: códigos de exercício
async function fetchCodigosExercicio() {
  return _apiFetch('/api/exercicios/codigos')
}

// GET: exercícios registrados
async function fetchExercicios() {
  return _apiFetch('/api/exercicios')
}

// POST: novo exercício
async function postExercise(entry) {
  return _apiFetch('/api/exercicios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  })
}
```

### Pattern: Sempre Trata Erros

```javascript
async function fetchCheckins() {
  try {
    return _apiFetch('/api/checkins')
  } catch (err) {
    showAppError('Erro ao carregar check-ins', err)
    return []  // Retorna vazio em vez de quebrar
  }
}
```

---

## ⚙️ shared/js/app.js - Inicialização

### Responsabilidade
- Inicializar página
- Carregar HTML dinâmico
- Gerenciar cache com TTL
- Mostrar toasts/notificações

### Versão & Cache

```javascript
const APP_VERSION = '22'  // Incrementa quando muda UI
const SECTION_DATA_TTL_MS = 45000  // 45 segundos de cache
const loadedSections = new Set()   // Qual página já foi carregada

// Mapa de últimos load times
const _sectionDataLoadedAt = {
  home: 0,
  body: 0,
  exercises: 0,
  goals: 0,
  finances: 0,
}

// Checar se dados estão fresh (não vencidos)
function _isSectionDataFresh(section) {
  const ts = _sectionDataLoadedAt[section] || 0
  return ts > 0 && (Date.now() - ts) < SECTION_DATA_TTL_MS
}

// Marcar dados como fresh
function _touchSectionData(section) {
  _sectionDataLoadedAt[section] = Date.now()
}
```

### Carregar HTML Dinamicamente

```javascript
// Mapa de seção para arquivo HTML
const SECTIONS = {
  home:      'pages/home/home.html',
  body:      'pages/body/body.html',
  exercises: 'pages/exercises/exercises.html',
  finances:  'pages/finances/finances.html',
  goals:     'pages/goals/goals.html',
}

// Função que faz fetch do HTML
async function loadHTML(file, targetId) {
  // Adiciona version query string para evitar cache
  const response = await fetch(`${file}?v=${APP_VERSION}`, {
    cache: 'no-cache'
  })
  
  if (!response.ok) {
    throw new Error(`Falha ao carregar: ${file} (${response.status})`)
  }
  
  // Buscar elemento alvo
  const target = document.getElementById(targetId)
  if (!target) {
    throw new Error(`Container não encontrado: ${targetId}`)
  }
  
  // Inserir HTML
  const html = await response.text()
  target.innerHTML = html
}
```

### Mostrar Notificações

```javascript
// Toast de sucesso
function showAppToast(message, type = 'success') {
  const id = type === 'error' ? 'toast-erro' : 'toast'
  const el = document.getElementById(id)
  if (!el) return
  
  el.textContent = message
  el.classList.add('show')
  
  // Desaparecer após 2.8 segundos
  setTimeout(() => el.classList.remove('show'), 2800)
}

// Helper para erro
function showAppError(message, err) {
  if (err) console.error(message, err)
  showAppToast(message, 'error')
}
```

### Event Listener para Mudança de Seção

```javascript
window.addEventListener('sectionchange', async e => {
  const section = e.detail.section
  
  try {
    // Limpar seção anterior
    if (_activeSection) {
      _cleanupSectionResources(_activeSection)
    }
    
    // Se seção não foi carregada, carregar agora
    if (!loadedSections.has(section)) {
      await loadHTML(SECTIONS[section], 'section-' + section)
      loadedSections.add(section)
      
      // Marcar como active no DOM
      document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active')
      })
      document.getElementById('section-' + section).classList.add('active')
    }
    
    // Atualizar seção ativa
    _activeSection = section
    
    // Chamar função init da seção (ex: initBodySection)
    const initFunc = `init${section.charAt(0).toUpperCase()}${section.slice(1)}Section`
    
    // Forçar refresh se dados venceram (após 45s)
    const forceRefresh = !_isSectionDataFresh(section)
    window[initFunc](forceRefresh)
    
    _touchSectionData(section)
    
  } catch (err) {
    showAppError(`Erro ao carregar ${section}`, err)
  }
})

// Limpar recursos de gráficos para evitar memory leak
function _cleanupSectionResources(section) {
  if (section === 'body' && typeof destroyBodyCharts === 'function') {
    destroyBodyCharts()
  }
  if (section === 'exercises' && typeof destroyExerciseCharts === 'function') {
    destroyExerciseCharts()
  }
  if (section === 'finances' && typeof destroyFinanceCharts === 'function') {
    destroyFinanceCharts()
  }
}

// Init na página carregar
async function init() {
  // Disparar evento para carregar seção home
  window.dispatchEvent(new CustomEvent('sectionchange', {
    detail: { section: DEFAULT_SECTION }
  }))
}

// Executar init quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', init)
```

---

## 🎨 CSS - Design System

### shared/css/base/tokens.css - Design Tokens

```css
:root {
  /* Cores Primárias */
  --primary: #2F7AFF;
  --primary-dark: #1F5AD7;
  --primary-light: #6FA0FF;
  
  /* Escala Neutra */
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --bg-tertiary: #EEEEEE;
  
  /* Status */
  --success: #22C55E;
  --danger: #EF4444;
  --warning: #F59E0B;
  --info: #3B82F6;
  
  /* Spacing (8px grid) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Tipografia */
  --font-display: 'DM Serif Display', serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  
  /* Border & Shadow */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  
  /* Layout */
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 80px;
  --topbar-height: 60px;
}

/* Dark mode (opcional) */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #FFFFFF;
    --bg-primary: #1A1A1A;
    --bg-secondary: #2A2A2A;
  }
}
```

### shared/css/base/shell.css - Layout Principal

```css
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-body);
  color: var(--text-primary);
  background: var(--bg-primary);
}

/* Sidebar */
#sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-secondary);
  padding: var(--space-lg);
  overflow-y: auto;
  border-right: 1px solid var(--bg-tertiary);
  transition: width 300ms ease;
}

#sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

/* App wrapper */
#app-wrapper {
  margin-left: var(--sidebar-width);
  transition: margin-left 300ms ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#sidebar.collapsed ~ #app-wrapper {
  margin-left: var(--sidebar-width-collapsed);
}

/* Topbar */
#topbar {
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0 var(--space-lg);
  border-bottom: 1px solid var(--bg-tertiary);
}

/* Main content */
#main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

/* Seções */
.section {
  display: none;
}

.section.active {
  display: block;
}
```

### shared/css/base/shared.css - Classes Utilities

```css
/* Display */
.is-hidden { display: none !important; }
.d-flex { display: flex; }
.d-grid { display: grid; }
.d-block { display: block; }

/* Spacing */
.mt-md { margin-top: var(--space-md); }
.mb-md { margin-bottom: var(--space-md); }
.p-lg { padding: var(--space-lg); }

/* Flexbox */
.gap-md { gap: var(--space-md); }
.align-center { align-items: center; }
.justify-between { justify-content: space-between; }

/* Text */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-success { color: var(--success); }
.text-danger { color: var(--danger); }

/* States */
.error { color: var(--danger); }
.success { color: var(--success); }
.disabled { opacity: 0.5; cursor: not-allowed; }
```

---

## 📊 Fluxographo de Carregamento

```
1. Browser carrega index.html
        ↓
2. index.html carrega <script> de nav.js, api.js, app.js
        ↓
3. app.js na line "DOMContentLoaded" chama init()
        ↓
4. init() dispara evento 'sectionchange' com section='home'
        ↓
5. app.js event listener captura evento
        ↓
6. Se section não foi carregada:
   - await loadHTML('pages/home/home.html', 'section-home')
   - insere HTML no DOM
   - adiciona à loadedSections
   ↓
7. Chama initHomeSection() (função em pages/home/home.js)
        ↓
8. initHomeSection() fetch dados via api.js
        ↓
9. Renderiza HTML/Gráficos com dados
        ↓
10. Página visível para usuário
```

---

## 🧩 Padrão de Página

Cada página segue o mesmo padrão:

**pages/NOME/NOME.html:**
```html
<div class="page-NOME">
  <h1>Título</h1>
  <div id="NOME-content"></div>
  <div id="NOME-chart"></div>
</div>
```

**pages/NOME/NOME.js:**
```javascript
async function initNOMESection(forceRefresh) {
  try {
    // Carregar dados via api.js
    const dados = await fetchNOME()
    
    // Renderizar
    renderNOMEContent(dados)
    
    // Criar gráfico se necessário
    createNOMEChart(dados)
    
  } catch (err) {
    showAppError('Erro ao carregar...', err)
  }
}

function renderNOMEContent(dados) {
  const container = document.getElementById('NOME-content')
  container.innerHTML = `
    <table>
      <tr>
        <th>Col1</th>
        <th>Col2</th>
      </tr>
      ${dados.map(item => `
        <tr>
          <td>${item.field1}</td>
          <td>${item.field2}</td>
        </tr>
      `).join('')}
    </table>
  `
}

let chartNOME = null

function createNOMEChart(dados) {
  const ctx = document.getElementById('NOME-chart').getContext('2d')
  
  chartNOME = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dados.map(d => d.date),
      datasets: [{
        label: 'Métrica',
        data: dados.map(d => d.valor),
        borderColor: '#2F7AFF',
        backgroundColor: 'rgba(47, 122, 255, 0.1)'
      }]
    }
  })
}

function destroyNOMECharts() {
  if (chartNOME) {
    chartNOME.destroy()
    chartNOME = null
  }
}
```

---

✅ **Próximo:** Veja [11-TECH-STACK.md](11-TECH-STACK.md) para entender as tecnologias.

✅ **Depois:** Explore [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md) para rodar localmente.
