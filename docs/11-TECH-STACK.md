# 11. Stack Tecnológico - BodyLog

## 📚 Visão Geral do Stack

BodyLog utiliza um stack moderno e minimalista:

```
┌──────────────────────┐
│   FRONTEND           │
│ HTML / CSS / JS      │
│ Vanilla (no libs)    │
│ Chart.js para gráf   │
└──────────────────────┘
         ↕
    [HTTPS/REST]
         ↕
┌──────────────────────┐
│   BACKEND            │
│ Python + FastAPI     │
│ SQLAlchemy ORM       │
│ Pydantic validation  │
└──────────────────────┘
         ↕
     [TCP 5432]
         ↕
┌──────────────────────┐
│   DATABASE           │
│ PostgreSQL 12+       │
│ Hosted: Render.com   │
└──────────────────────┘
```

---

## 🎨 FRONTEND Stack

### HTML5
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | HTML5 (standard moderno) |
| **Objetivo** | Markup estrutural |
| **Caraterísticas** | Semântico, acessível, responsive |
| **Arquivo** | index.html (único arquivo) |
| **Tamanho** | ~3KB minificado |

**Por que HTML5?**
- Standard web moderno
- Suporte nativo para `<form>`, `<input>`, etc
- Validação nativa de inputs (`required`, `type="date"`, etc)
- Acessibilidade com ARIA attributes

### CSS3
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | CSS3 (padrão moderno) |
| **Objetivo** | Estilos, layout, animações |
| **Layout** | Flexbox + CSS Grid |
| **Preprocessador** | Nenhum (CSS puro) |
| **Arquitetura** | BEM (Block Element Modifier) |

**Arquivos CSS:**
- `tokens.css` - Design tokens (cores, spacing, tipografia)
- `shell.css` - Layout principal (sidebar, topbar)
- `shared.css` - Classes utilities
- `app.css` - Componentes (buttons, cards, modals)
- `polish.css` - Refinamentos e responsividade

**Vantagens do CSS Puro:**
- ✅ Sem build step (SCSS → CSS)
- ✅ Sem dependências
- ✅ CSS moderno (variables, grid, flexbox) é poderoso
- ✅ Fácil fazer override e customização

### JavaScript (ES6+)
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | ES6+ (JavaScript moderno) |
| **Tipo** | Vanilla (sem React, Vue, Angular) |
| **Objetivo** | Lógica, DOM manipulation, requisições |
| **Bundler** | Nenhum (arquivos carregados direto) |
| **Transpiler** | Nenhum (browser nativo ES6) |

**Vantagens JS Vanilla:**
- ✅ Sem overhead de framework
- ✅ Sem build step
- ✅ Fácil fazer debugging (código é legível)
- ✅ Performance excelente
- ✅ Sem dependency fatigue

**Funcionalidades Modernas:**
- `fetch()` - Requisições HTTP nativa
- `async/await` - Código assíncrono legível
- `const/let` - Variáveis com escopo adequado
- `arrow functions` - Sintaxe concisa
- `template literals` - Strings interpoladas
- `Spread operator` - Operações em arrays/objects
- `Classes` - Programação orientada a objetos
- `Modules` - Importar/exportar (via `<script>` tags)

### Chart.js
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 4.4.1 |
| **Objetivo** | Criar gráficos interativos |
| **Tipos** | Line, Bar, Pie, Doughnut, Radar, etc |
| **Tamanho** | ~60KB |
| **Licença** | MIT (open source) |

**Uso no BodyLog:**
```javascript
// Exemplo: Gráfico de peso
const ctx = document.getElementById('chart-peso').getContext('2d')
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['2026-03-01', '2026-03-02', ...],
    datasets: [{
      label: 'Peso (kg)',
      data: [78.5, 78.3, 78.1, ...],
      borderColor: '#2F7AFF'
    }]
  }
})
```

### Google Fonts
| Aspecto | Descrição |
|---------|-----------|
| **Fontes Usadas** | DM Sans, DM Serif Display, DM Mono |
| **Carregamento** | CDN externo |
| **Fallbacks** | sans-serif, serif, monospace |

**CSS:**
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');

