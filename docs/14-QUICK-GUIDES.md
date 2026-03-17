# 14. Guias Rápidos das Páginas & Recursos

## 06. PAGE-HOME.md - Página Home/Overview

**Objetivo:** Dashboard com KPIs de todas as seções.

**Arquivos:**
- `pages/home/home.html` - Layout com cards
- `pages/home/home.js` - Carrega dados e renderiza

**Fluxo:**
```
initHomeSection() → fetchCheckins() + fetchExercicios() + ...
→ renderHomeCards() → Mostra últimas métricas
```

**Componentes:**
- Card: Última métrica Body (peso, IMC)
- Card: Total treinos mês
- Card: Score mensal Goals
- Card: Balanço Finances

---

## 07. PAGE-BODY.md - Página Body/Métricas

**Objetivo:** Registrar e analisar métricas corporais.

**Arquivos:**
- `pages/body/body.html` - Layout (gráficos + tabela)
- `pages/body/body.js` - Gráficos (Chart.js)
- `pages/body/checkin.js` - Modal formulário
- `pages/body/checkin-modal.html` - HTML do modal

**Funcionalidades:**
1. Novo check-in (modal)
2. Verificar dados (form validation)
3. POST para backend
4. 3 gráficos: Peso, Composição, Métrica selecionada
5. Tabela de histórico

**Cálculos automáticos:**
```javascript
IMC = peso / (altura²)
% Gordura = (gordura / peso) × 100
FFMI = (peso - gordura) / (altura²)
```

---

## 08. PAGE-EXERCISES.md - Página Exercises/Treinos

**Objetivo:** Registrar treinos e analisar frequência.

**Arquivos:**
- `pages/exercises/exercises.html` - Layout
- `pages/exercises/exercises.js` - Lógica + gráficos
- `pages/exercises/exercise-modal.html` - Modal novo treino

**Funcionalidades:**
1. Modal para novo treino (grupo, exercício, duração, esforço)
2. Filtros: data de-até, grupo muscular, exercício
3. 3 gráficos:
   - Timeline de treinos
   - Distribuição por grupo (pie chart)
   - Frequência (treinos/semana)
4. Tabela com histórico

**Dados:**
```javascript
{
  id: 1,
  data: '2026-03-15',
  hora: '14:30:00',
  cd_exercicio: 2,  // "Supino"
  duracao: 45,      // minutos
  esforco: 8        // 1-10
}
```

---

## 09. PAGE-GOALS.md - Página Goals/Metas

**Objetivo:** Acompanhar progresso diário de metas.

**Arquivos:**
- `pages/goals/goals.html` - Layout
- `pages/goals/goals.js` - Heatmap + score
- `pages/goals/goals-modal.html` - Modal nova meta

**Funcionalidades:**
1. Heatmap (calendário com cores sucesso/falha)
2. Score mensal (%)
3. KPIs: dias atingidos, melhor sequência, taxa
4. Toggle diário: marcar meta como atingida

**Cálculo Score:**
```javascript
dias_atingidos = 20
dias_mês = 31
score = (dias_atingidos / dias_mês) * 100  // 64.5%
```

**Cores:**
- Verde 🟩: meta atingida
- Vermelho 🟥: meta não atingida
- Cinza: sem dados

---

## 10. PAGE-FINANCES.md - Página Finances/Financeiro

**Objetivo:** Organizar receitas, despesas e investimentos.

**Arquivos:**
- `pages/finances/finances.html` - Layout
- `pages/finances/fin-core.js` - PIN validation + utils
- `pages/finances/fin-overview.js` - Dashboard
- `pages/finances/fin-lancamentos.js` - Transações
- `pages/finances/fin-investimentos.js` - Ativos
- `pages/finances/fin-viagens.js` - Agrupamento viagens
- `pages/finances/fin-modals.js` - Modais

**PIN Protection:**
```javascript
if (!isFinancesAuthenticated) {
  showPinModal() → validate → localStorage.setItem()
}
```

