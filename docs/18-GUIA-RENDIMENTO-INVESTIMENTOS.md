# 18. Guia de Rendimento Mensal de Investimentos

## O Problema Resolvido

Você queria visualizar o **rendimento real** de cada investimento, não apenas a diferença bruta de saldo. 

Exemplo prático:
- **28/02:** Saldo marcado como **R$ 193.000**
- **Março:** Você aplicou +**R$ 2.000** (aporte)
- **Final de Março:** Novo saldo marcado como **R$ 197.000**

A pergunta é: quanto rendeu?

### Cálculo Antigamente (❌ ERRADO)
```
Rendimento = 197.000 - 193.000 = 4.000
```
❌ Isso conta o aporte como rendimento!

### Cálculo Agora (✅ CORRETO)
```
Rendimento = Saldo Atual - Saldo Anterior - (Aportes - Resgates)
Rendimento = 197.000 - 193.000 - (2.000 - 0)
Rendimento = 2.000
```
✅ Agora sabemos que realmente rendeu apenas R$ 2.000!

---

## Como Configurar

### 1. Estrutura de Categorias

Organize seus investimentos como uma **hierarquia com subcategorias**:

```
Investimento (Categoria raiz)
├── Fundo X
│   ├── Aporte          ← para quando você APLICA dinheiro
│   └── Resgate         ← para quando você RESGATA dinheiro
├── CDB Y
│   ├── Entrada         ← também funciona: "Entrada"
│   └── Saída           ← também funciona: "Saída"
├── Ações Z
│   ├── Aplicação       ← ou "Aplicação"
│   └── Resgate
```

**Nomes reconhecidos automaticamente:**
- **Aportes:** `Aporte`, `Entrada`, `Aplicação`
- **Resgates:** `Resgate`, `Saída`

### 2. Registrar Snapshots

Sempre que você atualizar o saldo de um investimento, registre um **snapshot**:

1. Acesse **Finances > Investimentos**
2. Clique no botão **+ Novo Snapshot**
3. Preencha:
   - **Data:** (ex: 28/03/2026)
   - **Investimento:** (ex: Fundo X)
   - **Saldo:** (ex: 197.000)

### 3. Registrar Aportes e Resgates

Quando você fizer um aporte ou resgate, crie um **lançamento**:

1. Acesse **Finances > Lançamentos**
2. Clique **+ Novo Lançamento**
3. Preencha:
   - **Data:** (ex: 05/03/2026)
   - **Categoria:** (ex: `Fundo X > Aporte`)
   - **Valor:** (ex: 2.000)
   - **Descrição:** (opcional, ex: "Aporte mensal")

---

## O Que Você Verá

### No Frontend

Na tela de Investimentos, cada card mostra agora:

```
┌─────────────────────┐
│ Fundo X              │
│ R$ 197.000,00        │  ← Saldo atual
│ +R$ 1.500,00 Δ M/M   │  ← ÚNICA linha com destaque verde/vermelho
│ Líquido: +R$ 2.000,00│  ← Aportes - resgates do período
│ Rend.: +R$ 500,00    │  ← Neutro (sem destaque)
└─────────────────────┘
```

No **Total Geral** segue o mesmo padrão visual.

Além disso, no topo direito do gráfico de evolução dos investimentos existe um resumo dinâmico:

```
Δ Total | Líquido | Rend.
```

Esse bloco muda automaticamente quando você aplica filtros por card.

### Mês inicial automático

Ao abrir a aba de Investimentos, o filtro de mês passa a iniciar no **último mês com snapshot disponível** (em vez do mês atual sem dados).

### Nos Dados da API

O endpoint `/api/financas/investimentos` retorna:

```json
{
  "id": 42,
  "data": "2026-03-28",
  "cd_financa": 55,
  "nome": "Fundo X",
  "saldo": 197000,
  "saldo_anterior": 193000,           ← ✨ NOVO
  "aportes_mes": 2000,                ← ✨ NOVO
  "resgates_mes": 0,                  ← ✨ NOVO
  "rendimento_calculado": 2000        ← ✨ NOVO (2.000 = 197k - 193k - 2k + 0)
}
```

