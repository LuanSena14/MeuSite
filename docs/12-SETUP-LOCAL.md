# 12. Setup Local - Como Rodar BodyLog na sua máquina

## 🎯 Objetivo

Permitir que você rode BodyLog **completamente** na sua máquina para desenvolvimento e teste, sem precisar da cloud.

---

## 📋 Pré-requisitos

Antes de começar, você precisa de:

### 1. Git
```bash
git --version
# Se não tiver, baxe do https://git-scm.com
```

### 2. Python 3.9+
```bash
python --version
# Se não tiver, baixe do https://www.python.org
# Na instalação, MARQUE: "Add Python to PATH"
```

### 3. PostgreSQL 12+
```bash
psql --version
# Se não tiver:
# Windows: https://www.postgresql.org/download/windows/
# macOS:   brew install postgresql
# Linux:   apt-get install postgresql
```

### 4. Editor de Texto
- VS Code (recomendado): https://code.visualstudio.com
- Sublime, Vim, Neovim, etc

---

## 🚀 Passo 1: Clone o Repositório

```bash
# Abra terminal

git clone https://github.com/seuusuario/MeuSite.git
# Ou descompacte o ZIP

cd MeuSite
```

Estrutura esperada:
```
MeuSite/
├── README.md
├── bodylog.sql
├── backend/
├── FrontEnd/
└── docs/
```

---

## 🗄️ Passo 2: Setup do Database

### 2.1 Criar Database PostgreSQL

```bash
# Conexão ao PostgreSQL
psql -U postgres

# Digite sua senha (configurada na instalação)
```

**No psql prompt:**
```sql
-- Criar database
CREATE DATABASE bodylog;

-- Listar databases
\l

-- Conectar (opcional)
\c bodylog

-- Sair
\q
```

### 2.2 Executar Script SQL (Popular Dados)

```bash
# No terminal (fora do psql)

psql -U postgres -d bodylog -f bodylog.sql

# Saída esperada:
# CREATE TABLE
# INSERT 0 ...
# etc
```

### 2.3 Verificar Data

```bash
psql -U postgres -d bodylog

# No psql:
SELECT * FROM unidade_medida LIMIT 5;
SELECT * FROM codigo_medida LIMIT 5;
\q
```

---

## 🐍 Passo 3: Setup do Backend

### 3.1 Criar Arquivo .env

Crie arquivo `backend/.env`:

```
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/bodylog
API_PORT=8001
FINANCE_PIN=1234
```

**Substituir:**
- `SUA_SENHA` → Senha que você colocou no PostgreSQL

### 3.2 Criar Virtual Environment

```bash
# Ir para pasta backend
cd backend

# Criar venv
python -m venv venv

# Ativar venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Verificar (deve ter (venv) no prompt)
which python  # ou where python no Windows
```

### 3.3 Instalar Dependências

```bash
# Ter venv ativado

pip install -r requirements.txt

# Saída esperada:
# Successfully installed fastapi-0.135.1 uvicorn-0.41.0 ...
```

### 3.4 Rodar Backend

```bash
# Ter venv ativado, estar no backend/

uvicorn main:app --reload --port 8001

# Saída esperada:
# INFO:     Uvicorn running on http://127.0.0.1:8001
# INFO:     Application startup complete
```

**Não feche este terminal!** Deixe rodando.

### 3.5 Testar Backend

Abra outro terminal:

```bash
# Teste se API está rodando
curl http://127.0.0.1:8001/api/checkins

# Saída esperada:
# []    (lista vazia, porque ainda não tem dados)
```

---

## 🎨 Passo 4: Setup do Frontend

Open novo terminal (deixe backend rodando):

```bash
# Neste terminal, volte para pasta FrontEnd
cd FrontEnd

# Abrir em navegador (pode arrastar arquivo)
# Opção 1: Double-click no index.html
# Opção 2: Abrir em terminal:

# macOS:
open index.html

# Windows (PowerShell):
Start-Process index.html

# Linux:
xdg-open index.html
```

**Resultado esperado:**
```
Browser abre BodyLog
Sidebar com: Overview, Body, Exercises, Goals, Finances
Home carrega com gráficos/cards
```

---

## 🔧 Passo 5: Verificar Conexão Frontend ↔ Backend

Abra **Developer Tools** (F12 no navegador):
- Aba **Network**
- Clique em "Body" na sidebar
- Procure requisição GET para `/api/checkins`
- Status deve ser **200 OK**

Se status for **0** ou erro:
1. ✅ Backend está rodando em `http://127.0.0.1:8001`?
2. ✅ CORS está habilitado em `main.py`?
3. ✅ DATABASE_URL correto em `.env`?

---

## ✅ Checklist Completo

