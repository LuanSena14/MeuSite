// ─────────────────────────────────────────────────────────────────────────────
// app.js — inicialização da aplicação, carregamento de HTML e controle de modais
// ─────────────────────────────────────────────────────────────────────────────

const APP_VERSION = '13'

async function loadHTML(file, targetId) {
  const response = await fetch(`${file}?v=${APP_VERSION}`, { cache: 'no-cache' })
  const html = await response.text()
  document.getElementById(targetId).innerHTML = html
}

// ── NAVEGAÇÃO ENTRE SEÇÕES ────────────────────────────────────────────────────

const SECTIONS = {
  home:      'sections/home.html',
  body:      'sections/body.html',
  finances:  'sections/finances.html',
  exercises: 'sections/exercises.html',
  goals:     'sections/goals.html',
}

const loadedSections = new Set()

// Ouve evento disparado pela sidebar (index.html)
window.addEventListener('sectionchange', async e => {
  const section = e.detail.section

  if (!loadedSections.has(section)) {
    await loadHTML(SECTIONS[section], 'section-' + section)
    loadedSections.add(section)
    // Ativa a seção recém-carregada (sidebar já marcou .active no elemento)
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
    document.getElementById('section-' + section).classList.add('active')
  }

  if (section === 'home')      initHomeSection()
  if (section === 'body') {
    try { entries = await fetchCheckins() } catch { entries = [] }
    try { medidas = await fetchMedidas()  } catch { medidas = [] }
    renderDash()
  }
  if (section === 'exercises') initExSection()
  if (section === 'goals')     initGoalsSection()
  if (section === 'finances')  initFinancesSection()
})

// ── MODAL BODY ────────────────────────────────────────────────────────────────

function openModal() {
  document.getElementById('modal-overlay').classList.add('open')
  document.body.style.overflow = 'hidden'
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open')
  document.body.style.overflow = ''
}
function closeModalOutside(event) {
  if (event.target === document.getElementById('modal-overlay')) closeModal()
}

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return
  closeModal()
  if (typeof closeExModal === 'function') closeExModal()
  if (typeof closeGoalsModal === 'function') closeGoalsModal()
})

// ── TOAST ─────────────────────────────────────────────────────────────────────

function showToast(id = 'toast') {
  const t = document.getElementById(id)
  t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2800)
}

// ── INIT EXERCISES ────────────────────────────────────────────────────────────

async function initExSection() {
  if (!document.getElementById('ex-modal-overlay')) {
    await loadHTML('modals/exercise-modal.html', 'modal-container-ex')
  }

  try {
    window.codigosEx  = await fetchCodigosExercicio()
    window.exercicios = await fetchExercicios()
  } catch (err) {
    console.error('Erro ao carregar exercícios:', err)
    codigosEx  = []
    exercicios = []
  }

  populateGrupos()

  if (exercicios.length > 0) {
    renderExDash()
  }
}

// ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────────

async function init() {
  await Promise.all([
    loadHTML(SECTIONS.home, 'section-home'),
    loadHTML('modals/checkin-modal.html', 'modal-container'),
  ])

  loadedSections.add('home')
  document.getElementById('section-home').classList.add('active')

  // Pré-preenche data do modal de check-in (já carregado acima)
  const fData = document.getElementById('f-data')
  if (fData) fData.value = new Date().toISOString().split('T')[0]

  initHomeSection()
}

init()