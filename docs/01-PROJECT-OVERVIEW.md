# 1. Documentação Geral do Projeto - BodyLog

## 📌 O que é BodyLog?

**BodyLog** é um dashboard pessoal web que ajuda você a acompanhar e otimizar quatro áreas importantes da vida:

| Área | O que faz | Exemplo |
|------|-----------|---------|
| **Body** | Registra métricas corporais e monitora saúde física | Peso, gordura, músculo, altura, circunferências |
| **Exercises** | Registra treinos e analisa frequência e distribuição | Qual grupo muscular você treina mais? Quantos treinos por semana? |
| **Goals** | Sistema de metas com pontuação mensal e KPIs | Atingir 10.000 passos diários, beber 3L de água, etc |
| **Finances** | Organizador financeiro com categorias hierárquicas | Receitas, despesas, investimentos, orçamentos |

---

## 🎯 Problema que ele resolve

**Problema:** Falta de integração entre diferentes aspectos da vida pessoal  
Em aplicações convencionais, você teria:
- Um app para peso/métricas (ex: MyFitnessPal)
- Outro para exercícios (ex: Strong App)
- Outro para metas (ex: Notion)
- Outro para finanças (ex: Excel)

**Solução:** BodyLog integra tudo em um único lugar, permitindo:
- ✅ Análise cruzada entre saúde e finanças (treino vs gasto com academia)
- ✅ Uma única interface coerente
- ✅ Dados privados sob seu controle (não vendidos para terceiros)
- ✅ Customizável conforme suas necessidades

---

## 👥 Público-Alvo

BodyLog foi criado para **pessoas que querem otimizar sua vida de forma integrada**:

1. **Entusiastas de Saúde & Fitness**
   - Querem rastrear métricas corporais detalhadamente
   - Analisam padrões de treino
   - Preocupam-se com composição corporal

2. **Planejadores Financeiros Pessoais**
   - Querem orçamento detalhado
   - Rastreiam investimentos
   - Categorizam despesas
   - Planejam viagens/grandes gastos

3. **Pessoas Produtivas (Goal-Oriented)**
   - Estabelecem metas pessoais
   - Rastreiam progresso diário
   - Gostam de visualizar KPIs e scorecards

4. **Desenvolvedores & Tech-Savvy**
   - Querem controle total sobre dados
   - Interessados em código aberto
   - Gostam de customizar ferramentas

---

## ✨ Funcionalidades Principais

### 1️⃣ HOME - Overview & Dashboard

**O que é:**  
Página inicial que agrega KPIs (Key Performance Indicators) de todas as seções.

**Funcionalidades:**
- Cards com últimos valores de cada seção
- Gráficos resumidos
- Timestamp da última atualização
- Quick access para ações principais

**Dados que mostra:**
```
┌─────────────────────────────────────────────┐
│ HOME - Overview                             │
├─────────────────────────────────────────────┤
│ Body:      Últimas métricas (peso, IMC)    │
│ Exercises: Total de treinos esse mês       │
│ Goals:     Score mensal atual              │
│ Finances:  Balanço mensal (Receita-Despesa)│
└─────────────────────────────────────────────┘
```

---

### 2️⃣ BODY - Métricas Corporais & Check-ins

**O que é:**  
Sistema de rastreamento de saúde física com check-ins periódicos.

**Funcionalidades Principais:**

#### ✓ Check-in de Métricas
- Formulário para inserir medidas (peso, gordura, músculo, altura, circunferências, etc)
- Modal com campos agrupados por categoria
- Validação básica de dados
- Salvamento automático com timestamp

#### ✓ Cálculos Biométricos Automáticos
O sistema calcula automaticamente a partir dos valores inseridos:
- **IMC** (Índice de Massa Corporal) = peso / (altura²)
- **% Gordura** = (gordura / peso) × 100
- **FFMI** (Fat-Free Mass Index) = massa_sem_gordura / (altura²)
- **Diagnóstico de Saúde** com cores (risco, atenção, saudável, ótimo)

#### ✓ Visualizações
- **Gráfico de Peso**: Série temporal com tendência
- **Gráfico de Composição**: Peso total vs Gordura vs Músculo
- **Gráfico de Métricas**: Permite selecionar qual métrica visualizar