**Categorias Hierárquicas:**
```
Receita → Salário, Bônus
Despesa → Recorrente, Variável, Pontual, Caixinha
Investimento → CDB, Nu Invest, FGTS
```

**Módulos:**
1. Overview: Receita/Despesa/Investimento
2. Lançamentos: Criar/editar/deletar transações
3. Orçamento: Comparar orçado vs realizado
4. Investimentos: Snapshots de saldo
5. Viagens: Agrupar gastos por viagem

---

## 15. MAINTENANCE.md - Guia de Manutenção

**Tópicos:**
- Logs e debugging
- Atualizar dependências
- Backup de dados
- Limpar dados obsoletos
- Performance tuning
- Erros comuns e soluções

---

## 16. IMPROVEMENTS.md - Melhorias Futuras

**Ideias de Features:**
- Autenticação (login/senha)
- Sync com Apple Health/Google Fit
- Exportar para PDF/Excel
- Notificações push
- Modo dark theme
- Internacionalização (i18n)

**Refatorações:**
- Migrar para TypeScript
- Adicionar testes unitários
- Implementar Storybook para components
- API documentation (Swagger melhorado)

---

## 14. CREATING-NEW-PAGE.md - Como Adicionar Página

### Exemplo: Adicionar Seção "Meals" (Refeições)

**Passo 1: Database**
```sql
CREATE TABLE codigo_refeicao (
  id INTEGER PRIMARY KEY,
  nome VARCHAR
);

CREATE TABLE entrada_refeicao (
  id INTEGER PRIMARY KEY,
  data DATE,
  tipo VARCHAR,  -- "café", "almoço", "lanche", "ceia"
  calorias FLOAT
);
```

**Passo 2: Backend**
```python
# models.py
class EntradaRefeicao(Base):
    __tablename__ = "entrada_refeicao"
    id = Column(Integer, primary_key=True)
    data = Column(Date)
    tipo = Column(String)
    calorias = Column(Float)

# main.py
@app.get("/api/refeicoes")
async def get_refeicoes():
    with get_db() as db:
        return db.query(EntradaRefeicao).all()

@app.post("/api/refeicoes")
async def create_refeicao(request: dict):
    ...
```

**Passo 3: Frontend - HTML**
```html
<!-- pages/meals/meals.html -->
<div class="page-meals">
  <h1>Refeições</h1>
  <button onclick="showMealModal()">Nova Refeição</button>
  <div id="meals-chart"></div>
  <table id="meals-table"></table>
</div>

<!-- pages/meals/meals-modal.html -->
<div class="modal">
  <input type="date" id="meal-date">
  <select id="meal-tipo">
    <option>café</option>
    <option>almoço</option>
  </select>
  <input type="number" id="meal-calorias">
  <button onclick="saveMeal()">Salvar</button>
</div>
```

**Passo 4: Frontend - JavaScript**
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
  const table = document.getElementById('meals-table')
  table.innerHTML = `
    <tr>
      <th>Data</th>
      <th>Tipo</th>
      <th>Calorias</th>
    </tr>
    ${data.map(m => `
      <tr>
        <td>${m.data}</td>
        <td>${m.tipo}</td>
        <td>${m.calorias}</td>
      </tr>
    `).join('')}
  `
}

// pages/meals/meals-modal.js (abrir/fechar)
function showMealModal() {
  document.getElementById('modal-meals').style.display = 'block'
}

async function saveMeal() {
  const date = document.getElementById('meal-date').value
  const tipo = document.getElementById('meal-tipo').value
  const calorias = parseFloat(document.getElementById('meal-calorias').value)
  
  await postMeal({date, tipo, calorias})
  showAppToast('✓ Refeição salva!')
  closeMealModal()
  
  // Recarregar
  meals = await fetchMeals()
  renderMealsTable(meals)
}

