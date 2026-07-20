# 📚 Documentação BodyLog - Índice Rápido

> **Arquitetura atual:** frontend estático (HTML/CSS/JS vanilla) falando **direto** com
> um projeto Supabase (Postgres + PostgREST + RLS). Não existe backend próprio. A seção
> Goals é um `<iframe>` que embute um app externo (MakeIt). Veja
> [02-ARCHITECTURE.md](02-ARCHITECTURE.md) e [09-PAGE-GOALS.md](09-PAGE-GOALS.md).

## 🎯 Comece Aqui

**Nunca viu o projeto?** → [01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md)
**Quer rodar localmente?** → [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md)
**Quer entender como funciona?** → [02-ARCHITECTURE.md](02-ARCHITECTURE.md)
**Quer ver tudo?** → [00-INDEX.md](00-INDEX.md)

---

## 📂 Arquivos de Documentação

### Fundações
| Arquivo | O Quê |
|---------|-------|
| [00-INDEX.md](00-INDEX.md) | Índice completo de toda documentação |
| [01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md) | Visão geral do projeto, features, stack |

### Arquitetura & Dados
| Arquivo | O Quê |
|---------|-------|
| [02-ARCHITECTURE.md](02-ARCHITECTURE.md) | Arquitetura frontend ↔ Supabase, fluxos, estrutura de pastas |
| [03-DATABASE.md](03-DATABASE.md) | Schema Postgres, RLS, tabelas, relacionamentos |
| [04-BACKEND.md](04-BACKEND.md) | `api.js` — a camada que substituiu o backend Python |

### Código
| Arquivo | O Quê |
|---------|-------|
| [05-FRONTEND.md](05-FRONTEND.md) | JavaScript/HTML/CSS vanilla: estrutura do app |
| [11-TECH-STACK.md](11-TECH-STACK.md) | Tecnologias: Chart.js, supabase-js, Postgres/PostgREST |
| [17-LINE-BY-LINE-CODE.md](17-LINE-BY-LINE-CODE.md) | Mapa por faixa de linha (parcialmente desatualizado) |

### Documentação por Página
| Arquivo | O Quê |
|---------|-------|
| [06-PAGE-HOME.md](06-PAGE-HOME.md) | Home: cards, agregação de dados e atalhos |
| [07-PAGE-BODY.md](07-PAGE-BODY.md) | Body: check-ins, cálculos e gráficos |
| [08-PAGE-EXERCISES.md](08-PAGE-EXERCISES.md) | Exercises: filtros, drill-down e histórico |
| [09-PAGE-GOALS.md](09-PAGE-GOALS.md) | Goals: iframe mask do app externo MakeIt |
| [10-PAGE-FINANCES.md](10-PAGE-FINANCES.md) | Finances: abas, orçamento, investimentos, viagens, resumo anual |

### Guias de Implementação
| Arquivo | O Quê |
|---------|-------|
| [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md) | **Como rodar localmente** passo a passo |
| [13-DEPLOYMENT.md](13-DEPLOYMENT.md) | Publicar o frontend estático + configurar Supabase |
| [14-QUICK-GUIDES.md](14-QUICK-GUIDES.md) | Resumos das páginas + como criar nova página |

### Operações
| Arquivo | O Quê |
|---------|-------|
| [15-MAINTENANCE.md](15-MAINTENANCE.md) | Rotina operacional, monitoramento via Supabase, troubleshooting |
| [16-IMPROVEMENTS.md](16-IMPROVEMENTS.md) | Roadmap de evoluções e refatorações sugeridas |
| [18-GUIA-RENDIMENTO-INVESTIMENTOS.md](18-GUIA-RENDIMENTO-INVESTIMENTOS.md) | Como o cálculo de rendimento de investimentos funciona |

---

## 🚀 Fluxo Típico de Desenvolvimento

```
1️⃣ Novo no projeto?      → 01-PROJECT-OVERVIEW.md
2️⃣ Entender estrutura?   → 02-ARCHITECTURE.md
3️⃣ Rodar localmente?     → 12-SETUP-LOCAL.md
4️⃣ Adicionar feature?    → 14-QUICK-GUIDES.md
4.1️⃣ Página específica?  → 06-PAGE-HOME.md até 10-PAGE-FINANCES.md
5️⃣ Deploiar?             → 13-DEPLOYMENT.md
6️⃣ Manter?               → 15-MAINTENANCE.md
7️⃣ Melhorar/refatorar?   → 16-IMPROVEMENTS.md
```