#### ✓ Histórico Completo
- Timeline de todos os check-ins
- Filtragem por data
- Comparação entre datas
- Cálculo de variação periodo (Δ)

**Exemplo de Check-in:**
```
Data: 2026-03-15
Peso: 78.5 kg
Gordura: 18.2 kg
Músculo: 35.4 kg
Altura: 1.78 m
Circunferência Abdominal: 82 cm

Sistema calcula automaticamente:
├── IMC: 24.8 (Saudável ✓)
├── % Gordura: 23.2% (Ótimo ✓)
└── FFMI: 22.3 (Muito bom ✓)
```

---

### 3️⃣ EXERCISES - Registro & Análise de Treinos

**O que é:**  
Sistema de registro de treinos com análise de frequência e distribuição.

**Funcionalidades Principais:**

#### ✓ Registro de Treino
- Modal com campos: Grupo muscular, Exercício, Duração, Esforço (1-10)
- Estrutura hierárquica (Peito → Supino, Supino Inclinado, etc)
- Timestamp automático

#### ✓ Dashboards de Análise
- **Frequência**: Quantos treinos por semana/mês
- **Distribuição por Grupo Muscular**: Pie chart mostrando qual grupo recebe mais atenção
- **Histórico**: Timeline com todos os treinos
- **Tendências**: Comportamento ao longo do tempo (está treinando mais/menos?)

#### ✓ Filtros & Buscas
- Filtrar por período (data de-até)
- Filtrar por grupo muscular
- Filtrar por exercício específico

**Exemplo de Dashboard:**
```
Treinos neste mês: 15

Distribuição por Grupo:
├── Peito: 4 treinos (27%)
├── Costas: 4 treinos (27%)
├── Pernas: 3 treinos (20%)
├── Ombros: 2 treinos (13%)
└── Braços: 2 treinos (13%)

Frequência: 3.75 treinos/semana
```

---

### 4️⃣ GOALS - Metas & Pontuação Mensal

**O que é:**  
Sistema de goals (metas) com pontuação mensal seguindo metodologia KPI.

**Funcionalidades Principais:**

#### ✓ Registro de Metas
- Criar metas diárias/semanais/mensais
- Categorias (Saúde, Produtividade, Entretenimento, etc)
- Descrição e objetivo

#### ✓ Daily Check-in
- Cada dia, marcar se atingiu a meta (Sim/Não)
- Interface simples: checkbox por dia

#### ✓ Pontuação Mensal
- **Score de Aderência**: % de dias em que atingiu a meta
- **Score Ponderado**: Alguns goals valem mais pontos que outros
- **Score Total Mensal**: Consolidação de todos os goals

#### ✓ Visualizações
- **Heatmap**: Calendário mostrando dias com/sem sucesso (estilo GitHub contributions)
- **Gráfico de Score**: Evolução mensal
- **KPIs**: Estatísticas (dias atingidos, taxa de sucesso, melhor sequência, etc)

**Exemplo:**
```
Goal: "Beber 3L de água"
Mês: Março/2026

┌─────────────────────────────────────────┐
│ Qui Sex Sab Dom Seg Ter Qua             │
│  2   3   4   5   6   7   8              │
│ ✓  ✓  ✓  ✗  ✓  ✓  ✓                    │
├─────────────────────────────────────────┤
│ Dias atingidos: 20 de 31                │
│ Taxa de sucesso: 64.5%                  │
│ Melhor sequência: 7 dias                │
└─────────────────────────────────────────┘
```

---

### 5️⃣ FINANCES - Organizador Financeiro

**O que é:**  
Sistema completo de organização financeira pessoal/familiar com categorias hierárquicas.

**Funcionalidades Principais:**

#### ✓ Categorias Hierárquicas
Estrutura em árvore:
```
RECEITA
├── Salário
├── Bônus
└── Outras Rendas

DESPESA
├── Recorrente (Contas fixas mensais)
├── Variável (Gastos do mês)
├── Pontual (Anuais/Programadas)
└── Caixinha (Reservas de emergência)

INVESTIMENTO
├── Emergency CDB
├── Nu Invest (Patrimônio)
├── FGTS
└── Caminhos
```

