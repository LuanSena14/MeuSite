// ─────────────────────────────────────────────────────────────────────────────
// app.js — inicialização e navegação
// ─────────────────────────────────────────────────────────────────────────────

async function loadView(file, targetId) {
  const response = await fetch(file)
  const html = await response.text()
  document.getElementById(targetId).innerHTML = html
}

async function switchView(view, event) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
  document.getElementById('view-' + view).classList.add('active')
  event.target.classList.add('active')

  if (view === 'dash') {
    try {
      // Carrega em paralelo: mais rápido que sequencial
      [entries, medidas] = await Promise.all([
        fetchCheckins(),   // api.js
        fetchMedidas(),    // api.js
      ])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      entries = []
      medidas = []
    }
    renderDash()  // dashboard.js
  }
}

function showToast(id = 'toast') {
  const t = document.getElementById(id)
  t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2800)
}

// ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────────

async function init() {
  await loadView('./dashboard.html', 'view-dash')
  await loadView('./checkin.html', 'view-form')

  document.getElementById('f-data').value = new Date().toISOString().split('T')[0]

  // Carrega dados iniciais e renderiza o dashboard (que abre primeiro)
  try {
    [entries, medidas] = await Promise.all([
      fetchCheckins(),
      fetchMedidas(),
    ])
  } catch (err) {
    console.error('Erro ao carregar dados iniciais:', err)
    entries = []
    medidas = []
  }
  renderDash()
}

init()