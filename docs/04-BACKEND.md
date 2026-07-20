# 4. Camada de Dados - `api.js` (o que substituiu o backend)

> Este arquivo se chamava "Documentação do Backend" quando o BodyLog tinha um servidor
> Python/FastAPI próprio. Esse backend **foi removido** (junto com `models.py`,
> `database.py`, `main.py`, `requirements.txt`) quando o projeto migrou para falar
> direto com o Supabase. Mantemos o número do arquivo (04) pra não quebrar os links
> do resto da documentação, mas o conteúdo agora é sobre a camada que ocupou o lugar
> do backend: `FrontEnd/shared/js/api.js`.

## 🚀 Visão Geral

Não há mais servidor de aplicação. `api.js` roda **no navegador** e fala direto com o Supabase via `supabase-js`. Ele concentra toda a lógica que antes vivia em `main.py`/`models.py`:
- Montar queries (joins, filtros, paginação)
- Derivar hierarquia (ex.: subir a árvore de categorias até achar a raiz)
- Regras de negócio (ex.: cálculo de rendimento de investimento, resolução de regras de débito)
- Validações simples antes de gravar

### Stack da camada de dados
- **Cliente:** `supabase-js` (carregado via CDN em `index.html`)
- **Conexão:** `FrontEnd/shared/js/supabase-client.js` cria o cliente global `sb`
- **Toda a lógica:** `FrontEnd/shared/js/api.js`
- **Banco:** Postgres gerenciado pelo Supabase, com RLS liberando tudo pra chave anon (ver [03-DATABASE.md](03-DATABASE.md))

---

## 📄 supabase-client.js

```javascript
const SUPABASE_URL = 'https://jgqzclewwxmgjlqpxejc.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_...'

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

`sb` fica disponível globalmente pra qualquer script carregado depois dele (é um `<script>` clássico, sem módulos ES). Precisa ser carregado **antes** de `api.js` no `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="shared/js/supabase-client.js"></script>
<script src="shared/js/nav.js"></script>
<script src="shared/js/api.js"></script>
<script src="shared/js/app.js"></script>
```

A chave usada é a **publishable/anon** — ela é pública por design no Supabase (é assim que qualquer app client-side funciona). Quem protege os dados são as *policies* de RLS no banco, não o sigilo dessa chave.

---

## 🔌 Padrões usados em `api.js`

### 1. Select simples
```javascript
async function fetchOrcamento() {
  const lookup = await _fetchAllCodigoFinanca()
  const { data, error } = await sb.from('orcamento_financeiro').select('*')
  _throwIfError(error)
  return data.map(r => ({ ...r, categoria_nome: lookup.get(r.cd_financa)?.nome || '' }))
}
```

### 2. Select com join aninhado (equivalente a um `JOIN` em SQL)
O PostgREST resolve joins baseado nas foreign keys do schema — basta pedir o nome da tabela relacionada dentro do `select`:
```javascript
const { data } = await sb
  .from('entrada_exercicio')
  .select('id, data, hora, cd_exercicio, duracao, esforco, codigo_exercicio(descricao, cd_pai)')
  .order('data', { ascending: true })
```

### 3. Paginação manual (limite de 1000 linhas do PostgREST)
```javascript
async function _fetchAllPaginated(buildQuery, pageSize = 1000) {
  let all = []
  let from = 0
  while (true) {
    const { data, error } = await buildQuery().range(from, from + pageSize - 1)
    _throwIfError(error)
    all = all.concat(data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}
```
Usado por qualquer tabela que possa passar de 1000 linhas: `entrada_exercicio`, `lancamento_financeiro`. **Se uma tabela crescer e passar a dar resultados truncados silenciosamente (sem erro), é sinal de que ela também precisa dessa paginação.**

### 4. Insert
```javascript
async function postExercise(entry) {
  const { error } = await sb.from('entrada_exercicio').insert({
    data: entry.date,
    hora: entry.hora,
    cd_exercicio: entry.cd_exercicio,
    duracao: entry.duracao ?? null,
    esforco: entry.esforco ?? null,
  })
  _throwIfError(error)
  return { ok: true }
}
```

### 5. Update / Upsert
```javascript
async function patchCheckinDate(oldDate, newDate) {
  const { data: existingNew } = await sb.from('checkins').select('id').eq('date', newDate).limit(1)
  if (existingNew.length) throw new Error('Já existe um check-in para a data de destino')
  const { error } = await sb.from('checkins').update({ date: newDate }).eq('date', oldDate)
  _throwIfError(error)
  return { ok: true }
}
```

### 6. Delete
```javascript
async function deleteLancamento(id) {
  const { error } = await sb.from('lancamento_financeiro').delete().eq('id', id)
  _throwIfError(error)
  return { ok: true }
}
```

### 7. Regra de negócio client-side (exemplo: derivar "tipo" de uma categoria)
```javascript
function _deriveTipo(id, lookup) {
  const node = lookup.get(id)
  if (!node) return ''
  if (node.cd_pai == null) return node.nome.toLowerCase()
  return _deriveTipo(node.cd_pai, lookup)   // recursivo até achar a raiz
}
```

### 8. Erro padronizado
```javascript
function _throwIfError(error) {
  if (error) throw new Error(error.message || String(error))
}
```
Toda função de `api.js` chama isso logo após o retorno do Supabase — não existe um try/catch central, cada chamador (as páginas) decide como tratar o erro (geralmente com um `showAppToastErro`).

---

## 🌳 Funções mais complexas (vale ler o código)

- **`fetchInvestimentos()`** — recalcula rendimento de cada caixinha por mês, cruzando `snapshot_investimento` com `lancamento_financeiro` e as regras de `relacionamento_debito_investimento`. É a versão client-side do que antes era uma query SQL pesada no backend.
- **`fetchLancamentos()` / `fetchFinancasCodigos()`** — resolvem a hierarquia de `codigo_financa` inteira em memória (`_fetchAllCodigoFinanca()` busca as 80 e poucas linhas uma vez, e todo o resto é `Map` lookup em JS).
- **`postIndicador()`** — cria a categoria filha (indicador) se não existir ainda, usando `ilike` (case-insensitive) pra evitar duplicar categorias por causa de maiúscula/minúscula.

## 🚫 Goals: funções neutralizadas
```javascript
async function fetchGoalsCodigos()  { return [] }
async function fetchGoalsMetas()    { return [] }
async function fetchGoalsEntradas() { return [] }
async function postGoalEntrada()    { return { ok: true } }
```
Essas funções continuam existindo (algumas telas antigas, como o card de Goals na Home, ainda as chamam) mas são no-ops — não existe mais tabela de goals no Supabase. Ver [09-PAGE-GOALS.md](09-PAGE-GOALS.md).

---

## 🧪 Testando queries manualmente

Sem servidor pra dar `curl`, o jeito mais rápido de testar uma query é abrir o Console do navegador (F12) na página já carregada e chamar a função direto:

```javascript
await fetchCheckins()
await sb.from('codigo_financa').select('*').limit(5)
```

Ou, pra alterações estruturais (novas tabelas, RLS), conectar direto no Postgres do projeto (Supabase → Project Settings → Database → Connection string) com `psql` ou qualquer cliente Postgres.

---

✅ **Próximo:** Veja [05-FRONTEND.md](05-FRONTEND.md) para entender o restante do frontend (navegação, cache, páginas).