:root {
  --font-display: 'DM Serif Display', serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
}
```

---

## 🐍 BACKEND Stack

### Python 3.x
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 3.9+ (moderno) |
| **Objetivo** | Linguagem de programação |
| **Características** | Simples, legível, poderema |
| **Runtime** | CPython (padrão) |

**Por que Python?**
- ✅ Fácil aprender (sintaxe clara)
- ✅ Ecossistema rich (libs para tudo)
- ✅ Ótima para análise de dados
- ✅ fastAPI é muito moderno
- ✅ SQLAlchemy é padrão industria

### FastAPI
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 0.135.1 |
| **Tipo** | Web framework |
| **Paradigma** | REST API |
| **Speed** | Muito rápido (async/await nativo) |
| **Auto-docs** | Swagger, ReDoc grátis |

**FastAPI vs Outros:**
| Framework | Prós | Contras |
|-----------|------|---------|
| **FastAPI** | Rápido, moderno, async, auto-docs | Menos maduro que Django |
| **Django** | Maduro, ORM poderoso, batteries-included | Heavy, lento para APIs |
| **Flask** | Minimalista, simples | Pouca validação, asyncio ruim |

**FastAPI Escolhido porque:**
- ✅ Performance excelente (async/await)
- ✅ Validação automática (Pydantic)
- ✅ Auto-geração de docs (Swagger)
- ✅ Type hints modernos
- ✅ Perfect para REST API

### Uvicorn
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 0.41.0 |
| **Tipo** | ASGI Server |
| **Objetivo** | Executar aplicação FastAPI |
| **Concorrência** | Async nativo (uvloop) |

**ASGI vs WSGI:**
- **WSGI** (Django, Flask)  → Síncrono, thread por requisição
- **ASGI** (FastAPI) → Assíncrono, event loop, milhares de requisições

```bash
# Rodar FastAPI com Uvicorn
uvicorn main:app --port 8001 --reload
# INFO:     Application startup complete
```

### SQLAlchemy
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 2.0.48 |
| **Tipo** | ORM (Object-Relational Mapping) |
| **Objetivo** | Acesso ao banco de dados via objetos Python |
| **Databases** | PostgreSQL, MySQL, SQLite, etc |

**SQLAlchemy vs Raw SQL:**

**Raw SQL (evitar):**
```python
db.execute("INSERT INTO checkins (date, cd_medida, valor) VALUES (%s, %s, %s)", 
           ('2026-03-15', 1, 78.5))
# Vulnerável a SQL injection
# Código quebrado se mudar tabela
# Difícil manter
```

**SQLAlchemy ORM (fazer assim):**
```python
checkin = Checkin(date='2026-03-15', cd_medida=1, valor=78.5)
db.add(checkin)
db.commit()
# Seguro contra SQL injection
# Type-safe
# Fácil refatorar
```

### Pydantic
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 2.12.5 |
| **Tipo** | Data validation & serialization |
| **Objetivo** | Validar dados de entrada (request body) |

**Exemplo:**
```python
from pydantic import BaseModel

class CheckinRequest(BaseModel):
    date: str  # Obrigatório
    medidas: dict
    # Pydantic valida tipos automaticamente
    
# Se frontend enviar:
# {"date": "2026-03-15", "medidas": {...}}  → Válido ✓
# {"date": None, "medidas": {...}}          → Invalid ✗ TypeError
# {"date": "invalid", "medidas": {...}}     → Invalid ✗ DateError
```

### python-dotenv
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | Latest |
| **Tipo** | Variáveis de ambiente |
| **Objetivo** | Carregar `.env` file |

**Uso:**
```python
from dotenv import load_dotenv
import os

load_dotenv()  # Lê .env

