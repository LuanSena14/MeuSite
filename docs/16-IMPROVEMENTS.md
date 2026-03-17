# 16. IMPROVEMENTS.md - Melhorias e Evolucoes Futuras

## Objetivo
Registrar oportunidades de evolucao do BodyLog por horizonte de tempo, com foco em valor para usuario, robustez tecnica e manutencao simples.

---

## 1) Curto prazo (1-3 meses)
### 1.1 Autenticacao e multiplos usuarios
- Adicionar entidade de usuario e escopo por usuario para registros.
- Introduzir login com token (JWT) para proteger dados pessoais.
- Impacto: maior seguranca e possibilidade de uso por mais de uma pessoa.

### 1.2 Exportacao de dados
- CSV para check-ins, exercicios e financas.
- PDF para relatorios mensais (resumo visual).
- Impacto: facilita analise externa e backup humano.

### 1.3 Melhorias de UX
- Melhor feedback de erro (mensagem orientada a acao).
- Estados de loading mais claros por secao.
- Padronizacao de formularios e validacoes visuais.

---

## 2) Medio prazo (3-6 meses)
### 2.1 Tipagem forte no frontend
- Migrar JavaScript para TypeScript nos modulos mais criticos:
  - `shared/js/api.js`
  - `shared/js/app.js`
  - `pages/finances/*`
- Impacto: menos bugs de contrato de dados e refatoracao mais segura.

### 2.2 Testes automatizados
- Backend: testes de rotas e validacao com `pytest`.
- Frontend: testes de funcoes puras e validacoes de formatacao.
- Impacto: maior confianca em deploy e menos regressao.

### 2.3 Hardening de API
- Rate limit para endpoints sensiveis.
- Melhor padrao de erros (`code`, `message`, `details`).
- Validacao mais estrita de payloads de financas e goals.

---

## 3) Longo prazo (6+ meses)
### 3.1 Insights inteligentes
- Sugestoes baseadas em historico (tendencia de peso, consistencia de treino, projeções de gasto).
- Alertas personalizados por perfil de uso.

### 3.2 Aplicativo mobile
- Reaproveitar API atual com cliente mobile dedicado.
- Priorizar fluxos de entrada rapida (check-in diario e lancamento financeiro).

### 3.3 Arquitetura modular de dominio
- Separar backend por dominios (body, exercises, goals, finances).
- Facilitar manutencao e crescimento por equipe.

---

## 4) Refatoracoes recomendadas
### Backend
- Dividir `backend/main.py` em roteadores por contexto.
- Centralizar tratamento de excecoes.
- Isolar regras de negocio de consultas SQLAlchemy.

### Frontend
- Extrair utilitarios comuns de data/formatacao para `shared/js`.
- Reduzir acoplamento entre modulos de financas.
- Padronizar nome de funcoes e contratos de retorno.

### Banco
- Revisar indices periodicamente conforme volume cresce.
- Criar scripts de migracao versionados.
- Padronizar constraints para evitar inconsistencia semantica.

---

## 5) Priorizacao sugerida
Use esta matriz para decidir o proximo passo:
- Alto impacto + baixo esforco: executar primeiro.
- Alto impacto + alto esforco: quebrar em entregas menores.
- Baixo impacto + baixo esforco: aproveitar janelas curtas.
- Baixo impacto + alto esforco: adiar.

Primeiros candidatos:
1. Testes basicos de API (health + checkins + financas).
2. Padrao de erro unificado no backend.
3. Exportacao CSV em home/body/financas.

---

## 6) Definicao de pronto para melhorias
Uma melhoria so entra como concluida quando:
- Possui criterio de aceite claro.
- Tem validacao manual minima documentada.
- Nao quebra fluxos existentes (smoke test aprovado).
- Esta refletida na documentacao do modulo afetado.
