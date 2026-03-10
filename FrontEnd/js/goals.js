let goalsData = []

async function initGoalsSection() {
  try {
    window.goalsData = await fetchGoals()
    console.log('goalsData:', goalsData)
  } catch (err) {
    console.error('Erro ao carregar goals:', err)
    goalsData = []
  } finally {
    renderGoals()
  }

  function renderGoals() {
    const container = document.getElementById('section-goals')
    if (!container) return 
    container.innerHTML = ''

    if (goalsData.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#666;margin-top:40px">Nenhuma goal registrada.</p>'
      return
    }   