- ✅ PostgreSQL rodando
- ✅ Database `bodylog` criado
- ✅ Tabelas populadas (bodylog.sql executado)
- ✅ Python venv ativado
- ✅ Backend rodando em `http://127.0.0.1:8001`
- ✅ Frontend abrindo em navegador
- ✅ Requisições HTTP funcionando (Network tab)

---

## 🐛 Troubleshooting

### Erro: "psql command not found"
**Solução:** PostgreSQL não está instalado ou não está no PATH
```bash
# macOS:
brew install postgresql

# Windows:
# Reinstalar PostgreSQL e marcar "Add to PATH"

# Depois:
psql --version
```

### Erro: "password authentication failed"
**Solução:** Senha do PostgreSQL incorreta
```bash
# Verificar se database:
psql -U postgres -l

# Se erro de senha, resetar:
# Windows: usar pg_admin (GUI)
# Linux: sudo -u postgres psql
```

### Erro: "No module named 'fastapi'"
**Solução:** Dependências não instaladas ou venv não ativo
```bash
# Verificar se venv está ativo (deve ter (venv) no prompt)
# Se não:
source venv/bin/activate  # ou venv\Scripts\activate no Windows

# Depois instalar:
pip install -r requirements.txt
```

### Erro: "Cannot GET /api/checkins" (404)
**Solução:** Backend não está rodando
```bash
# Terminal 1: verificar se está rodando
# Se não, rodar:
uvicorn main:app --reload --port 8001
```

### Aplication startup failed
**Solução:** Database_URL incorreto ou database não existe
```bash
# 1. Verificar .env:
cat backend/.env

# 2. Testar conexão:
psql "postgresql://postgres:senha@localhost:5432/bodylog"

# 3. Se não conectar:
# Criar database:
psql -U postgres -c "CREATE DATABASE bodylog"
```

### Gráficos não aparecem no Body
**Solução:** Dados não existem no banco
```bash
# Adicionar check-in manualmente:
# 1. Abrir Body
# 2. Clicar "Nova Medida"
# 3. Preencher dados (peso, gordura, altura)
# 4. Clicar Salvar
# 5. Gráfico deve aparecer
```

---

## 📱 Testar no Celular (Mesma Rede)

### 1. Descobre IP da Sua Máquina

```bash
# Windows (PowerShell):
ipconfig  # Procurar "IPv4 Address", ex: 192.168.1.100

# macOS/Linux:
ifconfig  # Procurar "inet", ex: 192.168.1.100
```

### 2. Atualize API URL

Em `FrontEnd/shared/js/api.js`:

```javascript
// Mudar isto:
const API = "https://meusite-3.onrender.com"

// Para:
const API = "http://192.168.1.100:8001"  // Seu IP
```

### 3. Abra no Celular

```
http://192.168.1.100/index.html
# (coloque o IP da sua máquina)
```

---

## 🧹 Limpar Dados (Reset)

### Opção 1: Deletar Database

```bash
psql -U postgres

# No psql:
DROP DATABASE bodylog;
CREATE DATABASE bodylog;
\q

# Depois, re-executar script:
psql -U postgres -d bodylog -f bodylog.sql
```

### Opção 2: Deletar Tabelas Específicas

```bash
psql -U postgres -d bodylog

# Deletar check-ins:
DELETE FROM checkins;

# Deletar treinos:
DELETE FROM entrada_exercicio;

# etc
\q
```

---

## 💾 Backup de Dados

### Exportar Database

```bash
# Fazer backup:
pg_dump -U postgres bodylog > backup_bodylog.sql

# Restaurar de backup:
psql -U postgres -d bodylog -f backup_bodylog.sql
```

---

## 🚀 Próximos Passos

Agora que tudo está rodando localmente:

1. **Explore o código:**
   - Abra `backend/main.py` e leia as rotas
   - Abra `FrontEnd/pages/body/body.js` e entenda o padrão
   - Abra `FrontEnd/shared/css/tokens.css` e veja os design tokens

2. **Faça uma mudança pequena:**
   - Mude a cor primária em `tokens.css`
   - Recarregue o navegador (Ctrl+Shift+R para cache limpo)
   - Veja a mudança!

3. **Adicione um novo campo:**
   - Veja [14-CREATING-NEW-PAGE.md](14-CREATING-NEW-PAGE.md)

4. **Entenda a lógica:**
   - Veja [04-BACKEND.md](04-BACKEND.md) para FastAPI
   - Veja [05-FRONTEND.md](05-FRONTEND.md) para JS

---

✅ **Próximo:** Veja [13-DEPLOYMENT.md](13-DEPLOYMENT.md) para publicar em produção.

✅ **Depois:** Explore [14-CREATING-NEW-PAGE.md](14-CREATING-NEW-PAGE.md) para adicionar features.
