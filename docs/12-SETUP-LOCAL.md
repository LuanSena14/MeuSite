# 12. Setup Local - Como Rodar BodyLog na sua máquina

## 🎯 Objetivo

Rodar o BodyLog localmente pra desenvolvimento. Como não existe mais backend nem banco local, isso é bem mais simples do que era antes: só precisa servir os arquivos estáticos — o app já fala direto com o Supabase de produção.

---

## 📋 Pré-requisitos

### 1. Git
```bash
git --version
```

### 2. Algo que sirva arquivos estáticos
Qualquer um serve: `python -m http.server`, `npx serve`, a extensão Live Server do VS Code, etc. Este projeto já traz um script pronto usando Python (`start-local.ps1`).

### 3. Editor de Texto
VS Code (recomendado) ou o que preferir.

> Não precisa de PostgreSQL, Python com venv, `pip install`, nem `.env` de backend — tudo isso foi removido junto com o backend Python.

---

## 🚀 Passo 1: Clone o Repositório

```bash
git clone https://github.com/seuusuario/MeuSite.git
cd MeuSite
```

Estrutura esperada:
```
MeuSite/
├── README.md
├── supabase/
│   └── schema.sql
├── FrontEnd/
├── docs/
└── start-local.ps1
```

---

## 🎨 Passo 2: Suba o servidor estático

### Windows (PowerShell) — usando o script pronto
```powershell
.\start-local.ps1
# Servindo FrontEnd em http://127.0.0.1:8080 ...
```
O script (`start-local.ps1`) só faz `python -m http.server $Port` dentro de `FrontEnd/`. Pode passar outra porta: `.\start-local.ps1 -Port 3000`.

### Qualquer sistema (manual)
```bash
cd FrontEnd
python -m http.server 8080
# ou: npx serve -l 8080
```

### Abra no navegador
```
http://127.0.0.1:8080
```

**Resultado esperado:** sidebar com Overview, Body, Finances, Exercises, Goals — Home carrega com dados reais (vindos do Supabase de produção, já que não há um "banco local" separado).

---

## 🔧 Passo 3: Verificar Conexão com o Supabase

Abra **Developer Tools** (F12):
- Aba **Console**: não deve ter nenhum erro em vermelho na carga inicial
- Aba **Network**: clique em "Body" na sidebar e procure requisições pra `https://jgqzclewwxmgjlqpxejc.supabase.co/rest/v1/...` — status deve ser **200**

Se aparecer erro 401/403: a policy de RLS da tabela pode estar bloqueando, ou a chave em `FrontEnd/shared/js/supabase-client.js` está errada/expirada.

Se aparecer erro de rede (`Failed to fetch`): confira sua conexão com a internet — diferente do setup antigo, não existe "backend local" pra funcionar offline; o app sempre precisa alcançar o Supabase.

---

## ✅ Checklist Completo

- ✅ Repositório clonado
- ✅ Servidor estático rodando (`start-local.ps1` ou equivalente)
- ✅ Frontend abrindo no navegador em `http://127.0.0.1:8080`
- ✅ Console sem erros
- ✅ Requisições ao Supabase retornando 200 (aba Network)

---

## 🐛 Troubleshooting

### Porta já em uso
```powershell
.\start-local.ps1 -Port 8081
```
ou pare o processo que já está escutando na porta (o script antigo tinha um parâmetro `-KillPort`; a versão atual, mais simples, não precisa disso — é só trocar de porta).

### Página carrega mas nenhuma seção mostra dado
1. Confira o Console (F12) por erros de JavaScript.
2. Confira se `shared/js/supabase-client.js` está sendo carregado **antes** de `api.js` no `index.html` (ordem dos `<script>` importa).
3. Teste uma query manualmente no Console: `await sb.from('checkins').select('*').limit(1)`.

### Erro de CORS
Não deveria acontecer — o Supabase já libera qualquer origem por padrão nas configurações do projeto. Se aparecer, confira se a URL/chave em `supabase-client.js` correspondem mesmo ao projeto Supabase certo.

### Quero testar com dados diferentes dos de produção
Não existe "banco local" separado. Se quiser isolar testes, crie um **segundo projeto Supabase** (gratuito), rode `supabase/schema.sql` nele, e troque temporariamente a URL/chave em `supabase-client.js` — lembrando de reverter antes de commitar.

---

## 📱 Testar no Celular (Mesma Rede)

```powershell
# Descobrir o IP da sua máquina
ipconfig   # Windows, procure "IPv4 Address"
```

No celular (mesma rede Wi-Fi), acesse `http://SEU-IP:8080`. Como o app fala direto com o Supabase (não com `localhost`), não precisa editar nenhuma URL de API pra isso funcionar — diferente do setup antigo com backend local.

---

## 🚀 Próximos Passos

1. Explore `FrontEnd/shared/js/api.js` pra entender como cada tela busca dados.
2. Veja [04-BACKEND.md](04-BACKEND.md) pra entender os padrões de query usados.
3. Se quiser alterar o schema, veja [03-DATABASE.md](03-DATABASE.md) (seção "Como alterar o schema").

---

✅ **Próximo:** Veja [13-DEPLOYMENT.md](13-DEPLOYMENT.md) para publicar em produção.