#### ✓ Módulo de Lançamentos
- Registar receitas/despesas/investimentos
- Campos: Data, Categoria, Valor, Descrição, Forma pagamento
- Filtros por período, categoria, tipo
- Edição e exclusão

#### ✓ Módulo de Orçamento
- Definir orçamento por categoria (mensal ou anual)
- Acompanhar: Orçado vs Realizado
- Alertas quando ultrapassar limite
- Análise de variação

#### ✓ Módulo de Investimentos
- Snapshots periódicos de saldo
- Acompanhar crescimento do patrimônio
- Visualizar alocação por ativo
- Rentabilidade

#### ✓ Módulo de Viagens
- Associar lançamentos a uma viagem
- Cálculo automático do custo total
- Análise por tipo de gasto
- Comparação entre viagens

#### ✓ Indicadores & Dashboards
- Taxa de poupança mensal
- Proporção Receita/Despesa
- Saúde financeira geral
- Projeção de patrimônio

---

## 🏗️ Arquitetura Geral do Sistema

```
┌──────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Browser)                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  HTML + CSS + JavaScript Vanilla (Sem Frameworks)  │ │
│  │  index.html (1 arquivo; todas páginas dinâmicas)   │ │
│  │  shared/ (CSS, JS helpers, componentes)            │ │
│  │  pages/ (Body, Exercises, Goals, Finances, Home)   │ │
│  └────────────────────────────────────────────────────┘ │
│                           ↕                              │
│                    HTTP/HTTPS (REST)                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                      INTERNET                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Python FastAPI (Backend)                 │ │
│  │                                                    │ │
│  │  main.py (rotas HTTP)                             │ │
│  │  models.py (estrutura de dados com SQLAlchemy)     │ │
│  │  database.py (conexão com PostgreSQL)              │ │
│  │                                                    │ │
│  │  Endpoints:                                        │ │
│  │  ├── /api/checkins (Body)                         │ │
│  │  ├── /api/exercicios (Exercises)                  │ │
│  │  ├── /api/goals/* (Goals)                         │ │
│  │  └── /api/financas/* (Finances)                   │ │
│  └────────────────────────────────────────────────────┘ │
│                           ↕                              │
│                    TCP 5432 (SQL)                       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │      PostgreSQL (Database)                         │ │
│  │                                                    │ │
│  │  Tabelas:                                          │ │
│  │  ├── unidade_medida (kg, cm, %)                    │ │
│  │  ├── codigo_medida (Peso, Gordura, FFMI, etc)     │ │
│  │  ├── checkins (Histórico de check-ins)            │ │
│  │  ├── codigo_exercicio (Grupos e exercícios)       │ │
│  │  ├── entrada_exercicio (Histórico de treinos)     │ │
│  │  ├── codigo_goals (Metas disponíveis)             │ │
│  │  ├── entrada_goals (Histórico de progresso)       │ │
│  │  ├── codigo_financa (Categorias financeiras)      │ │
│  │  └── lancamento_financeiro (Transações)           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Fluxo Básico de Uma Ação

**Exemplo: Fazer um check-in de peso**

```
1. Usuário abre BodyLog → index.html carrega
2. Usuário clica em "Body" na navegação
3. JavaScript carrega pages/body/body.html dinamicamente
4. Usuário clica em "Nova Medida"
5. Modal (checkin-modal.html) abre
6. Usuário preenche: Peso=78.5, Gordura=18.2, etc
7. Usuário clica "Salvar"
8. JavaScript (checkin.js) coleta dados e chama api.js
9. api.js faz POST para https://meusite-3.onrender.com/api/checkins
10. Backend (main.py) recebe requisição
11. Backend valida dados
12. Backend insere em database (PostgreSQL)
13. Backend retorna JSON com sucesso
14. Frontend mostra toast "✓ Salvo com sucesso!"
15. Frontend recarrega o gráfico de Peso
```

---

## 📁 Estrutura de Pastas do Projeto

```
MeuSite/
│
├── README.md                          ← Guia inicial (este arquivo)
├── bodylog.sql                        ← Script SQL para recriar banco do zero
│
├── backend/                           ← Código do servidor Python
│   ├── main.py                        ← Rotas da API (FastAPI)
│   ├── database.py                    ← Conexão com PostgreSQL
│   ├── models.py                      ← Modelos ORM (SQLAlchemy)
│   ├── requirements.txt                ← Dependências Python (pip install -r)
│   ├── __pycache__/                   ← Cache compilado (gerar automaticamente)
│   └── Docs/                          ← Documentação adicional
│
├── FrontEnd/                          ← Código do cliente (HTML/CSS/JS)
│   │
│   ├── index.html                     ← ÚNICO arquivo HTML (SPA)
│   ├── style.css                      ← Entrada CSS (carrega app.css + polish.css)
│   │
│   ├── shared/                        ← Recursos compartilhados entre páginas
│   │   ├── js/
│   │   │   ├── nav.js                 ← Navegação entre seções
│   │   │   ├── api.js                 ← Chamadas HTTP para backend
│   │   │   └── app.js                 ← Inicialização da aplicação
│   │   │
│   │   └── css/
│   │       ├── app.css                ← Estilos principais
│   │       ├── polish.css             ← Refinamentos visuais
│   │       └── base/
│   │           ├── shared.css         ← Classes utilities globais
│   │           ├── shell.css          ← Layout principal (sidebar, topbar)
│   │           └── tokens.css         ← Variáveis CSS e design tokens
│   │
│   └── pages/                         ← Codigo por página (HTML + JS + CSS juntos)
│       │
│       ├── home/                      ← Seção Overview
│       │   ├── home.html
│       │   ├── home.js
│       │   └── home.css
│       │
│       ├── body/                      ← Seção Body (Métricas)
│       │   ├── body.html
│       │   ├── body.js
│       │   ├── body.css
│       │   ├── checkin.js             ← Formuláio de check-in
│       │   └── checkin-modal.html     ← Modal do formulário
│       │
│       ├── exercises/                 ← Seção Exercises (Treinos)
│       │   ├── exercises.html
│       │   ├── exercises.js
│       │   ├── exercises.css
│       │   └── exercise-modal.html    ← Modal de novo treino
│       │
│       ├── goals/                     ← Seção Goals (Metas)
│       │   ├── goals.html
│       │   ├── goals.js
│       │   ├── goals.css
│       │   └── goals-modal.html       ← Modal de nova meta
│       │
│       └── finances/                  ← Seção Finances (Financeiro)
│           ├── finances.html
│           ├── finances.css
│           ├── fin-core.js            ← Lógica principal
│           ├── fin-overview.js        ← Dashboard
│           ├── fin-lancamentos.js     ← Transações
│           ├── fin-investimentos.js   ← Investimentos
│           ├── fin-modals.js          ← Modais
│           └── fin-viagens.js         ← Gestão de viagens
│
├── docs/                              ← 📍 DOCUMENTAÇÃO TÉCNICA (Este arquivo!)
│   ├── 00-INDEX.md
│   ├── 01-PROJECT-OVERVIEW.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-DATABASE.md
│   └── ... (mais arquivos)
│
└── .env                               ← Variáveis de ambiente (não commitar)
    DATABASE_URL=postgresql://user:pass@host:5432/db
    API_PORT=8001
