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

### 4️⃣ GOALS - Máscara para o app MakeIt

**O que é hoje:**
A seção Goals **não é mais um sistema próprio do BodyLog**. O antigo sistema de metas (registro diário, pontuação mensal, heatmap) foi descontinuado quando o projeto migrou pro Supabase — as tabelas correspondentes não existem mais no banco.

Em vez disso, a aba Goals é uma **"máscara"**: um `<iframe>` que embute um app externo chamado **MakeIt** (`make-it-nine-delta.vercel.app`), um goal-tracker separado, com seu próprio front-end e seu próprio projeto Supabase, sem nenhuma integração de dados com o BodyLog. A sidebar/navegação continuam sendo do BodyLog; o conteúdo da tela é 100% do MakeIt.

Detalhes técnicos em [09-PAGE-GOALS.md](09-PAGE-GOALS.md).

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
│  │  shared/js/supabase-client.js (cliente supabase-js)│ │
│  └────────────────────────────────────────────────────┘ │
│                           ↕                              │
│                HTTPS (REST autogerado, PostgREST)       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                      INTERNET                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           SUPABASE (Postgres + PostgREST)          │ │
│  │                                                    │ │
│  │  Sem servidor de aplicação próprio — cada tabela   │ │
│  │  já é um endpoint REST, protegido por RLS.         │ │
│  │                                                    │ │
│  │  Tabelas:                                          │ │
│  │  ├── unidade_medida (kg, cm, %)                    │ │
│  │  ├── codigo_medida (Peso, Gordura, FFMI, etc)     │ │
│  │  ├── checkins (Histórico de check-ins)            │ │
│  │  ├── codigo_exercicio (Grupos e exercícios)       │ │
│  │  ├── entrada_exercicio (Histórico de treinos)     │ │
│  │  ├── codigo_financa (Categorias financeiras)      │ │
│  │  └── lancamento_financeiro (Transações)           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘

Goals não aparece aqui: é um <iframe> pro app externo MakeIt,
que tem seu próprio Supabase separado (ver 09-PAGE-GOALS.md).
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
8. JavaScript (checkin.js) coleta dados e chama postCheckin() em api.js
9. api.js faz sb.from('checkins').insert(...) via supabase-js
10. PostgREST valida a policy de RLS e o Postgres executa o INSERT
11. Supabase retorna JSON com sucesso
12. Frontend mostra toast "✓ Salvo com sucesso!"
13. Frontend recarrega o gráfico de Peso
```

---

## 📁 Estrutura de Pastas do Projeto

```
MeuSite/
│
├── README.md                          ← Guia inicial
├── supabase/
│   └── schema.sql                     ← DDL das tabelas + policies RLS
│
├── FrontEnd/                          ← Código do cliente (HTML/CSS/JS) — o app inteiro
│   │
│   ├── index.html                     ← ÚNICO arquivo HTML (SPA)
│   ├── style.css                      ← Entrada CSS (carrega app.css + polish.css)
│   │
│   ├── shared/                        ← Recursos compartilhados entre páginas
│   │   ├── js/
│   │   │   ├── supabase-client.js     ← Cria o cliente supabase-js (`sb`)
│   │   │   ├── nav.js                 ← Navegação entre seções
│   │   │   ├── api.js                 ← Toda a lógica de dados (era o backend)
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
│       ├── goals/                     ← Seção Goals — hoje é um <iframe> mask
│       │   ├── goals.html             ← só o iframe pro app externo MakeIt
│       │   ├── goals.js               ← código do sistema antigo, inerte
│       │   ├── goals.css
│       │   └── goals-modal.html       ← modal antigo, não usado por nenhum botão hoje
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
```

Não existe mais `backend/`, `bodylog.sql`, `migrate_db.py` nem `.env` de servidor — a URL e a chave do Supabase ficam direto em `FrontEnd/shared/js/supabase-client.js` (é uma chave pública por design, protegida por RLS, não por sigilo).

---

## 🛠️ Stack Tecnológica Utilizada

### Frontend (Cliente) — o app inteiro
| Tecnologia | Versão | Uso |
|---------------|--------|-----|
| **HTML5** | Nativa | Markup e estrutura |
| **CSS3** | Nativa | Estilos, layout flexbox/grid, animações |
| **JavaScript** | ES6+ | Lógica, DOM manipulation, chamadas ao Supabase |
| **supabase-js** | 2.x (CDN) | Cliente que fala direto com o Supabase |
| **Chart.js** | 4.4.1 | Gráficos (peso, exercícios, finanças) |
| **Google Fonts** | Nativa | Tipografia (DM Sans, DM Serif, DM Mono) |

**Nota:** Zero frameworks (React, Vue, Angular). Apenas JavaScript vanilla para máxima simplicidade e zero build step.

### Supabase (Backend-as-a-Service)
| Componente | Uso |
|------------|-----|
| **Postgres** | Banco relacional (schema em `supabase/schema.sql`) |
| **PostgREST** | Gera a API REST automaticamente a partir do schema |
| **Row Level Security (RLS)** | Controle de acesso — substitui a validação que um backend próprio faria |

Não há mais Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic nem psycopg2 no projeto.

### Deployment & Hosting
| Serviço | Uso |
|----------|-----|
| **Qualquer host de arquivos estáticos** (Render static site, Vercel, Netlify, GitHub Pages...) | Serve o `FrontEnd/` — não precisa de runtime de servidor |
| **Supabase** | Hospeda o banco + API REST, sempre online (sem cold start) |
| **GitHub** | Controle de versão |

---

## 🔄 Fluxo de Funcionamento da Aplicação

### No Primeiro Acesso

```
Usuário acessa a URL do site (hospedagem estática)
           ↓