---

## 🔍 Procurando por Tópico Específico?

**Como funciona o banco de dados?** → [03-DATABASE.md](03-DATABASE.md)
**Como o frontend fala com o Supabase?** → [04-BACKEND.md](04-BACKEND.md) / [02-ARCHITECTURE.md](02-ARCHITECTURE.md)
**Como funciona a navegação?** → [05-FRONTEND.md](05-FRONTEND.md)
**Qual tecnologia é usada?** → [11-TECH-STACK.md](11-TECH-STACK.md)
**Referência das funções de dados (era "API endpoints")** → [14-QUICK-GUIDES.md](14-QUICK-GUIDES.md)
**Guia de troubleshooting** → [15-MAINTENANCE.md](15-MAINTENANCE.md)
**Como funciona a seção Goals?** → [09-PAGE-GOALS.md](09-PAGE-GOALS.md)

---

## 💡 Filosofia da Documentação

- **Detalhada:** exemplos de código reais do projeto atual, não pseudocódigo genérico.
- **Acessível:** assume que você nunca viu o projeto.
- **Bem estruturada:** um arquivo por tema, cross-links entre eles.
- **Honesta sobre o que está obsoleto:** onde há código morto (ex.: `goals.js` antigo) ou docs parcialmente desatualizadas (line-by-line), isso é sinalizado explicitamente em vez de escondido.

---

## 📞 Quick Reference

### Rodar localmente
```powershell
.\start-local.ps1
# Servindo FrontEnd em http://127.0.0.1:8080 ...
```

### Testar uma query no navegador (F12 → Console)
```javascript
await sb.from('checkins').select('*').limit(5)
```

### Deploy
```bash
git push origin main   # auto-deploy no host estático, se configurado
```

### Onde ficam as credenciais do Supabase
```javascript
// FrontEnd/shared/js/supabase-client.js
const SUPABASE_URL = 'https://jgqzclewwxmgjlqpxejc.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_...'
```
É a chave pública (anon) — ok estar no código-fonte. A chave secreta (`service_role`) nunca deve entrar aqui.

### Arquivos Principais
```
supabase/schema.sql        ← DDL das tabelas + policies RLS

FrontEnd/index.html        ← Arquivo HTML único
FrontEnd/shared/js/        ← supabase-client.js, api.js, nav.js, app.js
FrontEnd/pages/*/          ← Páginas específicas
```

---

## 🎓 Continuando o Aprendizado

1. Abra `FrontEnd/shared/js/api.js` e leia as funções de dados.
2. Abra `FrontEnd/pages/body/body.js` e entenda o padrão de página.
3. Modifique algo pequeno (ex.: cor em `tokens.css`) e veja o resultado no navegador.
4. Adicione uma seção nova seguindo [14-QUICK-GUIDES.md](14-QUICK-GUIDES.md).

---

## ✅ Checklist de Leitura Recomendada

Para iniciante (primeiro contato):
- [ ] [00-INDEX.md](00-INDEX.md)
- [ ] [01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md)
- [ ] [02-ARCHITECTURE.md](02-ARCHITECTURE.md)
- [ ] [12-SETUP-LOCAL.md](12-SETUP-LOCAL.md)

Para desenvolvedor (implementar features):
- [ ] [04-BACKEND.md](04-BACKEND.md)
- [ ] [05-FRONTEND.md](05-FRONTEND.md)
- [ ] [06](06-PAGE-HOME.md) até [10-PAGE-FINANCES.md](10-PAGE-FINANCES.md)
- [ ] [03-DATABASE.md](03-DATABASE.md)
- [ ] [14-QUICK-GUIDES.md](14-QUICK-GUIDES.md)

Para operação/manutenção:
- [ ] [11-TECH-STACK.md](11-TECH-STACK.md)
- [ ] [13-DEPLOYMENT.md](13-DEPLOYMENT.md)
- [ ] [15-MAINTENANCE.md](15-MAINTENANCE.md)
- [ ] [16-IMPROVEMENTS.md](16-IMPROVEMENTS.md)

---

## 🚀 Bora Começar!

**Parado?** → [Clique aqui para começar](01-PROJECT-OVERVIEW.md)
**Pronto pra rodar?** → [Siga o setup local](12-SETUP-LOCAL.md)
**Quer ver tudo?** → [Índice completo](00-INDEX.md)

---

**Última atualização:** Julho 2026 — pós-migração para Supabase.
