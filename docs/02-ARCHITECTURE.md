# 2. Documentação de Arquitetura - BodyLog

## 🏗️ Visão Geral da Arquitetura

BodyLog é uma aplicação **web moderna** que segue a arquitetura **cliente-servidor** clássica:

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                          │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  FrontEnd: HTML + CSS + JavaScript (SPA - Single Page App)  │  │
│  │  ├── index.html (estrutura base)                            │  │
│  │  ├── pages/* (Body, Exercises, Goals, Finances, Home)       │  │
│  │  └── shared/* (CSS, JS helpers, componentes)                │  │
│  └────────────────┬──────────────────────────────────────────┘  │
│                   │ HTTP/HTTPS (REST)                            │
│                   │ Requisições JSON                             │
└───────────────────┼────────────────────────────────────────────┘
                    │ ☁ INTERNET ☁
┌───────────────────┼────────────────────────────────────────────┐
│                   ↓                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              SERVIDOR (Render.com - Cloud)                  │  │
│  │  FastAPI (Python web framework)                             │  │
│  │  ├── main.py - Definição de rotas HTTP                      │  │
│  │  ├── models.py - Estrutura de dados (SQLAlchemy ORM)        │  │
│  │  └── database.py - Pool de conexões PostgreSQL              │  │
│  │                                                             │  │
│  │  Endpoints:                                                │  │
│  │  /api/checkins, /api/exercicios, /api/goals, /api/financas │  │
│  └────────────────┬──────────────────────────────────────────┘  │
│                   │ TCP 5432 (psycopg2)                         │
└───────────────────┼────────────────────────────────────────────┘
                    │ ☁ INTERNET ☁
┌───────────────────┼────────────────────────────────────────────┐
│                   ↓                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              DATABASE (PostgreSQL)                          │  │
│  │  Tabelas: checkins, entrada_exercicio, entrada_goals,      │  │
│  │           lancamento_financeiro, etc                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Componentes de Rede

### Frontend (Browser)
- **Localização:** Máquina do usuário (navegador)
- **Tecnologia:** HTML, CSS, JavaScript (vanilla, sem frameworks)
- **Quando carrega:** Quando usuário acessa https://meusite-3.onrender.com
- **Arquivo raiz:** index.html (único arquivo HTML)
- **Responsabilidade:** Interface, validação local, chamadas de API

### Backend (FastAPI)
- **Localização:** Render.com (cloud)
- **Tecnologia:** Python 3 + FastAPI
- **Quando executa:** Sempre online, aguardando requisições
- **Arquivo raiz:** main.py
- **Responsabilidade:** Validação de dados, lógica de negócio, acesso ao banco

### Database (PostgreSQL)
- **Localização:** Render.com (cloud)
- **Tecnologia:** PostgreSQL 12+
- **Quando executa:** Sempre online
- **Responsabilidade:** Armazenamento persistente de dados

---

## 🔄 Fluxo Completo de uma Ação (Exemplo Real)

### Cenário: Usuário faz um check-in de peso

**PASSO 1: Página carrega**
```
URL no Browser: https://meusite-3.onrender.com
                         ↓
Render entrega: index.html + CSS + JavaScript
                         ↓
index.html carrega: <script src="shared/js/nav.js">
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
  app.loadHTML('pages/body/body.html', 'section-body')
                         ↓
Após carregar HTML:
  executa initBodySection() (função em body.js)
                         ↓
body.js faz: fetchCheckins().then(entries => {...render(entries)...})
```

**PASSO 3: Chamada de API para carregar dados**
```
body.js chama: fetchCheckins()
                         ↓
api.js executa: _apiFetch('/api/checkins')
                         ↓
JavaScript: fetch('https://meusite-3.onrender.com/api/checkins')
                         ↓
║ ─ ─ ─ ─ ─ ─ │ INTERNET │ ─ ─ ─ ─ ─ ─
║
FastAPI recebe: GET /api/checkins
                         ↓
main.py: @app.get("/api/checkins")
async def get_checkins():
  with get_db() as db:
    checkins = db.query(Checkin).all()
    # Converte para JSON
    return [{"id": ..., "date": ..., "valor": ...}]
                         ↓
║ ─ ─ ─ ─ ─ ─ │ INTERNET │ ─ ─ ─ ─ ─ ─
║
Frontend recebe: Response com JSON
                         ↓
api.js: return response.json()
                         ↓
body.js: fetchCheckins().then(entries => {
  entries = [...dados do servidor...]
  renderBodyCharts(entries)
  renderHistoricoCheckins(entries)
})
```

**PASSO 4: Usuário abre modal e preenche formulário**
```
Usuário clica: "Nova Medida"
                         ↓
checkin.js: showCheckinModal()
                         ↓
Modal abre (checkin-modal.html injetado no DOM)
                         ↓
Usuário preenche:
  Data: 2026-03-15
  Peso: 78.5 kg
  Gordura: 18.2 kg
  Altura: 1.78 m
```

**PASSO 5: Usuário clica Salvar**
```
Usuário clica: "Salvar"
                         ↓
checkin.js: document.getElementById('btn-salvar').addEventListener('click', async () => {
  const formData = {
    date: '2026-03-15',
    medidas: {
      'peso': 78.5,
      'gordura': 18.2,
      'altura': 1.78
    }
  }
  
  await postCheckin(formData.date, formData.medidas)
})
                         ↓
api.js: _apiFetch('/api/checkins', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({date: '2026-03-15', medidas: {...}})
})
                         ↓
║ ─ ─ ─ ─ ─ ─ │ INTERNET │ ─ ─ ─ ─ ─ ─
║
FastAPI recebe: POST /api/checkins
  Body.: {"date": "2026-03-15", "medidas": {"peso": 78.5, ...}}
                         ↓
main.py: @app.post("/api/checkins")
async def create_checkin(request: dict):
  # Valida
  if not request.get('date'): raise HTTPException(400, "Data inválida")
  
  with get_db() as db:
    for codigo_medida, valor in request['medidas'].items():
      medida = db.query(CodigoMedida).filter(
        CodigoMedida.descricao == codigo_medida
      ).first()
      
      if medida:
        checkin = Checkin(
          date=request['date'],
          cd_medida=medida.id,
          valor=valor
        )
        db.add(checkin)
    
    db.commit()  # INSERT no PostgreSQL
  
  return {"status": "success"}
                         ↓
║ ─ ─ ─ ─ ─ ─ │ INTERNET │ ─ ─ ─ ─ ─ ─
║
Frontend recebe: {"status": "success"}
                         ↓
checkin.js:
  showAppToast('✓ Check-in salvo com sucesso!')
  closeModal()
  
  // Recarrega dados
  const dadosAtualizados = await fetchCheckins()
  renderBodyCharts(dadosAtualizados)
  renderHistoricoCheckins(dadosAtualizados)
```

---

## 📊 Diagrama de Fluxo de Dados

```
                  CLIENTE (Frontend)
                        │
                        │ Ação do usuário
                        ↓
                  JavaScript captura
                  Validação local
                        │
                        │ Chama api.js
                        ↓
                  fetch() → HTTP POST
                        │
         ┌──────────────┼──────────────┐
         │              │              │
      ✓ Success      ⚠ Warning     ✗ Error
         │              │              │
         ↓              ↓              ↓
      200 OK        299 Redirect   400+ Error
         │              │              │
         ↓              ↓              ↓
    Parse JSON    Handle case    Show error toast
    Update DOM      or Retry       Log to console
  Show success      Re-fetch
      message
```

---

## 🎯 Padrões Arquiteturais Utilizados

### 1. **Single Page Application (SPA)**
- Um único arquivo HTML (index.html)
- HTML dinâmico carregado via JavaScript
- Sem page reloads (experiência fluida)
- Melhor performance que multi-page apps

**Como funciona:**
```html
<!-- index.html (único) -->
<section id="section-home"></section>
<section id="section-body"></section>
<section id="section-exercises"></section>

<!-- JavaScript dinamicamente injeta: -->
<!-- em #section-home → pages/home/home.html -->
<!-- em #section-body → pages/body/body.html -->
<!-- etc -->
```

### 2. **REST API (Representational State Transfer)**
- Backend expõe endpoints HTTP
- Frontend acessa via fetch()
- Comunicação stateless (cada request é independente)
- Formato: JSON

**Exemplos de endpoints:**
```
GET  /api/checkins                   → Listar todos
POST /api/checkins                   → Criar novo
GET  /api/exercicios                 → Listar exercícios
POST /api/exercicios                 → Registrar treino
```

### 3. **ORM (Object-Relational Mapping)**
- SQLAlchemy mapeia tabelas SQL para classes Python
- Models.py define estrutura sem escrever SQL raw

**Exemplo:**
```python
# models.py - Define classe Python
class Checkin(Base):
    __tablename__ = "checkins"
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)

# main.py - Usa ORM (sem SQL raw)
db.query(Checkin).filter(Checkin.date == '2026-03-15').all()

# Equivale a SQL:
# SELECT * FROM checkins WHERE date = '2026-03-15'
```

### 4. **Component-Based CSS**
- BEM (Block Element Modifier) naming
- Reutilização de estilos
- Escalável e fácil de manter

**Exemplo:**
```css
/* Block */
.button { ... }