```

---

## 🛠️ Stack Tecnológica Utilizada

### Frontend (Cliente)
| Tecnologia | Versão | Uso |
|---------------|--------|-----|
| **HTML5** | Nativa | Markup e estrutura |
| **CSS3** | Nativa | Estilos, layout flexbox/grid, animações |
| **JavaScript** | ES6+ | Lógica, DOM manipulation, fetch API |
| **Chart.js** | 4.4.1 | Gráficos (peso, exercícios, goals, finanças) |
| **Google Fonts** | Nativa | Tipografia (DM Sans, DM Serif, DM Mono) |

**Nota:** Zero frameworks (React, Vue, Angular). Apenas JavaScript vanilla para máxima simplicidade e zero build step.

### Backend (Servidor)
| Tecnologia | Versão | Uso |
|--------------|--------|-----|
| **Python** | 3.x | Linguagem de programação |
| **FastAPI** | 0.135.1 | Framework web para API REST |
| **Uvicorn** | 0.41.0 | ASGI server (roda FastAPI) |
| **SQLAlchemy** | 2.0.48 | ORM para acesso ao banco |
| **Pydantic** | 2.12.5 | Validação de dados HTTP |
| **python-dotenv** | Latest | Carregamento de .env |

### Database (Dados)
| Tecnologia | Versão | Uso |
|------------|---------|-----|
| **PostgreSQL** | 12+ | Banco relacional |
| **psycopg2** | 2.9.11 | Driver Python para PostgreSQL |

### Deployment & Hosting
| Serviço | Uso |
|----------|-----|
| **Render.com** | Hospeda backend (Python/FastAPI) e frontend (estático) |
| **GitHub** | Controle de versão (opcional) |

---

## 🔄 Fluxo de Funcionamento da Aplicação

### No Primeiro Acesso

```
Usuário acessa https://meusite-3.onrender.com
           ↓
