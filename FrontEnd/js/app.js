// ─────────────────────────────────────────────────────────────────────────────
// app.js — inicialização, navegação entre seções e controle do modal
// ─────────────────────────────────────────────────────────────────────────────

async function loadHTML(file, targetId) {
  const response = await fetch(file)
  const html = await response.text()
  document.getElementById(targetId).innerHTML = html
}

// ── NAVEGAÇÃO ENTRE SEÇÕES ────────────────────────────────────────────────────

const SECTIONS = {
  body:      'sections/body.html',
  finances:  'sections/finances.html',
  exercises: 'sections/exercises.html',
}

const loadedSections = new Set()

async function switchSection(section) {
  // Sincroniza tabs do desktop e da mobile-nav
  document.querySelectorAll('[data-section]').forEach(t => {
    t.classList.toggle('active', t.dataset.section === section)
  })

  if (!loadedSections.has(section)) {
    await loadHTML(SECTIONS[section], 'section-' + section)
    loadedSections.add(section)
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  document.getElementById('section-' + section).classList.add('active')

  if (section === 'body')      renderDash()
  if (section === 'exercises') initExSection()
}

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
    console.log('exercicios:', exercicios)
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
    loadHTML(SECTIONS.body, 'section-body'),
    loadHTML('modals/checkin-modal.html', 'modal-container'),
  ])

  loadedSections.add('body')
  document.getElementById('section-body').classList.add('active')
  document.getElementById('f-data').value = new Date().toISOString().split('T')[0]

  try { entries = await fetchCheckins() }
  catch (err) { entries = [] }

  try { medidas = await fetchMedidas() }
  catch (err) { medidas = [] }

  renderDash()
  initExSection()
}

init()