/* Element */
.button__label { ... }

/* Modifier */
.button--primary { ... }
.button--large { ... }
```

---

## 🗂️ Estrutura de Pastas Detalhada

### Backend
```
backend/
├── main.py              ← Rotas HTTP (FastAPI)
├── database.py          ← Conexão PostgreSQL
├── models.py            ← Estrutura de dados (ORM)
└── requirements.txt     ← Dependências Python
```

**Responsabilidades:**
- `main.py`: Recebe requisições HTTP, valida, acesa DB, retorna JSON
- `models.py`: Define tabelas como classes Python
- `database.py`: Cria conexão reutilizável com banco
- `requirements.txt`: Lista de pacotes (`pip install -r`)

### Frontend - Estrutura Principal
```
FrontEnd/
├── index.html           ← Arquivo HTML único (SPA)
├── style.css            ← Importa app.css + polish.css
│
├── shared/              ← Recursos compartilhados
│   ├── js/
│   │   ├── nav.js       ← Navegação (switchSection)
│   │   ├── api.js       ← Chamadas HTTP (fetch)
│   │   └── app.js       ← Inicialização (loadHTML, init)
│   │
│   └── css/
│       ├── app.css      ← Estilos principais (importa base/)
│       ├── polish.css   ← Refinamentos e responsividade
│       └── base/
│           ├── shared.css   ← Classes utilities
│           ├── shell.css    ← Layout sidebar/topbar
│           └── tokens.css   ← Variáveis CSS (cores, spacing, etc)
│
└── pages/               ← Código específico por página
    ├── home/            ← Home/Overview
    │   ├── home.html
    │   ├── home.js
    │   └── home.css
    │
    ├── body/            ← Body/Métricas
    │   ├── body.html
    │   ├── body.js
    │   ├── body.css
    │   ├── checkin.js
    │   └── checkin-modal.html
    │
    ├── exercises/       ← Exercises/Treinos
    │   ├── exercises.html
    │   ├── exercises.js
    │   ├── exercises.css
    │   └── exercise-modal.html
    │
    ├── goals/           ← Goals/Metas
    │   ├── goals.html
    │   ├── goals.js
    │   ├── goals.css
    │   └── goals-modal.html
    │
    └── finances/        ← Finances/Financeiro
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

