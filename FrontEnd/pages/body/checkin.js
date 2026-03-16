
function val(id) {
  const v = document.getElementById(id)?.value
  return v !== '' && v != null ? parseFloat(v) : null
}

// As chaves precisam bater com os nomes em codigo_medida.descricao no banco
function readForm() {
  return {
    agua:                val('f-agua'),
    massa_muscular:      val('f-massa-muscular'),
    peso:                val('f-peso'),
    gordura:             val('f-gordura'),
    gordura_visceral:    val('f-gordura-visceral'),
    dobra_triceps:       val('db-trip'),
    dobra_supra:         val('db-supra'),
    dobra_panturrilha:   val('db-pant'),
    dobra_biceps:        val('db-biceps'),
    dobra_coxa:          val('db-coxa'),
    dobra_supra_iliaca:  val('db-supra-iliaca'),
    dobra_axilar_medial: val('db-axilar-medial'),
    dobra_abdome:        val('db-abdome'),
    circ_punho:          val('f-punho'),
    circ_coxa:           val('f-coxa'),
    circ_braco:          val('f-braco'),
    circ_abdominal:      val('f-abdominal'),
    circ_panturrilha:    val('f-panturrilha'),
    cintura:             val('f-cintura'),
    circ_torax:          val('f-torax'),
    circ_tornozelo:      val('f-tornozelo'),
    quadril:             val('f-quadril'),
    circ_antebraco:      val('f-antebraco'),
    rmr:                 val('f-rmr'),
    vo2:                 val('f-vo2'),
    sono:                val('f-sono'),
    movimento:           val('f-movimento'),
    exercicio:           val('f-exercicio'),
  }
}
function clearForm() {
  document.querySelectorAll('input[type=number]').forEach(i => i.value = '')
}
async function saveEntry() {
  const medidas = readForm()
  if (!Object.values(medidas).some(v => v !== null)) {
    if (typeof showAppToast === 'function') showAppToast('Preencha pelo menos um campo antes de salvar.', 'error')
    return
  }
  const date = document.getElementById('f-data').value
  if (!date) {
    if (typeof showAppToast === 'function') showAppToast('Selecione uma data antes de salvar.', 'error')
    return
  }
  const btn = document.getElementById('btn-salvar')
  btn.disabled = true
  btn.innerHTML = '<span>⏳</span> Salvando...'

  try {
    const result = await postCheckin(date, medidas)

    if (result.ok) {
      clearForm()
      showToast('toast')
    } else {
      console.error('Erro do servidor:', result.erro)
      showToast('toast-erro')
    }
  } catch (err) {
    console.error('Erro de conexão:', err)
    if (typeof showAppToast === 'function') {
      showAppToast('Não foi possível conectar ao servidor. Verifique se o backend está ativo.', 'error')
    } else {
      showToast('toast-erro')
    }
  } finally {
    btn.disabled = false
    btn.innerHTML = '<span>💾</span> Salvar check-in'
  }
}