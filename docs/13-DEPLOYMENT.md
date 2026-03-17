# 13. Deployment em Produção - Publicar BodyLog

## 🚀 Objetivo

Publicar BodyLog em produção (cloud) para que qualquer pessoa acesse via URL pública.

---

## 🌐 Plataforma: Render.com

BodyLog está hospedado em **Render.com**, serviço gratuito que oferece:
- ✅ Backend (Python/FastAPI)
- ✅ Frontend (Static files)
- ✅ PostgreSQL managed
- ✅ Auto-deploy via GitHub
- ✅ SSL/HTTPS automático
- ✅ Free tier generoso

### URLs em Produção
- **Frontend:** https://meusite-3.onrender.com
- **Backend API:** https://meusite-3.onrender.com/api/*
- **Database:** Hosted em Render (não público)

---

## 🔐 Variáveis de Ambiente em Produção

As variáveis de ambiente **NÃO** devem estar no código, mas sim como secrets no Render:

### No Render Dashboard

Vá para **Settings → Environment** do seu serviço:

```
DATABASE_URL = postgresql://user:pass@render-host:5432/bodylog_prod
API_PORT = 8001
FINANCE_PIN = 1234
```

**Importante:**
- `DATABASE_URL` → URL do PostgreSQL no Render
- Nunca colocar `.env` em Git (adicionar ao `.gitignore`)
- Never hardcode secrets no código

### .gitignore

```
.env
__pycache__/
*.pyc
venv/
node_modules/
.DS_Store
```

---

## 📦 Deploy via GitHub

### Pré-requisito: Código no GitHub

```bash
# No seu repo local:
git remote add origin https://github.com/seuusername/bodylog.git

git add .
git commit -m "Initial commit"
git push -u origin main
```

### Conectar Render com GitHub

1. Log in no **Render.com**
2. Clique em **New → Web Service**
3. Selecione **Deploy from GitHub**
4. Conecte sua conta GitHub (authorize)
5. Selecione repositório `bodylog`
6. Preencha:
   - **Name:** `bodylog-backend`
   - **Runtime:** Python 3
   - **Build command:** `pip install -r backend/requirements.txt`
   - **Start command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### Auto-deploy

Agora, sempre que fizer `git push`:
1. GitHub notifica Render
2. Render puxa código novo
3. Render roda **Build command**
4. Render inicia serviço
5. Site atualizado em ~2 minutos

---

## 🗄️ Database Setup em Produção

### Criar PostgreSQL no Render

1. No **Render Dashboard**
2. Clique **New → PostgreSQL**
3. Preencha:
   - **Name:** `bodylog-db`
   - **Database:** `bodylog`
   - **User:** `postgres` (padrão)
4. Copie **Internal Database URL** e **External Database URL**

### Rodار Script SQL em Produção

```bash
# Localmente, usar External URL:
psql "postgresql://user:pass@EXTERNAL-HOST:5432/bodylog" < bodylog.sql

# Ou via Render CLI:
# (mais seguro, conecta via Internal)
```

---

## 📤 Deploy Frontend (Static Files)

Se frontend está separado:

### Option 1: Servir via FastAPI

Backend já serve static files:
```python
# main.py
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="FrontEnd", html=True), name="frontend")
```

### Option 2: Deploy separado (Vercel, Netlify)

Se quiser frontend em CDN separado:

**Vercel:**
```bash
npm install -g vercel

cd FrontEnd
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli

cd FrontEnd
netlify deploy --prod --dir .
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Automático)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main, master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Render
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"serviceId": "${{ secrets.RENDER_SERVICE_ID }}"}' \
            https://api.render.com/v1/services/redeploy
```

### Sem CI/CD (Manual)

A cada mudança, fazer:
```bash
git add .
git commit -m "Fix: description"
git push origin main

# Render auto-redeploy via webhook
# Esperar ~2 minutos
```

---

## 🧪 Testar em Produção

```bash
# Testar API
curl https://meusite-3.onrender.com/api/checkins

# Testar Frontend
# Abrir https://meusite-3.onrender.com no navegador
```

---

## 🔐 PIN Finance em Produção

### Setando PIN

1. Render Dashboard → Environment
2. Adicionar: `FINANCE_PIN=4567`
3. No código:

```python
# main.py
import os

FINANCE_PIN = os.getenv("FINANCE_PIN", "1234")

@app.post("/api/finances/validate-pin")
async def validate_pin(pin: str):
    if pin == FINANCE_PIN:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=401, detail="Invalid PIN")
```

### No Frontend