## 🔗 Relacionamentos entre Camadas

### Como Frontend Chama Backend

```javascript
// FRONTEND CODE (JavaScript)
const resposta = await fetch('https://meusite-3.onrender.com/api/exercicios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: '2026-03-15',
    cd_exercicio: 5,
    duracao: 60,
    esforco: 8
  })
})

const json = await resposta.json()
console.log(json)  // {id: 123, status: 'success'}
```

### Como Backend Acessa Database

```python
# BACKEND CODE (Python/FastAPI)
from models import EntradaExercicio

@app.post("/api/exercicios")
async def create_exercicio(request: dict):
    with get_db() as db:
        # Cria objeto Python
        entrada = EntradaExercicio(
            data=request['data'],
            cd_exercicio=request['cd_exercicio'],
            duracao=request['duracao'],
            esforco=request['esforco']
        )
        
        # SQLAlchemy traduz para SQL e executa
        db.add(entrada)
        db.commit()
        
        # Retorna JSON para frontend
        return {
            'id': entrada.id,
            'status': 'success'
        }
```

### Como Database Armazena

```sql
-- PostgreSQL executa INSERT gerado por SQLAlchemy
INSERT INTO entrada_exercicio (data, hora, cd_exercicio, duracao, esforco)
VALUES ('2026-03-15', '14:30:00'::time, 5, 60, 8);

-- Resultado: Registro inserido e persistido
-- (mesmo após desligar backend, dados continuam lá)
```

---

## 🧩 Responsabilidades por Camada

### Frontend (Cliente/Browser)
**Responsável por:**
- ✅ Interface do usuário
- ✅ Capturar eventos (cliques, submissão de forma)
- ✅ Validação básica de dados
- ✅ Chamadas HTTP via fetch
- ✅ Atualização de DOM
- ✅ Renderização de charts/gráficos
- ✅ Cache local (TTL)
- ✅ Navegação entre seções (SPA)

**NÃO é responsável por:**
- ❌ Validação séria de dados (sempre validar no backend)
- ❌ Lógica de negócio complexa
- ❌ Acesso direto ao banco

### Backend (Servidor/Server)
**Responsável por:**
- ✅ Validação rigorosa de dados (Pydantic)
- ✅ Lógica de negócio
- ✅ Acesso ao banco de dados
- ✅ Autenticação/Autorização
- ✅ Cálculos complexos
- ✅ Garantir integridade dos dados
- ✅ Logging de operações
- ✅ Tratamento de erros

**NÃO é responsável por:**
- ❌ Renderizar interface (responsabilidade do frontend)
- ❌ Armazenar dados em cache (banco de dados faz isso)

