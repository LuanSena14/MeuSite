# 13. Deployment em Produção - Publicar BodyLog

## 🚀 Objetivo

Publicar o BodyLog em produção. Como o app é **front-end only**, isso significa hospedar arquivos estáticos + garantir que o projeto Supabase esteja configurado corretamente — não existe mais deploy de backend.

---

## 🌐 Duas partes independentes

### 1. Frontend (arquivos estáticos)
Qualquer host de arquivos estáticos serve: Render (static site), Vercel, Netlify, GitHub Pages, Cloudflare Pages. Não precisa runtime de servidor, não precisa build step — é publicar a pasta `FrontEnd/` como está.

### 2. Supabase (banco + API)
Já está hospedado e sempre online (não tem "deploy" no sentido tradicional) — o trabalho aqui é de configuração, não de deploy:
- Schema (`supabase/schema.sql`) já aplicado
- RLS habilitado com as policies corretas
- Chave anon/publishable é a que fica em `supabase-client.js`

---

## 📦 Deploy do Frontend

### Exemplo: Render (static site)
1. **New → Static Site**
2. Conecte o repositório GitHub
3. **Build command:** (vazio — não há build)
4. **Publish directory:** `FrontEnd`
5. Deploy automático a cada `git push`

### Exemplo: Vercel
```bash
npm install -g vercel
cd FrontEnd
vercel --prod
```

### Exemplo: Netlify
```bash
npm install -g netlify-cli
cd FrontEnd
netlify deploy --prod --dir .
```

### Exemplo: GitHub Pages
Configurar o Pages do repositório pra servir a pasta `FrontEnd/` (ou publicar via GitHub Action que copia `FrontEnd/` pra branch `gh-pages`).

Em todos os casos, o resultado é o mesmo: um servidor HTTP simples devolvendo `index.html`, `*.css`, `*.js` como estão. Nenhuma variável de ambiente de servidor é necessária — as credenciais do Supabase usadas pelo app já estão em `FrontEnd/shared/js/supabase-client.js` (é a chave pública, ok estar no código).

---

## 🗄️ Configuração do Supabase (uma vez só, não é "deploy" recorrente)

### Criar o projeto
1. [supabase.com](https://supabase.com) → New Project
2. Anotar a **URL do projeto** e a **chave publishable/anon** (Project Settings → API)

### Aplicar o schema
Rodar `supabase/schema.sql` uma vez, direto no **SQL Editor** do Supabase (ou via `psql` usando a connection string do banco, em Project Settings → Database).

### Popular dados iniciais
Se estiver migrando de um banco anterior, usar um script pontual (`psycopg2` + `INSERT ... OVERRIDING SYSTEM VALUE` pra preservar IDs) apontando a origem antiga e o destino Supabase. Isso não faz parte do fluxo de deploy normal — é uma tarefa única de migração.

### Conferir RLS
Toda tabela deve ter RLS habilitado e uma policy que permita o uso esperado (ver [03-DATABASE.md](03-DATABASE.md)). Sem RLS habilitado, o Supabase bloqueia todo acesso por padrão a partir da chave anon — o app simplesmente não vai conseguir ler nem gravar nada.

---

## 🔐 Segurança em Produção

### Chaves do Supabase
| Chave | Onde usar | Cuidado |
|-------|-----------|---------|
| `sb_publishable_...` (anon) | `FrontEnd/shared/js/supabase-client.js` | Ok estar pública — é assim que funciona |
| `sb_secret_...` (service_role) | **Nunca** no frontend | Ignora RLS por completo; só usar manualmente (scripts locais) |

### PIN de Finances
```javascript
// shared/js/nav.js
const FINANCES_PIN = '1234'
```
É uma cortina de privacidade de UI, guardada em texto puro no código-fonte público — **não é controle de acesso real**. Quem realmente protege os dados financeiros é a policy de RLS da tabela no Supabase. Se algum dia precisar de proteção de verdade, o caminho é Supabase Auth (login) + policies que checam `auth.uid()`, não um PIN no JS.

### HTTPS
Qualquer host de estático moderno (Render, Vercel, Netlify, GitHub Pages) já serve com HTTPS automático.

---

## 🧪 Testar em Produção

```bash
# Abrir o site publicado no navegador e checar:
# 1. Console sem erros
# 2. Aba Network: chamadas a https://<projeto>.supabase.co/rest/v1/... retornando 200
```

---

## 💾 Backup do Supabase

O dashboard do Supabase já oferece backup automático (frequência depende do plano). Backup manual:
```bash
pg_dump "postgresql://postgres:SENHA@db.<projeto>.supabase.co:5432/postgres" > backup.sql
```

---

## 🔄 Rollback

### Frontend
Como é só arquivo estático versionado no Git, reverter é `git revert`/redeploy — igual qualquer site estático.

### Dados (Supabase)
Não há "rollback" automático de dados — restaurar a partir de um backup (`pg_dump`) é a única via, então backups regulares importam mais agora do que quando havia um Postgres gerenciado pelo Render com snapshots diários prontos.

---

## 📋 Checklist de Deploy

- ✅ Código no GitHub
- ✅ `FrontEnd/` publicado num host estático (build command vazio)
- ✅ Projeto Supabase criado, schema aplicado (`supabase/schema.sql`)
- ✅ RLS habilitado em todas as tabelas, com as policies corretas
- ✅ `supabase-client.js` apontando pro projeto/chave certos
- ✅ HTTPS funcionando (automático na maioria dos hosts)
- ✅ Testado: Console sem erro, requisições ao Supabase retornando 200
- ✅ Backup do banco configurado/testado

---

✅ **Próximo:** Veja [14-QUICK-GUIDES.md](14-QUICK-GUIDES.md) para adicionar novas features.

✅ **Depois:** Explore [15-MAINTENANCE.md](15-MAINTENANCE.md) para operações rotineiras.
