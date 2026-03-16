

const DEFAULT_SECTION = 'home'

const SECTION_META = {
  home:      { title: 'BodyLog',           action: null,                                                                 filters: false },
  body:      { title: 'Body metrics',      action: { label: 'Novo check-in',   fn: 'openModal()' },                      filters: false },
  finances:  { title: 'Finances overview', action: { label: 'Novo lançamento', fn: "openFinModal('lancamento')" },       filters: false },
  exercises: { title: 'Exercises tracker', action: { label: 'Novo treino',     fn: 'openExModal()' },                    filters: true  },
  goals:     { title: 'Goals overview',    action: { label: 'Registrar dia',   fn: 'openGoalsModal()' },                 filters: false },
}

let _currentSection = DEFAULT_SECTION
let _filtersOpen = false

function _syncSidebarNav(name) {
  document.querySelectorAll('.sidebar-item').forEach(el =>
    el.classList.toggle('active', el.dataset.section === name)
  )
}

function _renderSidebarContext(meta) {
  const el = document.getElementById('sidebar-context')
  if (!el) return
  el.innerHTML = meta.action ? `
    <div class="sidebar-context-title">Ação rápida</div>
    <button class="sidebar-btn" onclick="${meta.action.fn}">
      <span>+</span> ${meta.action.label}
    </button>` : ''
}

function _renderTopbarAction(meta) {
  const el = document.getElementById('topbar-action')
  if (!el) return
  el.innerHTML = meta.action ? `
    <button class="btn-add topbar-action-btn" onclick="${meta.action.fn}">
      <span>+</span> ${meta.action.label}
    </button>` : ''
}

function _syncTopbar(meta) {
  const topbar = document.getElementById('topbar')
  const toggle = document.getElementById('topbar-filter-toggle')
  const title  = document.getElementById('topbar-section-title')
  if (title)  title.textContent = meta.title
  if (toggle) toggle.style.display = meta.filters ? 'flex' : 'none'
  // Desktop: topbar só aparece na aba Exercises (por causa dos filtros)
  if (topbar) topbar.classList.toggle('has-content', !!meta.filters)
}

function _syncLastUpdate(name) {
  const body = document.getElementById('last-update-label')
  const ex   = document.getElementById('ex-last-update-label')
  if (body) body.style.display = name === 'body'      ? '' : 'none'
  if (ex)   ex.style.display   = name === 'exercises' ? '' : 'none'
}

// Altere o valor abaixo para o PIN que você quiser usar
const FINANCES_PIN = '1234'

function _financesUnlocked() {
  return sessionStorage.getItem('finances_ok') === '1'
}

function _showFinancesPin(onSuccess) {
  const overlay = document.getElementById('finances-pin-overlay')
  const input   = document.getElementById('finances-pin-input')
  const error   = document.getElementById('finances-pin-error')
  overlay.style.display = 'flex'
  input.value = ''
  error.style.display = 'none'
  setTimeout(() => input.focus(), 50)

  function tryUnlock() {
    if (input.value === FINANCES_PIN) {
      sessionStorage.setItem('finances_ok', '1')
      overlay.style.display = 'none'
      input.removeEventListener('keydown', onKey)
      document.getElementById('finances-pin-btn').onclick = null
      onSuccess()
    } else {
      error.style.display = 'block'
      input.value = ''
      input.focus()
    }
  }

  function onKey(e) { if (e.key === 'Enter') tryUnlock() }
  input.addEventListener('keydown', onKey)
  document.getElementById('finances-pin-btn').onclick = tryUnlock
  document.getElementById('finances-pin-cancel').onclick = () => {
    overlay.style.display = 'none'
    input.removeEventListener('keydown', onKey)
  }
}

function switchSection(name) {
  if (name === 'finances' && !_financesUnlocked()) {
    _showFinancesPin(() => switchSection('finances'))
    return
  }
  if (_currentSection === name && document.getElementById('section-' + name)?.classList.contains('active')) {
    closeMobileSidebar()
    return
  }
  _currentSection = name
  const meta = SECTION_META[name] || {}

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  const target = document.getElementById('section-' + name)
  if (target) target.classList.add('active')

  _syncSidebarNav(name)
  _renderSidebarContext(meta)
  _renderTopbarAction(meta)
  _syncTopbar(meta)
  _syncLastUpdate(name)

  if (!meta.filters) _closeFilters()

  closeMobileSidebar()
  window.dispatchEvent(new CustomEvent('sectionchange', { detail: { section: name } }))
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed')
  document.body.classList.toggle('sidebar-collapsed')
}

function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('mobile-open')
  document.getElementById('sidebar-overlay').classList.add('visible')
  document.body.style.overflow = 'hidden'
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open')
  document.getElementById('sidebar-overlay').classList.remove('visible')
  document.body.style.overflow = ''
}

function toggleExFilters() {
  _filtersOpen = !_filtersOpen
  const bar = document.getElementById('ex-filters-bar')
  const btn = document.getElementById('topbar-filter-toggle')
  if (bar) bar.style.display = _filtersOpen ? 'block' : 'none'
  if (btn) btn.classList.toggle('active', _filtersOpen)
}

function _closeFilters() {
  _filtersOpen = false
  const bar = document.getElementById('ex-filters-bar')
  const btn = document.getElementById('topbar-filter-toggle')
  if (bar) bar.style.display = 'none'
  if (btn) btn.classList.remove('active')
}

window.addEventListener('resize', () => {
  const meta = SECTION_META[_currentSection] || {}
  const topbar = document.getElementById('topbar')
  if (topbar) topbar.classList.toggle('has-content', !!meta.filters)
})

// Sincronização inicial da sidebar com a seção padrão
_renderSidebarContext(SECTION_META[DEFAULT_SECTION])
_renderTopbarAction(SECTION_META[DEFAULT_SECTION])
_syncTopbar(SECTION_META[DEFAULT_SECTION])