### Database (Permanência/Armazenamento)
**Responsável por:**
- ✅ Armazenar dados persistentemente
- ✅ Integridade referencial (foreign keys)
- ✅ Índices para performance
- ✅ Backup automático
- ✅ Replicação (em produção)

**NÃO é responsável por:**
- ❌ Lógica de negócio
- ❌ Formatação de resposta

---

## 🔐 Fluxo de Segurança

### PIN Protection (Finances)
```
Usuário acessa Finances
             ↓
Sem PIN autenticado?
             ↓
Mostrar modal PIN
             ↓
Usuário digita PIN
             ↓
Frontend valida no localStorage
             ↓
Correto? → Desbloqueado
Errado?  → Mensagem erro
```

### CORS (Cross-Origin Resource Sharing)
```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite qualquer origem
    allow_methods=["*"],  # Permite GET, POST, DELETE, etc
    allow_headers=["*"]   # Permite qualquer header
)

# Nota: Em produção, isso puede ser mais restritivo
```

---

## 📈 Padrão de Escalabilidade

### Horizontal
```
Um servidor FastAPI não é suficiente?
             ↓
Adicione mais servidores FastAPI atrás de um Load Balancer
             ↓
Cada servidor tem sua conexão ao PostgreSQL
             ↓
Bank gerencia tráfego entre servidores
```

### Vertical
```
Um servidor FastAPI não é rápido suficiente?
             ↓
Aumente RAM e CPU (upgrade do plano Render)
             ↓
FastAPI é muito eficiente, aguenta bastante
```

### Database
```
Muito dados? PostgreSQL fica lento?
             ↓
Adicione índices nas colunas frequentemente consultadas
             ↓
Implemente cache com Redis
             ↓
Considere particionamento (sharding) de dados
```

---

## 🚀 Fluxo de Deployment

```
DESENVOLVIMENTO LOCAL
│ (seu laptop)
│ python main.py (rodando na 8000)
│
        ↓
│ Teste tudo localmente
│
        ↓
│ git commit + git push (GitHub)
│
        ↓
│ Render webhook detecta push
│
        ↓
RENDER.COM (Cloud)
│
├── Frontend
│   └── Arquivo estático HTML/CSS/JS
│       (servidos como arquivos estáticos)
│
└── Backend (Restart automático)
    └── Python FastAPI
        (rodando em container)
        (conecta ao PostgreSQL via DATABASE_URL)
```

---

## 🔄 Ciclo de Requisição-Resposta

```
╔════════════════════════════════════════════════════╗
║           CLIENTE (Browser)                        ║
║  1. JavaScript cria objeto JavaScript             ║
║  2. JSON.stringify() → JSON text                   ║
║  3. fetch() com body=JSON text                     ║
║  4. HTTP POST headers                             ║
╚═════════════────────╤══════════════════════════════╝
                      │ HTTPS (encrypted)
                      │
╔═════════════════════╧══════════════════════════════╗
║           SERVIDOR (FastAPI)                       ║
║  1. Recebe HTTP POST request                      ║
║  2. Extrai JSON do body                           ║
║  3. Pydantic valida tipos                         ║
║  4. Executa lógica                                 ║
║  5. SQLAlchemy gera SQL                           ║
╚═════════════════════╤══════════════════════════════╝
                      │ TCP 5432
                      │
╔═════════════════════╧══════════════════════════════╗
║           DATABASE (PostgreSQL)                    ║
║  1. Recebe SQL                                    ║
║  2. Executa INSERT/UPDATE/SELECT                  ║
║  3. Retorna resultados                            ║
╚═════════════════════╤══════════════════════════════╝
                      │ TCP 5432
                      │
╔═════════════════════╧══════════════════════════════╗
║           SERVIDOR (FastAPI)                       ║
║  1. Cria dict Python com resultado                ║
║  2. json.dumps() → JSON text                       ║
║  3. HTTP 200 OK headers                           ║
║  4. Response body = JSON text                     ║
╚═════════════════════╤══════════════════════════════╝
                      │ HTTPS (encrypted)
                      │
╔═════════════════════╧══════════════════════════════╗
║           CLIENTE (Browser)                        ║
║  1. Recebe HTTP 200 response                      ║
║  2. JSON.parse() → JavaScript object              ║
║  3. JavaScript processa resposta                  ║
║  4. document.getElementById().innerHTML = ...    ║
║  5. Usuário vê mudança na tela                    ║
╚════════════════════════════════════════════════════╝
```

---

✅ **Próximo:** Veja [03-DATABASE.md](03-DATABASE.md) para entender o banco de dados em profundidade.

✅ **Depois:** Explore [04-BACKEND.md](04-BACKEND.md) para entender o FastAPI.
