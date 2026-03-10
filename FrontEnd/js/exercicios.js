// ─────────────────────────────────────────────────────────────────────────────
// exercicios.js — dashboard com cross-filtering + drill-down nos gráficos
// ─────────────────────────────────────────────────────────────────────────────

window.exercicios = []
window.codigosEx  = []

// Segurança: ChartDataLabels passado por instância
const _DL = (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : []

// ── ESTADO ────────────────────────────────────────────────────────────────────

const exFiltros = { de: null, ate: null, mes: null, grupoNome: null, exNome: null }
const exCross   = { mes: null, grupo: null }

// Estado de drill-down
const exDrill = {
  barMode:   'mes',    // 'mes' | 'dia'
  barMes:    null,     // "YYYY-MM" — mês aberto no drill
  roscaMode: 'grupo',  // 'grupo' | 'exercicio'
  roscaGrupo: null,    // nome do grupo aberto no drill
}

// ── FILTROS MANUAIS ───────────────────────────────────────────────────────────

function applyExFilters() {
  const de  = document.getElementById('ex-filter-de')?.value
  const ate = document.getElementById('ex-filter-ate')?.value
  const mes = document.getElementById('ex-filter-mes')?.value

  exFiltros.de        = de  ? new Date(de  + 'T00:00:00') : null
  exFiltros.ate       = ate ? new Date(ate + 'T23:59:59') : null
  exFiltros.mes       = mes || null
  exFiltros.grupoNome = document.getElementById('ex-filter-grupo')?.value    || null
  exFiltros.exNome    = document.getElementById('ex-filter-exercicio')?.value || null

  if (exFiltros.mes) {
    const [y, m] = exFiltros.mes.split('-').map(Number)
    exFiltros.de  = new Date(y, m - 1, 1)
    exFiltros.ate = new Date(y, m, 0, 23, 59, 59)
  }
  renderExDash()
}

function clearExFilters() {
  document.getElementById('ex-filter-de').value        = ''
  document.getElementById('ex-filter-ate').value       = ''
  document.getElementById('ex-filter-mes').value       = ''
  document.getElementById('ex-filter-grupo').value     = ''
  document.getElementById('ex-filter-exercicio').value = ''
  exFiltros.de = exFiltros.ate = exFiltros.mes = exFiltros.grupoNome = exFiltros.exNome = null
  exCross.mes = exCross.grupo = null
  exDrill.barMode = 'mes'; exDrill.barMes = null
  exDrill.roscaMode = 'grupo'; exDrill.roscaGrupo = null
  renderExDash()
}

// ── CROSS-FILTERING ───────────────────────────────────────────────────────────

function setCrossMes(mesKey) {
  exCross.mes = exCross.mes === mesKey ? null : mesKey
  renderExDash()
}

function setCrossGrupo(grupoNome) {
  exCross.grupo = exCross.grupo === grupoNome ? null : grupoNome
  renderExDash()
}

function clearCross(tipo) {
  exCross[tipo] = null
  renderExDash()
}

// ── DRILL-DOWN: BARRAS ────────────────────────────────────────────────────────

function exDrillIntoMes(mesKey) {
  exDrill.barMode = 'dia'
  exDrill.barMes  = mesKey
  exCross.mes     = null   // limpa cross-filter de mês ao entrar no drill
  renderExDash()
}

function exDrillBack() {
  exDrill.barMode = 'mes'
  exDrill.barMes  = null
  renderExDash()
}

// ── DRILL-DOWN: ROSCA ─────────────────────────────────────────────────────────

function exRoscaDrillInto(grupoNome) {
  exDrill.roscaMode  = 'exercicio'
  exDrill.roscaGrupo = grupoNome
  exCross.grupo      = null
  renderExDash()
}

function exRoscaDrillBack() {
  exDrill.roscaMode  = 'grupo'
  exDrill.roscaGrupo = null
  renderExDash()
}

// ── DADOS FILTRADOS ───────────────────────────────────────────────────────────

function _baseFilter(e) {
  const d = new Date(e.data.split('T')[0] + 'T00:00:00')
  if (exFiltros.de  && d < exFiltros.de)  return false
  if (exFiltros.ate && d > exFiltros.ate) return false
  if (exFiltros.grupoNome && e.grupo_nome     !== exFiltros.grupoNome) return false
  if (exFiltros.exNome    && e.exercicio_nome !== exFiltros.exNome)    return false
  return true
}

function getExFiltrados() {
  return exercicios.filter(e => {
    if (!_baseFilter(e)) return false
    const d   = new Date(e.data.split('T')[0] + 'T00:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    if (exCross.mes   && key !== exCross.mes)        return false
    if (exCross.grupo && e.grupo_nome !== exCross.grupo) return false
    // drill de mês filtra também
    if (exDrill.barMode === 'dia' && exDrill.barMes && key !== exDrill.barMes) return false
    return true
  })
}

// Para o gráfico de barras: sem cross de mês (para não colapsar)
function _barBase() {
  return exercicios.filter(e => {
    if (!_baseFilter(e)) return false
    if (exCross.grupo && e.grupo_nome !== exCross.grupo) return false
    return true
  })
}

// Para a rosca: sem cross de grupo
function _roscaBase() {
  return exercicios.filter(e => {
    if (!_baseFilter(e)) return false
    const d   = new Date(e.data.split('T')[0] + 'T00:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    if (exCross.mes && key !== exCross.mes) return false
    if (exDrill.barMode === 'dia' && exDrill.barMes && key !== exDrill.barMes) return false
    return true
  })
}

// ── CHIPS ─────────────────────────────────────────────────────────────────────

function renderExChips() {
  const container = document.getElementById('ex-active-chips')
  if (!container) return
  const chips = []

  if (exCross.mes && exDrill.barMode === 'mes') {
    const [y, m] = exCross.mes.split('-')
    const label  = new Date(parseInt(y), parseInt(m)-1, 1)
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    chips.push(`<span class="ex-chip" onclick="clearCross('mes')">📅 ${label} <span class="ex-chip-x">✕</span></span>`)
  }
  if (exCross.grupo && exDrill.roscaMode === 'grupo') {
    chips.push(`<span class="ex-chip" onclick="clearCross('grupo')">💪 ${exCross.grupo} <span class="ex-chip-x">✕</span></span>`)
  }

  container.innerHTML = chips.join('')
  container.style.display = chips.length ? 'flex' : 'none'
}

// ── SELECTS ───────────────────────────────────────────────────────────────────

function populateExFilterSelects() {
  const grupos = [...new Set(exercicios.map(e => e.grupo_nome).filter(Boolean))].sort()
  const exs    = [...new Set(exercicios.map(e => e.exercicio_nome).filter(Boolean))].sort()

  const selG = document.getElementById('ex-filter-grupo')
  const selE = document.getElementById('ex-filter-exercicio')
  if (!selG || !selE) return

  const prevG = selG.value, prevE = selE.value

  selG.innerHTML = '<option value="">Todos</option>'
  grupos.forEach(g => selG.innerHTML += `<option value="${g}"${g===prevG?' selected':''}>${g}</option>`)

  selE.innerHTML = '<option value="">Todos</option>'
  exs.forEach(x => selE.innerHTML += `<option value="${x}"${x===prevE?' selected':''}>${x}</option>`)
}

// ── MODAL ─────────────────────────────────────────────────────────────────────

function openExModal() {
  document.getElementById('ex-modal-overlay').classList.add('open')
  document.body.style.overflow = 'hidden'
}
function closeExModal() {
  document.getElementById('ex-modal-overlay').classList.remove('open')
  document.body.style.overflow = ''
}
function closeExModalOutside(e) {
  if (e.target === document.getElementById('ex-modal-overlay')) closeExModal()
}
function clearExForm() {
  document.getElementById('ex-grupo').value        = ''
  document.getElementById('ex-exercicio').value    = ''
  document.getElementById('ex-exercicio').disabled = true
  document.getElementById('ex-duracao').value      = ''
  document.getElementById('ex-esforco').value      = ''
}
function onGrupoChange() {
  const grupoId = parseInt(document.getElementById('ex-grupo').value)
  const selEx   = document.getElementById('ex-exercicio')
  const grupo   = codigosEx.find(g => g.id === grupoId)
  selEx.innerHTML = '<option value="">Selecione...</option>'
  if (grupo?.filhos?.length) {
    grupo.filhos.forEach(f => selEx.innerHTML += `<option value="${f.id}">${f.descricao}</option>`)
    selEx.disabled = false
  } else { selEx.disabled = true }
}
function populateGrupos() {
  const sel = document.querySelector('#ex-grupo')
  if (!sel) return
  sel.innerHTML = '<option value="">Selecione um grupo...</option>'
  codigosEx.forEach(g => sel.innerHTML += `<option value="${g.id}">${g.descricao}</option>`)
}
async function saveExercise() {
  const cdExercicio = parseInt(document.getElementById('ex-exercicio').value)
  const hora        = document.getElementById('ex-hora').value
  const duracao     = document.getElementById('ex-duracao').value
  const esforco     = document.getElementById('ex-esforco').value
  const data        = document.getElementById('ex-data').value

  if (!cdExercicio) { alert('Selecione um exercício!'); return }
  if (!hora)        { alert('Informe a hora!'); return }
  if (!data)        { alert('Informe a data!'); return }

  const btn = document.getElementById('ex-btn-salvar')
  btn.disabled = true
  btn.innerHTML = '<span>⏳</span> Salvando...'
  try {
    const result = await postExercise({
      date: data, hora: hora+':00', cd_exercicio: cdExercicio,
      duracao: duracao ? parseInt(duracao) : null,
      esforco: esforco ? parseInt(esforco) : null,
    })
    if (result.ok) {
      clearExForm(); closeExModal(); showToast('toast')
      window.exercicios = await fetchExercicios()
      populateExFilterSelects(); renderExDash()
    } else { showToast('toast-erro') }
  } catch (err) { console.error(err); showToast('toast-erro') }
  finally { btn.disabled = false; btn.innerHTML = '<span>💾</span> Salvar treino' }
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

function renderExDash() {
  const empty   = document.getElementById('ex-empty')
  const content = document.getElementById('ex-content')
  const lastLbl = document.getElementById('ex-last-update-label')
  if (!empty || !content) return

  populateExFilterSelects()
  renderExChips()

  if (exercicios.length === 0) {
    empty.style.display = 'block'; content.style.display = 'none'; return
  }
  empty.style.display = 'none'; content.style.display = 'block'

  const ultimo = exercicios[exercicios.length - 1]
  if (ultimo && lastLbl) lastLbl.textContent = 'Último: ' + formatExDate(ultimo.data)

  const filtrados = getExFiltrados()
  renderExKPIs(filtrados)
  renderExChartBar(_barBase())
  renderExChartRosca(_roscaBase())
  renderExChartPeriodo(filtrados)
  renderExHistory(filtrados)
}

function formatExDate(iso) {
  const [y, m, d] = iso.split('T')[0].split('-')
  return new Date(y, m-1, d).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })
}

// ── KPIs ──────────────────────────────────────────────────────────────────────

function renderExKPIs(filtrados) {
  document.getElementById('ex-kpi-total').textContent     = filtrados.length || '0'
  document.getElementById('ex-kpi-total-delta').innerHTML = ''

  const comDur = filtrados.filter(e => e.duracao)
  const media  = comDur.length ? Math.round(comDur.reduce((s,e) => s+e.duracao, 0) / comDur.length) : null
  document.getElementById('ex-kpi-media').innerHTML =
    media != null ? `${media}<span class="kpi-unit">min</span>` : '—'
  document.getElementById('ex-kpi-media-delta').innerHTML = ''

  const total = filtrados.reduce((s,e) => s+(e.duracao||0), 0)
  document.getElementById('ex-kpi-tempo').innerHTML =
    total > 0 ? `${total}<span class="kpi-unit">min</span>` : '—'

  const comEsf = filtrados.filter(e => e.esforco)
  const esf    = comEsf.length ? (comEsf.reduce((s,e) => s+e.esforco,0)/comEsf.length).toFixed(1) : null
  document.getElementById('ex-kpi-esforco').innerHTML =
    esf != null ? `${esf}<span class="kpi-unit">/10</span>` : '—'
}

// ── GRÁFICO DE BARRAS (meses → dias) ─────────────────────────────────────────

let exChartBar = null
const BAR_W    = 56

function renderExChartBar(base) {
  const canvas    = document.getElementById('ex-chart-freq')
  const container = canvas?.parentElement
  if (!canvas) return

  const titleEl     = document.getElementById('ex-bar-title')
  const hintEl      = document.getElementById('ex-bar-hint')
  const breadcrumb  = document.getElementById('ex-bar-breadcrumb')
  const isDrill     = exDrill.barMode === 'dia'

  // ── Agrupa dados ──
  let keys, labels, data, accentKey

  if (!isDrill) {
    // Nível mês
    const meses = {}
    base.forEach(e => {
      const [y,m,day] = e.data.split('T')[0].split('-').map(Number)
      const d = new Date(y, m-1, day)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      meses[key] = (meses[key]||0) + 1
    })
    keys   = Object.keys(meses).sort()
    labels = keys.map(k => {
      const [y,m] = k.split('-')
      return new Date(parseInt(y), parseInt(m)-1, 1)
        .toLocaleDateString('pt-BR', { month:'short', year:'2-digit' })
    })
    data      = keys.map(k => meses[k])
    accentKey = exCross.mes

    if (titleEl) titleEl.textContent = 'Treinos por mês'
    if (hintEl)  hintEl.textContent  = 'clique numa barra para ver os dias'
    if (breadcrumb) breadcrumb.style.display = 'none'

  } else {
    // Nível dia (drill-down do mês selecionado)
    const [dy, dm] = exDrill.barMes.split('-').map(Number)
    const diasNoMes = new Date(dy, dm, 0).getDate()
    const diasMap   = {}
    for (let i = 1; i <= diasNoMes; i++) diasMap[String(i).padStart(2,'0')] = 0

    base.filter(e => {
      const [y,m,day] = e.data.split('T')[0].split('-').map(Number)
      const d = new Date(y, m-1, day)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      return key === exDrill.barMes
    }).forEach(e => {
      const dia = e.data.split('T')[0].split('-')[2]
      diasMap[dia] = (diasMap[dia]||0) + 1
    })

    keys   = Object.keys(diasMap).sort()
    labels = keys.map(k => {
      const mesNome = new Date(dy, dm-1, 1).toLocaleDateString('pt-BR', { month:'short' })
      return `${parseInt(k)} ${mesNome}`
    })
    data      = keys.map(k => diasMap[k])
    accentKey = null  // sem cross-filter no nível dia

    const mesLabel = new Date(dy, dm-1, 1).toLocaleDateString('pt-BR', { month:'long', year:'numeric' })
    if (titleEl) titleEl.textContent = `Treinos em ${mesLabel}`
    if (hintEl)  hintEl.textContent  = ''
    if (breadcrumb) breadcrumb.style.display = 'block'
  }

  const bgColors     = keys.map(k => k === accentKey ? '#b5f542'   : '#b5f54222')
  const borderColors = keys.map(k => k === accentKey ? '#b5f542'   : '#b5f54270')

  const totalWidth = Math.max(keys.length * BAR_W, container.clientWidth || 600)
  canvas.style.width  = totalWidth + 'px'
  canvas.style.height = '180px'
  canvas.width  = totalWidth
  canvas.height = 180

  if (exChartBar) exChartBar.destroy()

  exChartBar = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    plugins: _DL,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors,
        borderColor:     borderColors,
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} treino${ctx.parsed.y!==1?'s':''}` } },
        datalabels: {
          anchor: 'end', align: 'top', offset: 0,
          color: ctx => keys[ctx.dataIndex] === accentKey ? '#b5f542' : '#555f59',
          font: { size: 10, family: 'DM Mono', weight: '700' },
          formatter: v => v > 0 ? v : null,
        }
      },
      onClick: (evt, elements) => {
        if (!elements.length) return
        const idx = elements[0].index
        if (!isDrill) {
          // primeiro clique: cross-filter; segundo clique no mesmo: drill
          if (exCross.mes === keys[idx]) {
            exDrillIntoMes(keys[idx])
          } else {
            setCrossMes(keys[idx])
          }
        }
      },
      onHover: (evt, elements) => {
        canvas.style.cursor = (!isDrill && elements.length) ? 'pointer' : 'default'
      },
      scales: {
        x: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } },
        y: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 }, stepSize: 1 }, beginAtZero: true }
      }
    }
  })

  setTimeout(() => {
    if (!isDrill) {
      if (exCross.mes) {
        const idx = keys.indexOf(exCross.mes)
        if (idx !== -1) container.scrollLeft = Math.max(0, idx*BAR_W - container.clientWidth/2)
      } else {
        container.scrollLeft = container.scrollWidth
      }
    } else {
      container.scrollLeft = 0
    }
  }, 60)
}

// ── GRÁFICO ROSCA (grupo → exercício) ────────────────────────────────────────

let exChartRosca = null
const CORES = ['#b5f542','#42f5b5','#f5a742','#f55a42','#a742f5','#42a7f5','#f542a7','#f5f542']

function renderExChartRosca(base) {
  const canvas = document.getElementById('ex-chart-tipo')
  if (!canvas) return

  const titleEl    = document.getElementById('ex-rosca-title')
  const hintEl     = document.getElementById('ex-rosca-hint')
  const breadcrumb = document.getElementById('ex-rosca-breadcrumb')
  const isDrill    = exDrill.roscaMode === 'exercicio'

  let porChave = {}
  let accentKey = null

  if (!isDrill) {
    // Nível: grupo
    base.forEach(e => {
      const nome = e.grupo_nome || 'Sem grupo'
      porChave[nome] = (porChave[nome]||0) + 1
    })
    accentKey = exCross.grupo
    if (titleEl) titleEl.textContent = 'Por grupo muscular'
    if (hintEl)  hintEl.textContent  = 'clique para ver exercícios'
    if (breadcrumb) breadcrumb.style.display = 'none'
  } else {
    // Nível: exercício dentro do grupo selecionado
    base.filter(e => e.grupo_nome === exDrill.roscaGrupo)
        .forEach(e => {
          const nome = e.exercicio_nome || 'Sem nome'
          porChave[nome] = (porChave[nome]||0) + 1
        })
    if (titleEl) titleEl.textContent = exDrill.roscaGrupo
    if (hintEl)  hintEl.textContent  = ''
    if (breadcrumb) breadcrumb.style.display = 'block'
  }

  const sorted = Object.entries(porChave).sort((a,b) => b[1]-a[1]).slice(0,8)
  const labels = sorted.map(([k]) => k)
  const data   = sorted.map(([,v]) => v)

  const bgColors     = labels.map((l,i) => l===accentKey ? CORES[i%CORES.length]+'60' : CORES[i%CORES.length]+'25')
  const borderColors = labels.map((l,i) => l===accentKey ? CORES[i%CORES.length]      : CORES[i%CORES.length]+'80')
  const borderWidths = labels.map(l => l===accentKey ? 3 : 1.5)

  if (exChartRosca) exChartRosca.destroy()

  exChartRosca = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    plugins: _DL,
    data: { labels, datasets: [{ data, backgroundColor: bgColors, borderColor: borderColors, borderWidth: borderWidths, hoverOffset: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%',
      layout: { padding: 16 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: item => `${item.label}: ${item.parsed} treino${item.parsed!==1?'s':''}` } },
        datalabels: {
          color: '#e8ede9',
          font: { size: 10, family: 'DM Mono', weight: '700' },
          textAlign: 'center',
          formatter: (v, ctx) => {
            const total = ctx.dataset.data.reduce((a,b)=>a+b, 0)
            const pct   = Math.round((v/total)*100)
            if (pct < 6) return null
            const name  = labels[ctx.dataIndex]
            return `${name.length>10?name.slice(0,9)+'…':name}\n${pct}%`
          },
          anchor: 'center', align: 'center',
        }
      },
      onClick: (evt, elements) => {
        if (!elements.length) return
        const nome = labels[elements[0].index]
        if (!isDrill) {
          // primeiro clique: cross; segundo clique no mesmo: drill
          if (exCross.grupo === nome) {
            exRoscaDrillInto(nome)
          } else {
            setCrossGrupo(nome)
          }
        }
      },
      onHover: (evt, elements) => {
        canvas.style.cursor = (!isDrill && elements.length) ? 'pointer' : 'default'
      },
    }
  })
}

// ── GRÁFICO PERÍODO DO DIA ────────────────────────────────────────────────────

let exChartPeriodo = null

function getHoraPeriodo(h) {
  if (!h) return null
  const hr = parseInt(h.split(':')[0])
  if (hr >= 5  && hr < 12) return 'manha'
  if (hr >= 12 && hr < 18) return 'tarde'
  if (hr >= 18 && hr < 23) return 'noite'
  return 'madrugada'
}

function renderExChartPeriodo(filtrados) {
  const canvas = document.getElementById('ex-chart-periodo')
  if (!canvas) return

  const periodos = {
    manha:     { label:'Manhã',     emoji:'🌅', range:'05–12h', cor:'#f5d742', count:0 },
    tarde:     { label:'Tarde',     emoji:'☀️',  range:'12–18h', cor:'#f5a742', count:0 },
    noite:     { label:'Noite',     emoji:'🌙', range:'18–23h', cor:'#42a7f5', count:0 },
    madrugada: { label:'Madrugada', emoji:'🌑', range:'00–05h', cor:'#a742f5', count:0 },
  }
  filtrados.forEach(e => {
    const p = getHoraPeriodo(e.hora)
    if (p && periodos[p]) periodos[p].count++
  })

  const ordem  = ['manha','tarde','noite','madrugada']
  const labels = ordem.map(k => `${periodos[k].emoji} ${periodos[k].label}`)
  const data   = ordem.map(k => periodos[k].count)
  const cores  = ordem.map(k => periodos[k].cor)

  if (exChartPeriodo) exChartPeriodo.destroy()

  exChartPeriodo = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    plugins: _DL,
    data: { labels, datasets: [{ data, backgroundColor: cores.map(c=>c+'22'), borderColor: cores, borderWidth:2, borderRadius:6, borderSkipped:false }] },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 40 } },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} treino${ctx.parsed.x!==1?'s':''} · ${periodos[ordem[ctx.dataIndex]].range}` } },
        datalabels: {
          anchor: 'end', align: 'right', offset: 6, clamp: true,
          color: ctx => cores[ctx.dataIndex],
          font: { size: 12, family:'DM Mono', weight:'700' },
          formatter: v => v > 0 ? v : null,
        }
      },
      scales: {
        x: { grid: { color:'#2a2e2c' }, ticks: { color:'#6b7570', font:{ size:10 }, stepSize:1 }, beginAtZero:true },
        y: { grid: { display:false }, ticks: { color:'#9aa39d', font:{ size:13 } } }
      }
    }
  })
}

// ── HISTÓRICO ─────────────────────────────────────────────────────────────────

function renderExHistory(filtrados) {
  const tbody = document.getElementById('ex-history-body')
  const count = document.getElementById('ex-history-count')
  if (!tbody) return
  if (count) count.textContent = `${filtrados.length} registro${filtrados.length!==1?'s':''}`

  tbody.innerHTML = [...filtrados].reverse().map(e => {
    const hora      = e.hora ? e.hora.substring(0,5) : '—'
    const dur       = e.duracao != null ? `${e.duracao}min` : '—'
    const esf       = e.esforco != null ? `${e.esforco}/10` : '—'
    const esf_class = e.esforco >= 8 ? 'delta-neg' : e.esforco >= 5 ? 'delta-neu' : 'delta-pos'
    return `<tr>
      <td>${formatExDate(e.data)}</td>
      <td>${hora}</td>
      <td>${e.exercicio_nome||'—'}</td>
      <td style="color:var(--text-muted)">${e.grupo_nome||'—'}</td>
      <td>${dur}</td>
      <td><span class="${esf_class}">${esf}</span></td>
    </tr>`
  }).join('')
}