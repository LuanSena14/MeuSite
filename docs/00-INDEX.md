# 📚 Documentação Técnica - BodyLog

**Versão:** 2.0
**Objetivo:** Documentação completa do projeto BodyLog para permitir que qualquer desenvolvedor entenda, mantenha e evolua o sistema de forma autônoma.

> **Mudança de arquitetura importante:** o BodyLog não tem mais um backend próprio
> (o antigo servidor Python/FastAPI foi removido). O frontend fala **direto** com um
> projeto **Supabase** (Postgres + API REST autogerada + Row Level Security). A seção
> Goals também mudou: virou um `<iframe>` que embute um app externo (MakeIt) em vez de
> um sistema de metas próprio. Veja [02-ARCHITECTURE.md](02-ARCHITECTURE.md) e
> [09-PAGE-GOALS.md](09-PAGE-GOALS.md) para os detalhes.

---

## 📖 Índice de Documentação

### 1. **Fundações**
- **[01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md)** — o que é BodyLog, funcionalidades, arquitetura em alto nível

### 2. **Arquitetura & Design**
- **[02-ARCHITECTURE.md](02-ARCHITECTURE.md)** — frontend ↔ Supabase, fluxo de dados ponta a ponta, estrutura de pastas

### 3. **Camada de Dados**
- **[03-DATABASE.md](03-DATABASE.md)** — schema do Postgres (Supabase), RLS, tabelas, relacionamentos

### 4. **Camada que substituiu o Backend**
- **[04-BACKEND.md](04-BACKEND.md)** — `shared/js/api.js`: toda a lógica que antes vivia num servidor Python, hoje rodando no navegador via `supabase-js`

### 5. **Camada de Frontend**
- **[05-FRONTEND.md](05-FRONTEND.md)** — estrutura HTML/CSS/JS, navegação, cache, carregamento dinâmico

### 6. **Documentação por Página**
- **[06-PAGE-HOME.md](06-PAGE-HOME.md)** — Overview
- **[07-PAGE-BODY.md](07-PAGE-BODY.md)** — Métricas corporais
- **[08-PAGE-EXERCISES.md](08-PAGE-EXERCISES.md)** — Treinos
- **[09-PAGE-GOALS.md](09-PAGE-GOALS.md)** — iframe mask do app externo MakeIt
- **[10-PAGE-FINANCES.md](10-PAGE-FINANCES.md)** — Organizador financeiro (o módulo mais complexo)

### 7. **Stack Tecnológico**
- **[11-TECH-STACK.md](11-TECH-STACK.md)** — HTML/CSS/JS vanilla + Chart.js + Supabase (Postgres/PostgREST/RLS)

### 8. **Guias de Implementação**
- **[12-SETUP-LOCAL.md](12-SETUP-LOCAL.md)** — rodar localmente (só um servidor estático, sem backend/DB local)
- **[13-DEPLOYMENT.md](13-DEPLOYMENT.md)** — publicar frontend estático + configurar Supabase
- **[14-QUICK-GUIDES.md](14-QUICK-GUIDES.md)** — como adicionar página nova, referência de funções de dados
- **[17-LINE-BY-LINE-CODE.md](17-LINE-BY-LINE-CODE.md)** — mapa por faixa de linha (parcialmente desatualizado, ver aviso no próprio arquivo)

### 9. **Manutenção & Operações**
- **[15-MAINTENANCE.md](15-MAINTENANCE.md)** — monitoramento via dashboard Supabase, debugging, erros comuns
- **[16-IMPROVEMENTS.md](16-IMPROVEMENTS.md)** — roadmap de evoluções e refatorações sugeridas

### 10. **Guias específicos**
- **[18-GUIA-RENDIMENTO-INVESTIMENTOS.md](18-GUIA-RENDIMENTO-INVESTIMENTOS.md)** — como o cálculo de rendimento de investimentos funciona

---

## 🚀 Como Usar Esta Documentação

### Para Iniciantes (Nunca viu o projeto antes)
1. **[01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md)** para entender o que é BodyLog
2. **[02-ARCHITECTURE.md](02-ARCHITECTURE.md)** para ver como frontend e Supabase se falam
3. Explore as páginas específicas em **[06](06-PAGE-HOME.md)**–**[10-PAGE-FINANCES.md](10-PAGE-FINANCES.md)**

### Para Desenvolvedores (Implementar novas features)
1. **[11-TECH-STACK.md](11-TECH-STACK.md)** para conhecer as ferramentas
2. Nova página: **[14-QUICK-GUIDES.md](14-QUICK-GUIDES.md)**
3. Nova tabela/query: **[03-DATABASE.md](03-DATABASE.md)** + **[04-BACKEND.md](04-BACKEND.md)**

### Para Manutenção
1. **[12-SETUP-LOCAL.md](12-SETUP-LOCAL.md)** — ambiente de desenvolvimento
2. **[15-MAINTENANCE.md](15-MAINTENANCE.md)** — operações rotineiras
3. **[13-DEPLOYMENT.md](13-DEPLOYMENT.md)** — deploy em produção

### Para Refatoração/Melhorias
- **[16-IMPROVEMENTS.md](16-IMPROVEMENTS.md)** — ideias e roadmap

---

## 📞 Estrutura do Projeto em 30 Segundos

```
BodyLog é um dashboard pessoal com 5 seções:
├── HOME: Visão geral com KPIs
├── BODY: Registro e análise de métricas corporais
├── EXERCISES: Registro de treinos com análise de frequência
├── GOALS: iframe embutindo o app externo MakeIt (não tem dados próprios)
└── FINANCES: Organizador financeiro com orçamentos e investimentos

Stack:
├── Frontend: HTML + CSS + JavaScript vanilla (sem frameworks, sem build)
└── Dados: Supabase (Postgres + PostgREST + Row Level Security)
    — sem servidor de aplicação próprio

Hospedagem:
├── Frontend: qualquer host de arquivos estáticos
└── Dados: projeto Supabase (sempre online, sem deploy recorrente)
```

---

## 📝 Histórico de Atualizações

| Data | Versão | Alterações |
|------|--------|-----------|
| Jul 2026 | 2.0 | Migração completa pra Supabase (backend Python removido); Goals virou iframe mask do MakeIt; resumo anual novo em Finances |
| Mar 2026 | 1.1 | Split de manutenção/melhorias + guia linha a linha |
| Mar 2026 | 1.0 | Documentação inicial completa |

---

## ❓ Perguntas Frequentes

**P: Onde começo se quero adicionar uma nova funcionalidade?**
R: [14-QUICK-GUIDES.md](14-QUICK-GUIDES.md), depois a documentação específica da página afetada (06 a 10).

**P: Como faço deploy em produção?**
R: [13-DEPLOYMENT.md](13-DEPLOYMENT.md) — é só publicar a pasta `FrontEnd/` como site estático; o Supabase já está sempre no ar.

**P: Onde fica a lógica que antes era o backend?**
R: Em `FrontEnd/shared/js/api.js`, documentado em [04-BACKEND.md](04-BACKEND.md).

**P: Qual é a senha/PIN de acesso do Finances?**
R: Constante `FINANCES_PIN` em `FrontEnd/shared/js/nav.js` — é só uma cortina de UI, não é segurança real.

**P: Como rodo tudo localmente?**
R: [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md) — só precisa servir os arquivos estáticos, não tem banco local.

**P: E a seção Goals, como funciona?**
R: [09-PAGE-GOALS.md](09-PAGE-GOALS.md) — é um iframe pro app MakeIt, não tem dados próprios no BodyLog.

---

**Boa documentação! 🚀**