```javascript
// fin-core.js
const PIN_STORED = localStorage.getItem('finance_pin')

async function validatePin(pin) {
    const resp = await fetch('/api/finances/validate-pin', {
        method: 'POST',
        body: JSON.stringify({pin})
    })
    
    if (resp.ok) {
        localStorage.setItem('finance_pin', pin)
        return true
    }
    return false
}
```

---

## 🚨 Monitoramento & Alerts

### Metrics no Render

- **CPU usage**
- **Memory usage**
- **Request count**
- **Response time**
- **Error rate**

Acessar em **Render Dashboard → Logs & Metrics**

### Alertas Recomendados

- CPU > 80%
- Memory > 90%
- 5xx errors > 1%
- Uptime < 99%

---

## 💾 Backup & Recovery

### Backup Automático (PostgreSQL)

Render faz backup automático daily. Para acessar:

1. **Render Dashboard**
2. **PostgreSQL service → Backups**
3. Download`.sql` file

### Restaurar de Backup

```bash
psql "$(your-database-url)" < backup.sql
```

### Manual Backup

```bash
# Usar pg_dump:
pg_dump "$(your-database-url)" > backup.sql

# Ou via Render external connection:
pg_dump postgresql://user:pass@host:5432/bodylog > backup.sql
```

---

## 🔄 Rollback (Desfazer Mudança)

Se deployment quebrou:

### Opção 1: Revert Git

```bash
git log  # Ver commits

git revert <commit-hash>  # Desfaz um commit

git push  # Auto-redeploy no Render
```

### Opção 2: Redeploy Versão Anterior

```bash
git checkout <previous-tag>
git push --force

# Render redeployará versão anterior
```

### Opção 3: Manual no Render Dashboard

1. **Service → Environment**
2. Reverter variáveis de ambiente
3. Ou deletar container e re-build

---

## 📊 Performance em Produção

### Otimizações Recomendadas

**Backend (FastAPI):**
```python
# main.py

# 1. Adicionar caching
from fastapi_cache2 import FastAPICache2
from fastapi_cache2.backends.redis import RedisBackend

# 2. Adicionar compression
from fastapi.middleware.gzip import GZIPMiddleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# 3. Connection pooling (SQLAlchemy já faz)
# 4. Índices no database (verificar)
```

**Frontend:**
```javascript
// api.js

// 1. Cache com TTL
let cachedData = null
let cachedAt = 0

async function fetchWithCache(endpoint, ttl = 60000) {
  const now = Date.now()
  if (cachedData && (now - cachedAt) < ttl) {
    return cachedData
  }
  
  cachedData = await _apiFetch(endpoint)
  cachedAt = now
  return cachedData
}

// 2. Lazy loading
// 3. Code splitting por página
```

---

## 🛡️ Segurança em Produção

### HTTPS
- ✅ Render fornece SSL automático
- ✅ Todos requests são encrypted

### CORS
```python
# main.py (permitir apenas produção)

allowed_origins = [
    "https://meusite-3.onrender.com",
    "https://bodylog.com",  # Se tiver domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)
```

### Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter

@app.get("/api/checkins")
@limiter.limit("100/minute")
async def get_checkins(request: Request):
    ...
```

### SQL Injection Protection
```python
# SQLAlchemy ORM já previne (não use queries raw!)

# ✓ SEGURO:
checkin = db.query(Checkin).filter(Checkin.id == id).first()

# ✗ PERIGOSO:
db.execute(f"SELECT * FROM checkins WHERE id = {id}")
```

---

## 📈 Escalabilidade Futura

Se tráfego crescer muito:

### Horizontal Scaling
```
1 Backend → 2 Backends → Behind Load Balancer
```

No Render:
1. Aumentar **Replica count** (múltiplas instâncias)
2. Render automaticamente load balança

### Database Scaling
```
1 Database → Read replicas + Primary
```

### Cache Layer
```
Backend → Redis Cache → Database
```

---

## 📋 Checklist de Deploy

- ✅ Código no GitHub
- ✅ `.env` adicionado ao `.gitignore`
- ✅ Variáveis de ambiente no Render
- ✅ DATABASE_URL correto
- ✅ Backend rodando e tests passando
- ✅ Frontend carregando
- ✅ HTTPS funcionando
- ✅ API endpoints respondendo (200 OK)
- ✅ Gráficos carregando dados
- ✅ Backup configurado
- ✅ Monitoramento ativado

---

✅ **Próximo:** Veja [14-CREATING-NEW-PAGE.md](14-CREATING-NEW-PAGE.md) para adicionar novas features.

✅ **Depois:** Explore [16-MAINTENANCE.md](16-MAINTENANCE.md) para operações rotineiras.