Render entrega index.html + CSS + JS
           ↓
JavaScript carrega (nav.js, api.js, app.js)
           ↓
app.js executa init()
           ↓
Página Home carrega
           ↓
Aplicação pronta para usar
```

### Em Operação Normal

```
┌─────────────────────────────────────────────────────────┐
│ Usuário interage com página (clica botão, preenche form)│
└────────────────────┬────────────────────────────────────┘
                     ↓
    ┌───────────────────────────────────────┐
    │ JavaScript do pages/*.js captura evento│
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────┐
    │ Chama função em api.js (ex: postCheckin)
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────┐
    │ api.js faz fetch() para backend      │
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────┐
    │ Backend (FastAPI) processa requisição │
    │ - Valida dados                        │
    │ - Acessa banco de dados              │
    │ - Retorna JSON                        │
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────┐
    │ Frontend recebe resposta JSON        │
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────┐
    │ JavaScript atualiza DOM (interface)   │
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────┐
    │ Usuário vê mudança na tela            │
    └───────────────────────────────────────┘
```

---

## 🧠 Como Frontend, Backend e Banco Interagem

### Exemplo Real: Salvando um Check-in de Peso

**1. FRONTEND (Usuario interface)**
```javascript
// pages/body/checkin.js

document.getElementById('btn-salvar').addEventListener('click', async () => {
  const date = document.getElementById('data').value;      // "2026-03-15"
  const peso = parseFloat(document.getElementById('peso').value); // 78.5
  const gordura = parseFloat(document.getElementById('gordura').value); // 18.2
  
  // Chama função do api.js
  await postCheckin(date, {
    peso: peso,
    gordura: gordura,
    // ... outras medidas
  });
  
  // Mostra mensagem de sucesso
  showAppToast('✓ Check-in salvo com sucesso!');
  
  // Recarrega os gráficos
  await refreshBodyGraphs();
});
```

**2. BACKEND (Recepção e processamento)**
```python
# main.py

@app.post("/api/checkins")
async def criar_checkin(request: dict):
  date = request["date"]
  medidas = request["medidas"]
  
  # Valida dados
  if not date or not medidas:
    raise HTTPException(status_code=400, detail="Dados inválidos")
  
  # Insere no banco (via SQLAlchemy ORM)
  db = Session()
  try:
    for codigo_medida, valor in medidas.items():
      checkin = Checkin(
        date=date,
        cd_medida=codigo_medida,
        valor=valor
      )
      db.add(checkin)
    
    db.commit()
    return {"status": "success", "mensagem": "Check-in salvo"}
  finally:
    db.close()
```

**3. DATABASE (Armazenamento persistente)**
```sql
-- PostgreSQL

INSERT INTO checkins (date, cd_medida, valor)
VALUES ('2026-03-15', 1, 78.5);       -- peso

INSERT INTO checkins (date, cd_medida, valor)  
VALUES ('2026-03-15', 3, 18.2);       -- gordura

-- Resultado: agora temos registro persistente no banco
```

**4. FRONTEND (Recebimento e atualização)**
```javascript
// api.js retorna sucesso

const resposta = await postCheckin(date, medidas);

if (resposta.status === 'success') {
  // Recarrega dados do banco
  const todosCheckins = await fetchCheckins();
  
  // Reconstrói gráfico de peso com novos dados
  rebuildChartPeso(todosCheckins);
  
  // Atualiza a tabela de histórico
  renderHistoricoCheckins(todosCheckins);
}
```

---

## 📊 Descrição Detalhada de Cada Pasta e Arquivo

### Backend

#### `main.py` (Rotas da API)
- Define todos os endpoints HTTP
- Recebe requisições do frontend
- Valida dados com Pydantic
- Acessa banco via models.py
- Retorna JSON

#### `database.py` (Conexão com Banco)
- Carrega variável de ambiente `DATABASE_URL`
- Cria engine SQLAlchemy
- Session factory para queries

#### `models.py` (Estrutura de Dados)
- Define tabelas como classes Python (ORM)
- Relacionamentos entre tabelas
- Validações em nível de banco

#### `requirements.txt` (Dependências)
- Lista de pacotes Python necessários
- `pip install -r requirements.txt` instala tudo

---

### Frontend

#### `index.html` (Aplicação SPA)
- **SPA = Single Page Application**
- Único arquivo HTML
- Carrega CSS (app.css + polish.css)
- Carrega JS (nav.js, api.js, app.js, plus páginas)
- Contém estrutura base: sidebar, topbar, main-content, modals

#### `shared/js/nav.js` (Navegação)
- Função `switchSection(section)` - muda de página
- Variáveis globais `DEFAULT_SECTION`, `SECTION_META`, `_activeSection`
- Event listeners para botões da sidebar

#### `shared/js/api.js` (Comunicação com Backend)
- Helper `_apiFetch(path, options)` - fetch com error handling
- Funções de API: `fetchCheckins()`, `postCheckin()`, `fetchExercicios()`, etc
- Endpoint: `const API = "https://meusite-3.onrender.com"`

#### `shared/js/app.js` (Inicialização)
- `loadHTML(file, targetId)` - carrega HTML dinamicamente (pages/*/page.html)
- `showAppToast()` - notificação na tela
- Event listener para `sectionchange`
- Cache com TTL (45 segundos) para evitar requisições repetidas