---

## Casos de Uso

### Caso 1: Fundo com efeito líquido positivo

```
Saldo anterior (Fev): 50.000
Aporte (Mar):        +10.000
Resgate (Mar):             0
Saldo atual (Mar):   63.000

Rendimento = 63.000 - 50.000 - (10.000 - 0) = 3.000 ✅
```
(O fundo rendeu R$ 3.000 reais em março)

### Caso 2: Fundo com resgate durante o mês

```
Saldo anterior (Fev): 100.000
Aporte (Mar):        +5.000
Resgate (Mar):       -15.000
Saldo atual (Mar):   92.000

Rendimento = 92.000 - 100.000 - (5.000 - 15.000)
            = 92.000 - 100.000 - (-10.000)
            = 92.000 - 100.000 + 10.000
            = 2.000 ✅
```
(Mesmo com saque, conseguiu render R$ 2.000)

### Caso 3: Rendimento negativo (prejuízo)

```
Saldo anterior (Fev): 80.000
Aporte (Mar):        +5.000
Resgate (Mar):             0
Saldo atual (Mar):   81.000

Rendimento = 81.000 - 80.000 - (5.000 - 0) = -4.000 ❌
```
(O fundo perdeu R$ 4.000 em março, apesar do aporte)

---

## Fallback (Se Não Usar Subcategorias)

Se sua estrutura for simples:

```
Investimento
└── Fundo X
```

Sem "Aporte" e "Resgate", o sistema:
1. Somará TODOS os lançamentos como aportes
2. Isso pode não ser ideal, mas funciona como fallback

**Recomendação:** Crie as subcategorias para melhor controle!

---

## Perguntas Frequentes

**P: E se não registrar snapshots todo mês?**
R: O rendimento só aparece se houver snapshot do mês ANTERIOR. Sem ele, mostra `null`.

**P: E se registrar dois snapshots no mesmo mês?**
R: Usa sempre o **mais recente** (a data mais à frente no mês).

**P: Qual mês abre por padrão na aba de investimentos?**
R: O sistema abre no **último mês com snapshot**. Se você alterar manualmente o filtro, a seleção manual passa a ser respeitada.

**P: Valor negativo é possível?**
R: Sim! Se o investimento rendeu menos que as despesas deducidas, será negativo.

**P: Posso usar valores negativos nos lançamentos?**
R: Tecnicamente sim, mas recomenda-se criar categorias filhas separadas para clareza.

---

## Resumo Técnico

### Fórmula Implementada

Para cada snapshot de um investimento:

```javascript
rendimento = saldo_atual 
           - saldo_anterior 
           - (aportes_mes - resgates_mes)
```

Onde:
- **saldo_atual** = snapshot do mês atual
- **saldo_anterior** = último snapshot do mês anterior
- **aportes_mes** = soma de lançamentos com cd_financa = categorias filhas "Aporte/*"
- **resgates_mes** = soma de lançamentos com cd_financa = categorias filhas "Resgate/*"

### Regra de Detecção de Subcategorias

Se a categoria tem filhos com nomes em `['aporte', 'entrada', 'aplicação', 'resgate', 'saída']`, usa elas.
Senão, soma todos os lançamentos da categoria.

### Performance

A consulta é eficiente pois:
- Agrupa snapshots por categoria
- Faz uma única query de lançamentos por mês
- Cálculos feitos em memória (Python)

---

## Próximos Passos

1. ✅ Estruture suas categorias (adicione "Aporte" e "Resgate")
2. ✅ Registre lançamentos rotineiros em Finances > Lançamentos
3. ✅ Atualize snapshots regularmente (ex: última dia do mês)
4. ✅ Visualize o rendimento real em Finances > Investimentos

Aproveite para acompanhar com precisão como seus investimentos estão performando!
