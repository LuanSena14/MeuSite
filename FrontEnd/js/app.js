// ─────────────────────────────────────────────────────────────────────────────
// app.js — inicialização da aplicação e navegação entre views
// Este é o ponto de entrada, carregado por último no index.html
// ─────────────────────────────────────────────────────────────────────────────

// Carrega o HTML de um arquivo externo e injeta numa div
// Isso permite manter checkin.html e dashboard.html separados
async function loadView(file, targetId) {
  const response = await fetch(file)
  const html = await response.text()
  document.getElementById(targetId).innerHTML = html
}

// Troca a view ativa (formulário ↔ dashboard)
async function switchView(view, event) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
  document.getElementById('view-' + view).classList.add('active')
  event.target.classList.add('active')

  if (view === 'dash') {
    try {
      entries = await fetchCheckins()  // fetchCheckins está em api.js
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      entries = []
    }
    renderDash()  // renderDash está em dashboard.js
  }
}

// Mostra um toast de sucesso ou erro
function showToast(id = 'toast') {
  const t = document.getElementById(id)
  t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2800)
}

// ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────────

async function init() {
  // Carrega os HTMLs das views nos seus containers
  await loadView('checkin.html',  'view-form')
  await loadView('dashboard.html', 'view-dash')

  // Define a data de hoje no campo de data do formulário
  document.getElementById('f-data').value = new Date().toISOString().split('T')[0]
}

// Roda quando a página termina de carregar
init()