#### `shared/css/app.css` (Estilos Principais)
- Importa base/ (shared.css, shell.css, tokens.css)
- Estilos de components (buttons, cards, modals, etc)

#### `shared/css/polish.css` (Refinamentos)
- Ajustes visuais adicionais
- Responsividade mobile
- Efeitos hover
- Animações

---

### Frontend - Pages

Cada página segue o padrão:
```
pages/NOME/
├── NOME.html              ← Template HTML
├── NOME.js                ← Lógica JavaScript
└── NOME.css               ← Estilos CSS
```

#### `pages/home/` (Overview/Dashboard)
- `home.js`: `initHomeSection()` - carrega KPIs de todas as seções

#### `pages/body/` (Body/Métricas)
- `body.js`: `initBodySection()`, charts de peso/composição/métricas
- `checkin.js`: `submitCheckin()` - formulário de check-in
- `checkin-modal.html`: Modal com campos de medidas

#### `pages/exercises/` (Treinos)
- `exercises.js`: `initExercisesSection()`, dashboards
- Filtros por período e exercício

#### `pages/goals/` (Metas)
- `goals.js`: `initGoalsSection()`, heatmap, score mensal
- Sistema de pontuação

#### `pages/finances/` (Finanças)
- `fin-core.js`: Funções principais e PIN validation
- `fin-overview.js`: Dashboard financeiro
- `fin-lancamentos.js`: Cadastro de transações
- `fin-investimentos.js`: Acompanhamento de ativos
- `fin-viagens.js`: Gestão de viagens
- `fin-modals.js`: Modais da seção

---

## 🎨 Design Tokens & Variáveis CSS

**Arquivo:** `shared/css/base/tokens.css`

```css
:root {
  /* Cores primárias */
  --primary:    #2F7AFF;
  --primary-dark: #1F5AD7;
  
  /* Escala neutra */
  --text-primary:    #1A1A1A;
  --text-secondary:  #666666;
  --bg-primary:      #FFFFFF;
  --bg-secondary:    #F5F5F5;
  
  /* Cores de status */
  --success: #22C55E;
  --danger:  #EF4444;
  --warning: #F59E0B;
  
  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  
  /* Tipografia */
  --font-display: 'DM Serif Display', serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'DM Mono', monospace;
}
```

