
const APP_VERSION = '24'

async function loadHTML(file, targetId) {
  const response = await fetch(`${file}?v=${APP_VERSION}`, { cache: 'default' })
  if (!response.ok) {
    throw new Error(`Falha ao carregar HTML (${response.status}): ${file}`)
  }

  const target = document.getElementById(targetId)
  if (!target) {
    throw new Error(`Container não encontrado: ${targetId}`)
  }

  const html = await response.text()
  target.innerHTML = html
}

function showAppToast(message, type = 'success') {
  const id = type === 'error' ? 'toast-erro' : 'toast'
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = message
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 2800)
}

function showAppError(message, err) {
  if (err) console.error(message, err)
  showAppToast(message, 'error')
}

const SECTIONS = {
  home:      'pages/home/home.html',
  body:      'pages/body/body.html',
  finances:  'pages/finances/finances.html',
  exercises: 'pages/exercises/exercises.html',
  goals:     'pages/goals/goals.html',
}

const SECTION_SCRIPTS = {
  home: [
    'pages/goals/goals.js?v=24',
    'pages/home/home.js?v=5',
  ],
  body: [
    'pages/body/checkin.js?v=2',
    'pages/body/body.js?v=20',
  ],
  exercises: [
    'pages/exercises/exercises.js?v=21',
  ],
  goals: [
    'pages/goals/goals.js?v=24',
  ],
  finances: [
    'pages/finances/fin-core.js?v=5',
    'pages/finances/fin-overview.js?v=3',
    'pages/finances/fin-lancamentos.js?v=5',
    'pages/finances/fin-investimentos.js?v=27',
    'pages/finances/fin-viagens.js?v=5',
    'pages/finances/fin-modals.js?v=4',
  ],
}

const _scriptLoadPromises = new Map()

