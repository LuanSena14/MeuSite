# 15. MAINTENANCE.md - Guia de Manutencao do Sistema

## Objetivo
Este documento ajuda voce a manter o BodyLog estavel no dia a dia: monitorar, depurar, atualizar dependencias e prevenir incidentes.

---

## 1) Checklist semanal de saude
- Banco responde: executar `SELECT 1` no PostgreSQL.
- API responde: testar endpoint de saude e 1 endpoint de negocio.
- Frontend sem erros criticos: revisar Console e Network no navegador.
- Backup atualizado: validar data do ultimo dump.

Comandos uteis:
```bash
# API
curl http://127.0.0.1:8001/health

# Exemplo de endpoint de negocio
curl http://127.0.0.1:8001/api/checkins
```

---

## 2) Monitoramento e observabilidade
### Backend
- Observe logs do `uvicorn` para erros 4xx/5xx.
- Monitore tempo de resposta dos endpoints mais usados:
  - `/api/checkins`
  - `/api/exercicios`
  - `/api/financas/lancamentos`

### Banco de dados
- Acompanhe crescimento de tabelas com `COUNT(*)`.
- Revise consultas lentas periodicamente com `EXPLAIN ANALYZE`.

Exemplos SQL:
```sql
SELECT COUNT(*) FROM checkins;
SELECT COUNT(*) FROM entrada_exercicio;
SELECT COUNT(*) FROM lancamento_financeiro;

EXPLAIN ANALYZE
SELECT *
FROM checkins
WHERE date BETWEEN DATE '2026-01-01' AND DATE '2026-12-31'
ORDER BY date DESC;
```

---

## 3) Depuracao (debug)
### Frontend
- Console (F12): erros em vermelho e stack trace.
- Network: status HTTP, payload e tempo da requisicao.
- Estado da app: verificar secao ativa e cache.

### Backend
- Reproduza com `curl` antes de mexer no codigo.
- Se erro vier de validacao, confira modelos Pydantic em `backend/main.py`.
- Se erro vier de dados, confirme relacoes em `backend/models.py`.

---

## 4) Atualizacao de dependencias
### Python
```bash
pip list --outdated
pip install --upgrade fastapi
pip install -U -r backend/requirements.txt
```

Boas praticas:
- Atualize em lotes pequenos.
- Rode smoke tests apos cada lote (health + endpoints principais).
- Se possivel, fixe versoes no `requirements.txt`.

### JavaScript
- O projeto usa JavaScript vanilla.
- Bibliotecas externas (como Chart.js) chegam via CDN.
- Ao trocar versao de CDN, validar regressao visual das paginas.

---

## 5) Performance tuning
### Indices recomendados
```sql
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE INDEX IF NOT EXISTS idx_entrada_exercicio_data ON entrada_exercicio(data);
CREATE INDEX IF NOT EXISTS idx_lancamento_data ON lancamento_financeiro(data);
```

### Sinais de alerta
- Endpoint lento em horario de uso normal.
- Crescimento de tempo de resposta ao aumentar dados.
- Consultas com `Seq Scan` frequente em tabela grande.

---

## 6) Limpeza e arquivamento
Antes de qualquer limpeza, faca backup.

```bash
pg_dump bodylog > backup_before_cleanup.sql
```

Exemplo de politica (ajuste ao negocio):
- Dados detalhados antigos: arquivar acima de 12 meses.
- Dados agregados: manter para historico de tendencia.

---

## 7) Seguranca operacional
- Nao commitar segredos nem `.env`.
- Revisar CORS de tempos em tempos.
- Usar usuario de banco com privilegios minimos em producao.
- Revisar periodicamente dependencias por CVEs.

Checklist rapido:
- `.env` esta ignorado no git.
- Variaveis de ambiente existem no servidor.
- PIN/credenciais nao aparecem em logs.

---

## 8) Erros comuns e resposta rapida
| Sintoma | Causa provavel | Acao inicial |
|---|---|---|
| `Connection refused` | Banco parado | Subir Postgres e testar conexao |
| `No module named ...` | Dependencia ausente | Reinstalar `requirements.txt` |
| CORS bloqueando | Origem nao permitida | Revisar middleware CORS |
| Grafico vazio | Sem dados ou filtro invalido | Validar payload da API e filtros |
| Timeout no deploy | Query pesada ou instancia limitada | Medir query e otimizar indice |

---

## 9) Rotina sugerida de manutencao
- Segunda: check de saude + logs.
- Quarta: amostra de performance (1 endpoint por modulo).
- Sexta: backup validado + revisão de erros recorrentes.

Se ocorrer incidente:
1. Reproduzir rapidamente.
2. Isolar (frontend, API ou banco).
3. Corrigir com rollback possivel.
4. Registrar causa raiz e prevencao.