---

## 📈 Fluxo de Dados da Aplicação

Exemplo simplificado mostrando como dados fluem:

```
┌──────────────────────────────────────────┐
│  Usuário preenche formulário na página   │
└───────────────┬──────────────────────────┘
                ↓
┌──────────────────────────────────────────┐
│ JavaScript captura evento (submit)       │
│ Valida dados locais                      │
└───────────────┬──────────────────────────┘
                ↓
┌──────────────────────────────────────────┐
│ Chama api.js_apiFetch() com dados JSON   │
└───────────────┬──────────────────────────┘
                ↓
        ─ ─ ─ ─ ─ ─ ─ ─ ─
       │   INTERNET (HTTPS)  │
        ─ ─ ─ ─ ─ ─ ─ ─ ─
                ↓
┌──────────────────────────────────────────┐
│ FastAPI recebe POST /api/endpoint        │
│ Pydantic valida request body            │
└───────────────┬──────────────────────────┘
                ↓
┌──────────────────────────────────────────┐
│ Backend instancia Session (ORM)          │
│ SQLAlchemy translate para SQL            │
└───────────────┬──────────────────────────┘
                ↓
        ─ ─ ─ ─ ─ ─ ─ ─ ─
       │  DATABASE (PostgreSQL) │
        ─ ─ ─ ─ ─ ─ ─ ─ ─
                ↓
┌──────────────────────────────────────────┐
│ INSERT/UPDATE na tabela                  │
│ Transaction commit ou rollback          │
└───────────────┬──────────────────────────┘
                ↓
        ─ ─ ─ ─ ─ ─ ─ ─ ─
       │   INTERNET (HTTPS)  │
        ─ ─ ─ ─ ─ ─ ─ ─ ─
                ↓
┌──────────────────────────────────────────┐
│ Frontend recebe resposta JSON            │
│ Status 200 OK (sucesso) ou erro         │
└───────────────┬──────────────────────────┘
                ↓
┌──────────────────────────────────────────┐
│ JavaScript atualiza DOM                  │
│ Mostra toast/notificação                │
│ Recarrega dados se necessário            │
└─────────────────────────────────────────┘
```

---

## 🗺️ Fluxo de Navegação entre Páginas

```
        index.html (sempre carregado)
              ↓
         ┌────────────────┐
         │ USER CLICKS    │
         │ Sidebar button │
         └────────┬───────┘
                  ↓
         ┌─────────────────────────┐
         │ nav.js → switchSection()│
         │ Dispara 'sectionchange' │
         └────────┬────────────────┘
                  ↓
         ┌──────────────────────────────┐
         │ app.js event listener        │
         │ if (section not loaded)      │
         │   → loadHTML() async         │
         └────────┬─────────────────────┘
                  ↓
         ┌──────────────────────────────┐
         │ Fetch pages/SECTION/page.html│
         │ Insert no DOM                │
         │ Add to loadedSections set    │
         └────────┬─────────────────────┘
                  ↓
         ┌──────────────────────────────┐
         │ Call init function           │
         │ (initHomeSection,            │
         │  initBodySection, etc)       │
         └────────┬─────────────────────┘
                  ↓
         ┌──────────────────────────────┐
         │ Fetch data via api.js        │
         │ (fetchCheckins, etc)         │
         └────────┬─────────────────────┘
                  ↓
         ┌──────────────────────────────┐
         │ Render charts, tables, etc   │
         │ Page is now ready            │
         └──────────────────────────────┘
```

---

✅ **Próximo:** Veja [02-ARCHITECTURE.md](02-ARCHITECTURE.md) para entender a arquitetura em profundidade.

✅ **Depois:** Escolha a página que quer estudar: [06-PAGE-HOME.md](06-PAGE-HOME.md), [07-PAGE-BODY.md](07-PAGE-BODY.md), etc.

✅ **Para Setup:** Vá para [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md).
