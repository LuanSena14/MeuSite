// ─────────────────────────────────────────────────────────────────────────────
// checkin.js — lógica do formulário de registro
// ─────────────────────────────────────────────────────────────────────────────

// Lê o valor de um input pelo id
// Retorna o número ou null se estiver vazio
function val(id) {
  const v = document.getElementById(id)?.value
  return v !== '' && v != null ? parseFloat(v) : null
}

// Lê todos os campos do formulário e retorna um objeto
// As chaves precisam bater com os nomes em codigo_medida.descricao no banco
function readForm() {
  return {
    // Bioimpedância
    agua:                val('f-agua'),
    massa_muscular:      val('f-massa-muscular'),
    peso:                val('f-peso'),
    gordura:             val('f-gordura'),
    gordura_visceral:    val('f-gordura-visceral'),
    // Dobras cutâneas
    dobra_triceps:       val('db-trip'),
    dobra_supra:         val('db-supra'),
    dobra_panturrilha:   val('db-pant'),
    dobra_biceps:        val('db-biceps'),
    dobra_coxa:          val('db-coxa'),
    dobra_supra_iliaca:  val('db-supra-iliaca'),
    dobra_axilar_medial: val('db-axilar-medial'),
    dobra_abdome:        val('db-abdome'),
    // Circunferências
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
    // Calorimetria e bem-estar
    rmr:                 val('f-rmr'),
    vo2:                 val('f-vo2'),
    sono:                val('f-sono'),
    movimento:           val('f-movimento'),
    exercicio:           val('f-exercicio'),
  }
}

// Limpa todos os campos numéricos do formulário
function clearForm() {
  document.querySelectorAll('input[type=number]').forEach(i => i.value = '')
}

// Clique no botão Salvar
async function saveEntry() {
  const medidas = readForm()

  // Verifica se tem pelo menos um campo preenchido
  if (!Object.values(medidas).some(v => v !== null)) {
    alert('Preencha pelo menos um campo antes de salvar!')
    return
  }

  // Pega a data selecionada pelo usuário
  const date = document.getElementById('f-data').value
  if (!date) {
    alert('Selecione uma data antes de salvar!')
    return
  }

  // Desabilita o botão durante o envio (evita cliques duplos)
  const btn = document.getElementById('btn-salvar')
  btn.disabled = true
  btn.innerHTML = '<span>⏳</span> Salvando...'

  try {
    const result = await postCheckin(date, medidas)  // postCheckin está em api.js

    if (result.ok) {
      clearForm()
      showToast('toast')
    } else {
      console.error('Erro do servidor:', result.erro)
      showToast('toast-erro')
    }
  } catch (err) {
    console.error('Erro de conexão:', err)
    alert('Não foi possível conectar ao servidor.\nCertifique-se de que o Python está rodando:\n\n  uvicorn main:app --reload --port 8001')
  } finally {
    btn.disabled = false
    btn.innerHTML = '<span>💾</span> Salvar check-in'
  }
}