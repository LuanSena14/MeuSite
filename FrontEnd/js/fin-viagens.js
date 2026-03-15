// ─────────────────────────────────────────────────────────────────────────────
// fin-viagens.js — Aba Viagens: donut por categoria, barra por viagem,
//                  accordion de lançamentos e ações renomear/desvincular
// ─────────────────────────────────────────────────────────────────────────────

const _VIAG_COLORS = [
  '#b4ff50','#7c9eff','#ff9f47','#ff6b6b','#f5d742',
  '#a78bfa','#34d399','#fb7185','#38bdf8','#fbbf24'
]

// Estado de cross-filter: selecionar uma categoria no donut filtra a barra e vice-versa
let _viagCatSel  = null   // nome da categoria selecionada no donut
let _viagViagSel = null   // nome da viagem selecionada na barra
let _viagAll     = []     // lista de viagens atual (mantida para redraw sem re-fetch)
let _viagTotal   = 0

// ── ENTRY POINT ───────────────────────────────────────────────────────────────

async function renderViagens() {
  window.finViagens = await fetchViagens() || []

  const list       = document.getElementById('fin-viagens-list')
  const chartsWrap = document.getElementById('fin-viag-charts')
  if (!list) return

  // Ordena por data mais recente no topo
  const viagens = window.finViagens.slice().sort((a, b) => {
    const dA = a.lancamentos[0]?.data || ''
    const dB = b.lancamentos[0]?.data || ''
    return dB.localeCompare(dA)
  })

  _viagAll     = viagens
  _viagTotal   = viagens.reduce((s, v) => s + v.total, 0)
  _viagCatSel  = null
  _viagViagSel = null

  if (!viagens.length) {
    if (chartsWrap) chartsWrap.style.display = 'none'
    list.innerHTML = `<div class="empty-state" style="padding:60px 0">
      <div class="empty-icon">✈</div>
      <p>Nenhuma viagem registrada.<br>Crie lançamentos com categoria <b>Travel</b> para aparecerem aqui.</p>
    </div>`
    return
  }

  if (chartsWrap) chartsWrap.style.display = 'grid'
  _redrawViagCharts()

  list.innerHTML = viagens.map((v, idx) => {
    const lancs  = v.lancamentos.slice().sort((a, b) => b.valor - a.valor)
    const linhas = lancs.map(l => `
      <tr>
        <td>${_fmtDate(l.data)}</td>
        <td>${l.categoria_nome}</td>
        <td>${l.descricao || '—'}</td>
        <td>${_finPagBadge(l.forma_pagamento)}</td>
        <td class="fin-col-valor fin-despesa">${_fmtBRL(l.valor)}</td>
        <td><button class="fin-del-btn" title="Desvincular" onclick="_viajemUnlink(${l.id})">✕</button></td>
      </tr>`).join('')

    // Mês/ano do lançamento mais recente da viagem
    const ultimaData = v.lancamentos.slice().sort((a, b) => b.data.localeCompare(a.data))[0].data
    const mesAno     = new Date(ultimaData + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

    const safeId     = 'viag-body-' + idx
    const primeiroId = v.lancamentos[0]?.id
    const nomeEsc    = v.nome_viagem.replace(/'/g, "\\'")

    return `
    <div class="viag-card">
      <div class="viag-card-header viag-accordion-trigger" onclick="_viagToggle('${safeId}', this)">
        <div class="viag-card-title-row">
          <span class="viag-nome">✈ ${v.nome_viagem}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="viag-rename-btn" onclick="event.stopPropagation();_viagemRenamePrompt('${primeiroId}', '${nomeEsc}')">✎ renomear</button>
            <span class="viag-chevron">▾</span>
          </div>
        </div>
        <div class="viag-card-stats">
          <span>${v.num_lancamentos} lançamento${v.num_lancamentos !== 1 ? 's' : ''}</span>
          <span class="fin-resumo-sep">·</span>
          <span style="color:var(--danger);font-weight:600">${_fmtBRL(v.total)}</span>
          <span class="fin-resumo-sep">·</span>
          <span style="color:var(--text-muted)">${mesAno}</span>
        </div>
      </div>
      <div class="viag-accordion-body" id="${safeId}">
        <div class="fin-table-wrap">
          <table class="fin-table">
            <thead><tr>
              <th>Data</th><th>Categoria</th><th>Descrição</th><th>Pagamento</th><th>Valor</th><th></th>
            </tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>`
  }).join('')
}

// ── CHARTS ────────────────────────────────────────────────────────────────────

function _redrawViagCharts() {
  _buildViagDonut()
  _buildViagBar()
}

// Donut por categoria, com total no centro e cross-filter com a barra
function _buildViagDonut() {
  const viagens = _viagAll
  let catEntries, donutTotal

  if (_viagViagSel) {
    // Quando uma viagem está selecionada, mostra só as categorias dessa viagem
    const v = viagens.find(v => v.nome_viagem === _viagViagSel)
    const m = {}
    if (v) v.lancamentos.forEach(l => { m[l.categoria_nome] = (m[l.categoria_nome] || 0) + l.valor })
    catEntries = Object.entries(m).sort((a, b) => b[1] - a[1])
    donutTotal = catEntries.reduce((s, [, v]) => s + v, 0)
  } else {
    const m = {}
    viagens.forEach(v => v.lancamentos.forEach(l => { m[l.categoria_nome] = (m[l.categoria_nome] || 0) + l.valor }))
    catEntries = Object.entries(m).sort((a, b) => b[1] - a[1])
    donutTotal = _viagTotal
  }

  // Esmaece categorias não selecionadas quando há seleção ativa
  const bgColors = catEntries.map(([k], i) =>
    (_viagCatSel && k !== _viagCatSel) ? 'rgba(255,255,255,0.1)' : _VIAG_COLORS[i % _VIAG_COLORS.length]
  )

  // Plugin inline: exibe label + total no centro do anel
  const centerTextPlugin = {
    id: 'viag-center',
    afterDraw(chart) {
      const { ctx, chartArea: { top, bottom, left, right } } = chart
      const cx = (left + right) / 2, cy = (top + bottom) / 2
      ctx.save()
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = '12px system-ui'; ctx.fillStyle = '#aaa'
      ctx.fillText(_viagViagSel || 'Total', cx, cy - 13)
      ctx.font = 'bold 17px system-ui'; ctx.fillStyle = '#fff'
      ctx.fillText(_fmtShort(donutTotal) || _fmtBRL(donutTotal), cx, cy + 8)
      ctx.restore()
    }
  }

  const ctxCat = document.getElementById('fin-chart-viag-cat')
  if (!ctxCat) return
  if (_finChartsInstances['viag-cat']) _finChartsInstances['viag-cat'].destroy()
  _finChartsInstances['viag-cat'] = new Chart(ctxCat, {
    type: 'doughnut',
    plugins: [..._finDL, centerTextPlugin],
    data: {
      labels:   catEntries.map(([k]) => k),
      datasets: [{ data: catEntries.map(([, v]) => v), backgroundColor: bgColors, borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      onClick: (e, els) => {
        if (!els.length) {
          _viagCatSel = null
        } else {
          const nome   = catEntries[els[0].index][0]
          _viagCatSel  = (_viagCatSel === nome) ? null : nome
          _viagViagSel = null
        }
        _redrawViagCharts()
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc', boxWidth: 12, padding: 10, font: { size: 11 } } },
        datalabels: {
          color: '#0d0f0e', font: { size: 10, weight: 'bold' },
          formatter: (val) => {
            const pct = (val / donutTotal * 100).toFixed(0)
            return pct < 4 ? '' : `${pct}%\n${_fmtShort(val) || _fmtBRL(val)}`
          }
        }
      }
    }
  })
}

// Barra por viagem, com cross-filter com o donut
function _buildViagBar() {
  const viagens = _viagAll
  let labels, data, colors

  if (_viagCatSel) {
    // Quando uma categoria está selecionada, mostra só o gasto daquela categoria por viagem
    labels = viagens.map(v => v.nome_viagem)
    data   = viagens.map(v => v.lancamentos.filter(l => l.categoria_nome === _viagCatSel).reduce((s, l) => s + l.valor, 0))
    colors = data.map((d, i) => d > 0 ? _VIAG_COLORS[i % _VIAG_COLORS.length] : 'rgba(255,255,255,0.1)')
  } else {
    labels = viagens.map(v => v.nome_viagem)
    data   = viagens.map(v => v.total)
    colors = viagens.map((v, i) =>
      (_viagViagSel && v.nome_viagem !== _viagViagSel) ? 'rgba(255,255,255,0.12)' : _VIAG_COLORS[i % _VIAG_COLORS.length]
    )
  }

  const maxVal = Math.max(...data.filter(d => d > 0), 1)
  const ctxBar = document.getElementById('fin-chart-viag-bar')
  if (!ctxBar) return
  if (_finChartsInstances['viag-bar']) _finChartsInstances['viag-bar'].destroy()
  _finChartsInstances['viag-bar'] = new Chart(ctxBar, {
    type: 'bar',
    plugins: _finDL,
    data: { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 6, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      onClick: (e, els) => {
        if (!els.length) {
          _viagViagSel = null
        } else {
          const nome   = labels[els[0].index]
          _viagViagSel = (_viagViagSel === nome) ? null : nome
          _viagCatSel  = null
        }
        _redrawViagCharts()
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end', align: 'end',
          color: '#ccc', font: { size: 11, weight: '600' },
          formatter: v => v > 0 ? (_fmtShort(v) || _fmtBRL(v)) : ''
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#aaa' } },
        y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { display: false }, suggestedMax: maxVal * 1.18 }
      }
    }
  })
}

// ── ACCORDION ─────────────────────────────────────────────────────────────────

function _viagToggle(bodyId, header) {
  const body = document.getElementById(bodyId)
  if (!body) return
  const open = body.classList.toggle('open')
  const chev = header.querySelector('.viag-chevron')
  if (chev) chev.textContent = open ? '▴' : '▾'
}

// ── AÇÕES ─────────────────────────────────────────────────────────────────────

async function _viajemUnlink(cdLancamento) {
  if (!confirm('Desvincular este lançamento da viagem?')) return
  const r = await fetch(`${API}/api/financas/viagens/${cdLancamento}`, { method: 'DELETE' })
  if (r.ok) renderViagens()
}

async function _viagemRenamePrompt(cdLancamento, nomeAtual) {
  const novo = prompt('Novo nome da viagem:', nomeAtual)
  if (!novo || novo === nomeAtual) return
  const r = await fetch(`${API}/api/financas/viagens/${cdLancamento}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ nome_viagem: novo })
  })
  if (r.ok) renderViagens()
}