function loadScriptOnce(src) {
  const cached = _scriptLoadPromises.get(src)
  if (cached) return cached

  const promise = new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.async = false
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`))
    document.body.appendChild(el)
  })

  _scriptLoadPromises.set(src, promise)
  return promise
}

async function ensureSectionScripts(section) {
  const scripts = SECTION_SCRIPTS[section] || []
  for (const src of scripts) {
    await loadScriptOnce(src)
  }
}

function _configureChartPerformanceDefaults() {
  if (!window.Chart) return

  const isTouchDevice = navigator.maxTouchPoints > 0
  const isSmallViewport = window.matchMedia('(max-width: 900px)').matches
  if (!isTouchDevice && !isSmallViewport) return

  Chart.defaults.animation = false
  Chart.defaults.responsiveAnimationDuration = 0
  Chart.defaults.datasets.line.pointRadius = 2
  Chart.defaults.datasets.line.pointHoverRadius = 3
  Chart.defaults.elements.line.tension = 0.25
  Chart.defaults.plugins.legend.labels.usePointStyle = true
}

const loadedSections = new Set()
const SECTION_DATA_TTL_MS = 45000
const _sectionDataLoadedAt = {
  home: 0,
  body: 0,
  exercises: 0,
  goals: 0,
  finances: 0,
}
let _activeSection = 'home'

function _isSectionDataFresh(section) {
  const ts = _sectionDataLoadedAt[section] || 0
  return ts > 0 && (Date.now() - ts) < SECTION_DATA_TTL_MS
}

function _touchSectionData(section) {
  _sectionDataLoadedAt[section] = Date.now()
}

function _setInlineFeedback(el, show, html = '', isError = false) {
  if (!el) return
  if (show) {
    el.classList.remove('is-hidden')
    el.classList.toggle('error', !!isError)
    el.innerHTML = html
    return
  }
  el.classList.add('is-hidden')
  el.classList.remove('error')
  el.innerHTML = ''
}

function _cleanupSectionResources(section) {
  if (section === 'body' && typeof destroyBodyCharts === 'function') destroyBodyCharts()
  if (section === 'exercises' && typeof destroyExerciseCharts === 'function') destroyExerciseCharts()
  if (section === 'finances' && typeof destroyFinanceCharts === 'function') destroyFinanceCharts()
}

window.addEventListener('sectionchange', async e => {
  const section = e.detail.section

  try {
    if (_activeSection && _activeSection !== section) {
      _cleanupSectionResources(_activeSection)
    }

    if (!loadedSections.has(section)) {
      await loadHTML(SECTIONS[section], 'section-' + section)
      loadedSections.add(section)
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
      document.getElementById('section-' + section).classList.add('active')
    }

    await ensureSectionScripts(section)

    _activeSection = section

    if (section === 'home') {
      const forceRefresh = !_isSectionDataFresh('home')
      await initHomeSection(forceRefresh)
      _touchSectionData('home')
    }
    if (section === 'body') {
      let partialLoad = false
      const failedSources = []

      const forceRefresh = !_isSectionDataFresh('body') || !entries.length || !medidas.length
      if (forceRefresh) {
        try { entries = await fetchCheckins() } catch (err) {
          entries = []
          partialLoad = true
          failedSources.push('check-ins')
          console.error('Erro ao carregar check-ins:', err)
        }
        try { medidas = await fetchMedidas() } catch (err) {
          medidas = []
          partialLoad = true
          failedSources.push('medidas')
          console.error('Erro ao carregar medidas:', err)
        }
        _touchSectionData('body')
      }

      renderDash()

      const dashFeedback = document.getElementById('dash-feedback')
      const partialHtml = `
        <div class="section-feedback-title">Body carregado parcialmente</div>
        <div class="section-feedback-sub">Alguns dados não foram carregados nesta tentativa.</div>
        <div class="section-feedback-details">${failedSources.join(' · ')}</div>
      `
      _setInlineFeedback(dashFeedback, partialLoad, partialHtml, true)

      if (partialLoad) {
        showAppToast(`Body carregado parcialmente (${failedSources.join(', ')}).`, 'error')
      }
    }
    if (section === 'exercises') {
      const forceRefresh = !_isSectionDataFresh('exercises')
      await initExSection(forceRefresh)
      _touchSectionData('exercises')
    }
    if (section === 'goals') {
      const forceRefresh = !_isSectionDataFresh('goals')
      await initGoalsSection(forceRefresh)
      _touchSectionData('goals')
    }
    if (section === 'finances') {
      const forceRefresh = !_isSectionDataFresh('finances')
      await initFinancesSection(forceRefresh)
      _touchSectionData('finances')
    }
  } catch (err) {
    showAppError(`Não foi possível carregar a seção ${section}.`, err)
  }
})

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

function showToast(id = 'toast') {
  const t = document.getElementById(id)
  if (!t) return
  t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2800)
}

async function initExSection(forceRefresh = false) {
  if (!document.getElementById('ex-modal-overlay')) {
    await loadHTML('pages/exercises/exercise-modal.html', 'modal-container-ex')
  }

  const hasCachedData = Array.isArray(window.exercicios) && window.exercicios.length > 0 && Array.isArray(window.codigosEx) && window.codigosEx.length > 0
  if (forceRefresh || !hasCachedData) {
    try {
      window.codigosEx  = await fetchCodigosExercicio()
      window.exercicios = await fetchExercicios()
    } catch (err) {
      showAppError('Não foi possível carregar os dados de exercícios.', err)
      codigosEx  = []
      exercicios = []
    }
  }

  populateGrupos()
  renderExDash()
}

async function init() {
  _configureChartPerformanceDefaults()

  try {
    await Promise.all([
      loadHTML(SECTIONS.home, 'section-home'),
      loadHTML('pages/body/checkin-modal.html', 'modal-container'),
    ])
  } catch (err) {
    showAppError('Não foi possível inicializar a aplicação.', err)
    return
  }

  loadedSections.add('home')
  document.getElementById('section-home').classList.add('active')

  try {
    await ensureSectionScripts('home')
  } catch (err) {
    showAppError('Não foi possível carregar os recursos da Home.', err)
    return
  }

  const fData = document.getElementById('f-data')
  if (fData) fData.value = new Date().toISOString().split('T')[0]

  try {
    await initHomeSection(true)
    _touchSectionData('home')
  } catch (err) {
    showAppError('Home carregada parcialmente. Tente atualizar a página.', err)
  }
}

init()