DATABASE_URL = os.getenv("DATABASE_URL")
API_PORT = os.getenv("API_PORT", "8001")  # Com default
```

**Arquivo .env (não fazer commit):**
```
DATABASE_URL=postgresql://user:pass@localhost/bodylog
API_PORT=8001
FINANCE_PIN=1234
```

---

## 🛢️ DATABASE Stack

### PostgreSQL
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 12+ |
| **Tipo** | Relational Database |
| **Objetivo** | Armazenar dados persistentemente |
| **Licença** | Open Source (PostgreSQL License) |

**Características PostgreSQL:**
- ✅ ACID compliant (transações seguras)
- ✅ Foreign keys e constraints
- ✅ Índices para performance
- ✅ JSON support nativo
- ✅ Full-text search
- ✅ Escalável

**Por que PostgreSQL vs Outras?**
| Database | Prós | Contras |
|----------|------|---------|
| **PostgreSQL** | Robusto, ACID, open-source | Mais pesado que SQLite |
| **MySQL** | Popular, rápido | ACID fraco (MyISAM), menos features |
| **SQLite** | Leve, fácil | Sem concorrência, não escalável |
| **MongoDB** | Flexível, escalável | Sem ACID, sem JOINs |

**Escolhido PostgreSQL porque:**
- ✅ Robusto para produção
- ✅ ACID garantido
- ✅ Suporta constraints complexos
- ✅ Relacional (BOD)
- ✅ Free & open-source

### psycopg2
| Aspecto | Descrição |
|---------|-----------|
| **Versão** | 2.9.11 |
| **Tipo** | Database adapter |
| **Objetivo** | Driver Python ↔ PostgreSQL |
| **Pool** | Suportado via SQLAlchemy |

---

## 🚀 DEPLOYMENT Stack

### Render.com
| Aspecto | Descrição |
|---------|-----------|
| **Tipo** | Cloud platform (PaaS) |
| **Host** | Backend + Frontend + Database |
| **Scaling** | Automático |
| **Plano** | Free tier para experimental |

**Render hospeda:**
- **Frontend:** Arquivos estáticos (HTML/CSS/JS)
- **Backend:** Python/FastAPI (container)
- **Database:** PostgreSQL managed

**Alternativas:**
| Plataforma | Backend | Frontend | DB | Custo |
|-----------|---------|----------|-------|-------|
| **Render** | ✓ | ✓ | ✓ | Grátis + pago |
| **Heroku** | ✓ | ✓ | ✓ | Pago (descontinuado) |
| **AWS** | ✓ | ✓ | ✓ | Complexo, caro |
| **Vercel** | Serverless | ✓ | ✗ | Grátis para frontend |
| **Railway** | ✓ | ✓ | ✓ | Simples, pago |

**Escolhido Render porque:**
- ✅ Simples para começar
- ✓ Suporta Python nativo
- ✓ Free tier generoso
- ✓ Postgres included
- ✓ Auto-deploy via GitHub

---

## 🔄 Fluxo Integrado

```
┌─────────────────────────────────────┐
│  Usuário no Browser (Frontend)      │
│  HTML + CSS + JS Vanilla            │
│  Chart.js para gráficos            │
└────────────────┬────────────────────┘
                 │ fetch() HTTPS
                 │
┌────────────────┴────────────────────┐
│  Render.com - Backend Container     │
│  Python 3.x + FastAPI              │
│  Uvicorn (ASGI server)             │
│  SQLAlchemy (ORM)                  │
│  Pydantic (validation)             │
└────────────────┬────────────────────┘
                 │ psycopg2 TCP:5432
                 │
┌────────────────┴────────────────────┐
│  Render.com - PostgreSQL Database  │
│  Tabelas relacionais               │
│  Índices para performance          │
└─────────────────────────────────────┘
```

---

## 📦 Dependências Completas

### Frontend (Bundle tamanho)
```
HTML + CSS + JS Vanilla:    ~50 KB
Chart.js:                   ~60 KB
Google Fonts:               ~30 KB (cache)
─────────────────────
Total:                      ~140 KB
```

**Vantagem:** Carregamento muito rápido!

### Backend (requirements.txt)
```
fastapi==0.135.1                  Web framework
uvicorn==0.41.0                   ASGI server
SQLAlchemy==2.0.48                ORM
psycopg2-binary==2.9.11           PostgreSQL driver
pydantic==2.12.5                  Data validation
python-dotenv==latest             .env loading
starlette==0.52.1                 (depended by FastAPI)
anyio==4.12.1                     (depended by FastAPI)
```

**Total dependências:** 8 pacotes principais

---

## ✅ Checklist de Stack

- ✅ Frontend: HTML5 + CSS3 + ES6+ JS (vanilla)
- ✅ Gráficos: Chart.js 4.4.1
- ✅ Tipografia: Google Fonts (DM Sans/Serif/Mono)
- ✅ Backend: Python 3.x + FastAPI 0.135.1
- ✅ Server: Uvicorn 0.41.0
- ✅ ORM: SQLAlchemy 2.0.48
- ✅ Validation: Pydantic 2.12.5
- ✅ Database: PostgreSQL 12+
- ✅ Driver: psycopg2 2.9.11
- ✅ Env: python-dotenv
- ✅ Deploy: Render.com (Cloud)
- ✅ Protocol: HTTPS (seguro)
- ✅ API: REST JSON

---

✅ **Próximo:** Veja [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md) para rodar localmente.

✅ **Depois:** Explore [13-DEPLOYMENT.md](13-DEPLOYMENT.md) para deploy em produção.