Servidor estático entrega index.html + CSS + JS
           ↓
JavaScript carrega (supabase-js, supabase-client.js, nav.js, api.js, app.js)
           ↓
app.js executa init()
           ↓
Página Home carrega, buscando dados direto no Supabase
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
    │ api.js faz sb.from(...).insert/select │
    │ via supabase-js                       │
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────┐
    │ Supabase (PostgREST + RLS) processa   │
    │ - Policy de RLS decide se libera      │
    │ - Postgres executa a query            │
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

## 🧠 Como Frontend e Supabase Interagem

### Exemplo Real: Salvando um Check-in de Peso

**1. FRONTEND (interface + evento)**
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

  showAppToast('✓ Check-in salvo com sucesso!');
  await refreshBodyGraphs();
});
```

**2. api.js (a lógica que antes era backend, agora client-side)**
```javascript
// shared/js/api.js

async function postCheckin(date, medidas) {
  const { data: codigos } = await sb
    .from('codigo_medida').select('id, descricao').not('cd_pai', 'is', null)

  const mapa = new Map(codigos.map(c => [c.descricao, c.id]))
  const rows = Object.entries(medidas)
    .filter(([campo, valor]) => valor != null && mapa.has(campo))
    .map(([campo, valor]) => ({ date, cd_medida: mapa.get(campo), valor: Number(valor) }))

  const { error } = await sb.from('checkins').insert(rows)
  if (error) throw new Error(error.message)
  return { ok: true }
}
```

**3. SUPABASE (PostgREST + RLS + Postgres)**
```sql
-- A policy de RLS libera o insert pra chave anon:
-- create policy "public_full_access" on checkins for all to anon using (true) with check (true);

INSERT INTO checkins (date, cd_medida, valor) VALUES ('2026-03-15', 1, 78.5);   -- peso
INSERT INTO checkins (date, cd_medida, valor) VALUES ('2026-03-15', 3, 18.2);   -- gordura
```

**4. FRONTEND (recebimento e atualização)**
```javascript
const resposta = await postCheckin(date, medidas);

if (resposta.ok) {
  const todosCheckins = await fetchCheckins();
  rebuildChartPeso(todosCheckins);
  renderHistoricoCheckins(todosCheckins);
}
```

---

## 📊 Descrição Detalhada de Cada Pasta e Arquivo

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

#### `shared/js/supabase-client.js` (Conexão com o Supabase)
- Cria o cliente global `sb = supabase.createClient(URL, ANON_KEY)`
- Precisa carregar antes de `api.js`

#### `shared/js/api.js` (Camada de Dados — era o backend)
- Toda função fala direto com o Supabase via `sb.from(...)`
- Funções de dados: `fetchCheckins()`, `postCheckin()`, `fetchExercicios()`, etc.
- Também concentra regras de negócio (hierarquia de categorias, cálculo de rendimento de investimento)

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
│ Chama uma função de api.js (ex: postX()) │
│ que monta sb.from(...).insert(...)       │
└───────────────┬──────────────────────────┘
                ↓
        ─ ─ ─ ─ ─ ─ ─ ─ ─
       │   INTERNET (HTTPS)  │
        ─ ─ ─ ─ ─ ─ ─ ─ ─
                ↓
┌──────────────────────────────────────────┐
│ PostgREST recebe a requisição            │
│ Policy de RLS decide se libera           │
└───────────────┬──────────────────────────┘
                ↓
┌──────────────────────────────────────────┐
│ Postgres executa o INSERT/UPDATE direto  │
│ (sem ORM, sem camada de validação própria)│
└───────────────┬──────────────────────────┘
                ↓
        ─ ─ ─ ─ ─ ─ ─ ─ ─
       │  SUPABASE (Postgres) │
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
