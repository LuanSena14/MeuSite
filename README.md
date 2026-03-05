# MeuSite
projeto pessoal para me ajudar a aprender a desenvolver

frontend/
├── index.html       ← esqueleto da página + carrega os scripts
├── checkin.html     ← só o HTML do formulário
├── dashboard.html   ← só o HTML do dashboard
├── style.css        ← seus estilos (não mudou)
└── js/
    ├── api.js       ← só comunicação com o backend (fetch)
    ├── checkin.js   ← lógica do formulário (readForm, saveEntry)
    ├── dashboard.js ← lógica dos gráficos e tabelas (renderDash)
    └── app.js       ← inicialização e navegação (init, switchView)