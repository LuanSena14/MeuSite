function _mesAtualParcelas() {
  return new Date().toISOString().slice(0, 7)
}

function _labelMesParcelas(ym) {
  const [ano, mes] = ym.split('-').map(Number)
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function renderComprasParceladas() {
  const compras = window.finComprasParceladas || []
  const mesAtual = _mesAtualParcelas()
  const parcelasMes = compras.flatMap(c => c.parcelas.map(p => ({ ...p, compra: c })))
    .filter(p => p.vencimento.startsWith(mesAtual))
  const totalMes = parcelasMes.reduce((s, p) => s + Number(p.valor), 0)
  const pendenteMes = parcelasMes.filter(p => !p.pago_em).reduce((s, p) => s + Number(p.valor), 0)

  const resumo = document.getElementById('fin-parcelas-resumo')
  if (resumo) resumo.innerHTML = `<span>Compras em andamento: <b>${compras.filter(c => c.parcelas.some(p => !p.pago_em)).length}</b></span><span>Reserva comprometida: <b class="fin-despesa">${_fmtBRL(compras.reduce((s, c) => s + c.parcelas.filter(p => !p.pago_em).reduce((x, p) => x + Number(p.valor), 0), 0))}</b></span>`

  const month = document.getElementById('fin-parcelas-month')
  if (month) {
    const itens = parcelasMes.length
      ? parcelasMes.sort((a, b) => a.vencimento.localeCompare(b.vencimento)).map(p => `<span>${_fmtDate(p.vencimento)} · ${p.compra.descricao || p.compra.categoria_nome}: <b>${_fmtBRL(p.valor)}</b>${p.pago_em ? ' (paga)' : ''}</span>`).join(' &nbsp;•&nbsp; ')
      : 'Nenhuma parcela vence neste mês.'
    month.innerHTML = `<h3>Impacto no fluxo de caixa — ${_labelMesParcelas(mesAtual)}</h3><div class="fin-parcelas-month-value">${_fmtBRL(totalMes)}</div><div class="fin-parcelas-month-note">${parcelasMes.length} parcela(s) no mês · ${_fmtBRL(pendenteMes)} ainda a pagar<br>${itens}</div>`
  }

  const list = document.getElementById('fin-compras-parceladas-list')
  if (!list) return
  const ativas = compras.filter(c => c.parcelas.some(p => !p.pago_em))
  if (!ativas.length) {
    list.innerHTML = '<p class="inline-empty-note-center">Nenhuma compra parcelada em andamento.</p>'
    return
  }
  list.innerHTML = ativas.sort((a, b) => {
    const na = a.parcelas.find(p => !p.pago_em)?.vencimento || '9999-99-99'
    const nb = b.parcelas.find(p => !p.pago_em)?.vencimento || '9999-99-99'
    return na.localeCompare(nb)
  }).map(c => {
    const pagas = c.parcelas.filter(p => p.pago_em).length
    const abertas = c.parcelas.filter(p => !p.pago_em)
    const proxima = abertas[0]
    const aberto = abertas.reduce((s, p) => s + Number(p.valor), 0)
    return `<details class="fin-compra-card">
      <summary class="fin-compra-head">
        <div><div class="fin-compra-title">${c.descricao || c.categoria_nome}</div><div class="fin-compra-meta">${c.categoria_nome} · compra em ${_fmtDate(c.data_compra)} · ${pagas}/${c.total_parcelas} pagas</div></div>
        <div class="fin-compra-values"><b>${_fmtBRL(c.total)}</b><div class="fin-compra-open">Em aberto: ${_fmtBRL(aberto)}<br>Próxima: ${_fmtDate(proxima.vencimento)}</div></div>
      </summary>
      <div class="fin-compra-parcelas"><table class="fin-table"><thead><tr><th>Parcela</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead><tbody>
        ${c.parcelas.map(p => `<tr class="${p.pago_em ? 'fin-parcela-paga' : ''}"><td>${p.numero}/${c.total_parcelas}</td><td>${_fmtDate(p.vencimento)}</td><td class="fin-col-valor">${_fmtBRL(p.valor)}</td><td><button class="fin-parcela-status" onclick="toggleParcelaPaga(${c.id}, ${p.id}, this)">${p.pago_em ? `Paga em ${_fmtDate(p.pago_em)}` : 'Marcar como paga'}</button></td></tr>`).join('')}
      </tbody></table></div>
    </details>`
  }).join('')
}

async function toggleParcelaPaga(compraId, parcelaId) {
  const compra = (window.finComprasParceladas || []).find(c => c.id === compraId)
  const parcela = compra?.parcelas.find(p => p.id === parcelaId)
  if (!parcela) return
  const novoStatus = parcela.pago_em ? null : new Date().toISOString().slice(0, 10)
  try {
    await patchParcelaCompraPaga(parcelaId, novoStatus)
    parcela.pago_em = novoStatus
    renderComprasParceladas()
    _showFinToast(novoStatus ? 'Parcela marcada como paga' : 'Pagamento desfeito')
  } catch (err) {
    console.error('Erro ao atualizar parcela:', err)
    _showFinToastErro('Erro ao atualizar parcela.')
  }
}