// pages/meals/meals.css
.page-meals { padding: var(--space-lg); }
#meals-table { width: 100%; border-collapse: collapse; }
```

**Passo 5: Add ao API**
```javascript
// shared/js/api.js
async function fetchMeals() {
  return _apiFetch('/api/refeicoes')
}

async function postMeal(data) {
  return _apiFetch('/api/refeicoes', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
}
```

**Passo 6: Add à Navegação**
```javascript
// shared/js/nav.js
const SECTION_META = {
  ...
  meals: { label: 'Meals', icon: '🍽️' }
}

const SECTIONS = {
  ...
  meals: 'pages/meals/meals.html'
}
```

**Passo 7: Add ao HTML**
```html
<!-- index.html -->
<button class="sidebar-item" data-section="meals" onclick="switchSection('meals')">
  <span class="sidebar-item-icon">🍽️</span>
  <span class="sidebar-item-label">Meals</span>
</button>

<section class="section" id="section-meals"></section>
```

**Passo 8: Add CSS**
```html
<!-- index.html <head> -->
<link rel="stylesheet" href="pages/meals/meals.css">
```

**Passo 9: Add JS Scripts**
```html
<!-- index.html <body> -->
<script src="pages/meals/meals.js"></script>
<script src="pages/meals/meals-modal.js"></script>
```

**Pronto!** Ponto acessar "Meals" na sidebar.

---

## 15. FROM-SCRATCH.md - Criar Projeto do Zero

### Estrutura Inicial
```
bodylog/
├── backend/
│   ├── main.py (vazio)
│   ├── database.py
│   ├── models.py
│   └── requirements.txt
├── FrontEnd/
│   ├── index.html
│   ├── style.css
│   ├── shared/
│   └── pages/
└── docs/
```

### Passos Completos
1. Criar database PostgreSQL
2. Definir models (models.py)
3. Criar rotas FastAPI (main.py)
4. Criar UI (HTML/CSS)
5. Conectar frontend-backend (JS)
6. Deploy (Render.com)

---

## 18. API-REFERENCE.md - Endpoints

### Body
- `GET /api/checkins` - Listar
- `POST /api/checkins` - Criar
- `GET /api/medidas` - Listar medidas

### Exercises
- `GET /api/exercicios` - Listar
- `POST /api/exercicios` - Criar
- `GET /api/exercicios/codigos` - Exercícios disponíveis

### Goals
- `GET /api/goals/entradas` - Histórico
- `POST /api/goals/entradas` - Registrar progresso
- `GET /api/goals/metas` - Metas mensais

### Finance
- `GET /api/financas/lancamentos` - Transações
- `POST /api/financas/lancamentos` - Criar
- `GET /api/financas/orcamento` - Orçamentos
- `GET /api/financas/investimentos` - Snapshots

---

## 19. CODE-PATTERNS.md - Padrões Utilizados

### JavaScript
```javascript
// 1. Event listeners
button.onclick = () => { ... }
// ou
button.addEventListener('click', () => { ... })

// 2. State management
let state = { key: value }

// 3. Async/Await
const data = await fetch(...).then(r => r.json())

// 4. Template literals
const html = `<div>${variable}</div>`

// 5. Array methods
arr.map(x => x.value).filter(x => x > 0)
```

### Python
```python
# 1. Context manager
with get_db() as db:
    db.query(...)

# 2. ORM queries
db.query(Model).filter(Model.id == 1).first()

# 3. Type hints
def func(param: str) -> dict:
    ...

# 4. List comprehension
[x for x in items if x.active]
```

### CSS
```css
/* BEM Naming */
.button {}
.button__label {}
.button--primary {}
.button--disabled {}

/* Variables */
:root { --primary: #2F7AFF; }
color: var(--primary);

/* Flexbox */
.flex { display: flex; gap: var(--space-md); }

/* Responsive */
@media (max-width: 768px) { ... }
```

---

✅ **Documentação Básica Completa!**  
Consulte os arquivos detalhados para mais informações.
