# Linha a linha - FrontEnd/shared/js/nav.js

Arquivo fonte: FrontEnd/shared/js/nav.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 3 | const DEFAULT_SECTION = 'home' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 4 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 5 | const SECTION_META = { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 6 |   home:      { title: 'BodyLog',           action: null,                                                                 filters: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 7 |   body:      { title: 'Body metrics',      action: { label: 'Novo check-in',   fn: 'openModal()' },                      filters: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 8 |   finances:  { title: 'Finances overview', action: { label: 'Novo lanÃ§amento', fn: "openFinModal('lancamento')" },       filters: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 9 |   exercises: { title: 'Exercises tracker', action: { label: 'Novo treino',     fn: 'openExModal()' },                    filters: true  }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 10 |   goals:     { title: 'Goals overview',    action: { label: 'Registrar dia',   fn: 'openGoalsModal()' },                 filters: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 11 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 12 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 13 | let _currentSection = DEFAULT_SECTION | Declara variavel mutavel no escopo de bloco. |
| 14 | let _filtersOpen = false | Declara variavel mutavel no escopo de bloco. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 | function _syncSidebarNav(name) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 17 |   document.querySelectorAll('.sidebar-item').forEach(el =&gt; | Interage com DOM para ler ou atualizar elementos da interface. |
| 18 |     el.classList.toggle('active', el.dataset.section === name) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 19 |   ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 20 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 21 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 22 | function _renderSidebarContext(meta) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 23 |   const el = document.getElementById('sidebar-context') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 24 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 25 |   el.innerHTML = meta.action ? ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 26 |     &lt;div class="sidebar-context-title"&gt;AÃ§Ã£o rÃ¡pida&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 27 |     &lt;button class="sidebar-btn" onclick="${meta.action.fn}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 28 |       &lt;span&gt;+&lt;/span&gt; ${meta.action.label} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 29 |     &lt;/button&gt;` : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 30 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 32 | function _renderTopbarAction(meta) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 33 |   const el = document.getElementById('topbar-action') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 34 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 35 |   el.innerHTML = meta.action ? ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 36 |     &lt;button class="btn-add topbar-action-btn" onclick="${meta.action.fn}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 37 |       &lt;span&gt;+&lt;/span&gt; ${meta.action.label} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 38 |     &lt;/button&gt;` : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 39 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 40 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 41 | function _syncTopbar(meta) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 42 |   const topbar = document.getElementById('topbar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 43 |   const toggle = document.getElementById('topbar-filter-toggle') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 44 |   const title  = document.getElementById('topbar-section-title') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 45 |   if (title)  title.textContent = meta.title | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 46 |   if (toggle) toggle.style.display = meta.filters ? 'flex' : 'none' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 47 |   // Desktop: topbar sÃ³ aparece na aba Exercises (por causa dos filtros) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 48 |   if (topbar) topbar.classList.toggle('has-content', !!meta.filters) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 49 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 50 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 51 | function _syncLastUpdate(name) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 52 |   const body = document.getElementById('last-update-label') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 53 |   const ex   = document.getElementById('ex-last-update-label') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 54 |   if (body) body.style.display = name === 'body'      ? '' : 'none' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 55 |   if (ex)   ex.style.display   = name === 'exercises' ? '' : 'none' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 56 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 57 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 58 | // Altere o valor abaixo para o PIN que vocÃª quiser usar | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 59 | const FINANCES_PIN = '1234' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 60 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 61 | function _financesUnlocked() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 62 |   return sessionStorage.getItem('finances_ok') === '1' | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 63 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 64 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 65 | function _showFinancesPin(onSuccess) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 66 |   const overlay = document.getElementById('finances-pin-overlay') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 67 |   const input   = document.getElementById('finances-pin-input') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 68 |   const error   = document.getElementById('finances-pin-error') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 69 |   overlay.style.display = 'flex' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 70 |   input.value = '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 71 |   error.style.display = 'none' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |   setTimeout(() =&gt; input.focus(), 50) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 74 |   function tryUnlock() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 75 |     if (input.value === FINANCES_PIN) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 76 |       sessionStorage.setItem('finances_ok', '1') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 77 |       overlay.style.display = 'none' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 78 |       input.removeEventListener('keydown', onKey) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 79 |       document.getElementById('finances-pin-btn').onclick = null | Interage com DOM para ler ou atualizar elementos da interface. |
| 80 |       onSuccess() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 81 |     } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 82 |       error.style.display = 'block' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |       input.value = '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 84 |       input.focus() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 85 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 86 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 87 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 88 |   function onKey(e) { if (e.key === 'Enter') tryUnlock() } | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 89 |   input.addEventListener('keydown', onKey) | Registra evento de UI para executar logica quando usuario interagir. |
| 90 |   document.getElementById('finances-pin-btn').onclick = tryUnlock | Interage com DOM para ler ou atualizar elementos da interface. |
| 91 |   document.getElementById('finances-pin-cancel').onclick = () =&gt; { | Interage com DOM para ler ou atualizar elementos da interface. |
| 92 |     overlay.style.display = 'none' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |     input.removeEventListener('keydown', onKey) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 94 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 95 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 96 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 97 | function switchSection(name) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 98 |   if (name === 'finances' && !_financesUnlocked()) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 99 |     _showFinancesPin(() =&gt; switchSection('finances')) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 100 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 101 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 102 |   if (_currentSection === name && document.getElementById('section-' + name)?.classList.contains('active')) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 103 |     closeMobileSidebar() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 104 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 105 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 106 |   _currentSection = name | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 107 |   const meta = SECTION_META[name] \|\| {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 108 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 109 |   document.querySelectorAll('.section').forEach(s =&gt; s.classList.remove('active')) | Interage com DOM para ler ou atualizar elementos da interface. |
| 110 |   const target = document.getElementById('section-' + name) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 111 |   if (target) target.classList.add('active') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 112 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 113 |   _syncSidebarNav(name) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 114 |   _renderSidebarContext(meta) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 115 |   _renderTopbarAction(meta) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 116 |   _syncTopbar(meta) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 117 |   _syncLastUpdate(name) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 118 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 119 |   if (!meta.filters) _closeFilters() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 120 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 121 |   closeMobileSidebar() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 122 |   window.dispatchEvent(new CustomEvent('sectionchange', { detail: { section: name } })) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 123 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 124 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 125 | function toggleSidebar() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 126 |   document.getElementById('sidebar').classList.toggle('collapsed') | Interage com DOM para ler ou atualizar elementos da interface. |
| 127 |   document.body.classList.toggle('sidebar-collapsed') | Interage com DOM para ler ou atualizar elementos da interface. |
| 128 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 129 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 130 | function openMobileSidebar() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 131 |   document.getElementById('sidebar').classList.add('mobile-open') | Interage com DOM para ler ou atualizar elementos da interface. |
| 132 |   document.getElementById('sidebar-overlay').classList.add('visible') | Interage com DOM para ler ou atualizar elementos da interface. |
| 133 |   document.body.style.overflow = 'hidden' | Interage com DOM para ler ou atualizar elementos da interface. |
| 134 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 135 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 136 | function closeMobileSidebar() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 137 |   document.getElementById('sidebar').classList.remove('mobile-open') | Interage com DOM para ler ou atualizar elementos da interface. |
| 138 |   document.getElementById('sidebar-overlay').classList.remove('visible') | Interage com DOM para ler ou atualizar elementos da interface. |
| 139 |   document.body.style.overflow = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 140 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 141 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 142 | function toggleExFilters() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 143 |   _filtersOpen = !_filtersOpen | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 144 |   const bar = document.getElementById('ex-filters-bar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 145 |   const btn = document.getElementById('topbar-filter-toggle') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 146 |   if (bar) bar.style.display = _filtersOpen ? 'block' : 'none' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 147 |   if (btn) btn.classList.toggle('active', _filtersOpen) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 148 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 149 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 150 | function _closeFilters() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 151 |   _filtersOpen = false | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 152 |   const bar = document.getElementById('ex-filters-bar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 153 |   const btn = document.getElementById('topbar-filter-toggle') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 154 |   if (bar) bar.style.display = 'none' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 155 |   if (btn) btn.classList.remove('active') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 156 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 157 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 158 | window.addEventListener('resize', () =&gt; { | Registra evento de UI para executar logica quando usuario interagir. |
| 159 |   const meta = SECTION_META[_currentSection] \|\| {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 160 |   const topbar = document.getElementById('topbar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 161 |   if (topbar) topbar.classList.toggle('has-content', !!meta.filters) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 162 | }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 163 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 164 | // SincronizaÃ§Ã£o inicial da sidebar com a seÃ§Ã£o padrÃ£o | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 165 | _renderSidebarContext(SECTION_META[DEFAULT_SECTION]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 166 | _renderTopbarAction(SECTION_META[DEFAULT_SECTION]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 167 | _syncTopbar(SECTION_META[DEFAULT_SECTION]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
