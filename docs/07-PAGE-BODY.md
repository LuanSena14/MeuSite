# 07. PAGE-BODY.md - Página Body

## 1. Objetivo da página

A página Body centraliza o registro e análise de métricas corporais por check-in, com foco em evolução temporal, composição corporal e indicadores derivados.

## 2. Arquivos envolvidos

- `FrontEnd/pages/body/body.html`
- `FrontEnd/pages/body/body.js`
- `FrontEnd/pages/body/checkin.js`
- `FrontEnd/pages/body/checkin-modal.html`
- `FrontEnd/pages/body/body.css`
- `FrontEnd/shared/js/app.js`
- `FrontEnd/shared/js/api.js`

## 3. Estrutura de interface

`body.html` possui:

- Feedback inline de carga parcial (`dash-feedback`).
- Estado vazio (`dash-empty`) com CTA para abrir modal.
- Conteúdo principal (`dash-content`) com:
  - 4 KPIs: Peso, % Gordura, Massa Muscular, FFMI
  - gráfico de métrica selecionável (`chart-metrica`)
  - gráfico de evolução do peso (`chart-peso`)
  - donut de composição (`chart-composicao`)
  - grid de medidas detalhadas (`measures-grid`)
  - tabela de histórico (`history-body`)

## 4. Ciclo de carregamento

Ao entrar em Body, `app.js` faz:

1. Carregar dados de check-ins (`fetchCheckins`).
2. Carregar árvore de medidas (`fetchMedidas`).
3. Renderizar dashboard (`renderDash`).
4. Exibir feedback parcial se uma das fontes falhar.

## 5. Estado principal em body.js

Variáveis globais:

- `entries`: check-ins carregados.
- `medidas`: árvore de grupos/medidas do banco.
- `chartPeso`, `chartComp`, `chartMetrica`: instâncias Chart.js.

Função de limpeza:

- `destroyBodyCharts()` é chamada ao sair da seção para evitar vazamento de memória.

## 6. Cálculos e métricas derivadas

A página calcula indicadores a partir de dados brutos:

- IMC
- percentual de gordura
- massa livre de gordura
- massa de gordura
- FFMI

Fórmulas usadas:

$$IMC = \frac{peso}{altura^2}$$

$$\%gordura = \frac{gordura}{peso} \times 100$$

$$MLG = peso \times (1 - \frac{\%gordura}{100})$$

$$FFMI = \frac{MLG}{altura^2}$$

Regras importantes:

- Altura pode vir em cm ou m; há normalização.
- Quando altura falta no check-in atual, usa última altura válida do histórico.
- Métricas derivadas só entram quando há dados suficientes.

## 7. Pipeline de renderização

`renderDash()` executa a sequência:

1. Decide estado vazio vs conteúdo.
2. Monta KPIs principais com deltas.
3. Renderiza gráfico de linha do peso.
4. Renderiza donut de composição.
5. Monta seletor dinâmico de métricas (`buildMetricSelector`).
6. Renderiza gráfico da métrica selecionada (`renderMetricChart`).
7. Renderiza cards de medidas (`renderMeasures`).
8. Renderiza histórico tabular (`renderHistory`).

## 8. Seletor dinâmico de métricas

O seletor de métricas não é fixo. Ele é montado pela árvore `medidas` e por métricas derivadas com dados disponíveis.

Comportamento:

- Exibe apenas métricas com pelo menos um valor válido.
- Agrupa por `optgroup` (grupos vindos do banco + grupo "Calculadas").
- Ao trocar opção, recarrega apenas o gráfico da métrica.

## 9. Modal de check-in

O modal está em `checkin-modal.html` e o envio em `checkin.js`.

Fluxo de salvar (`saveEntry`):

1. Lê campos do formulário (`readForm`).
2. Valida data e se existe ao menos um valor informado.
3. Desabilita botão e mostra estado "Salvando...".
4. Envia para API com `postCheckin(date, medidas)`.
5. Exibe toast de sucesso/erro.
6. Reabilita botão no `finally`.

## 10. Endpoint usado

- `GET /api/checkins`
- `GET /api/medidas`
- `POST /api/checkins`

## 11. Atenções de manutenção

1. Sempre destruir gráficos antigos antes de recriar (`chart.destroy()`).
2. Garantir consistência dos nomes de campo entre modal e `readForm()`.
3. Validar unidades (cm vs m) antes de cálculos de IMC/FFMI.
4. Não quebrar fallback de altura histórica.
5. Testar estado vazio e estado parcial sem backend.

## 12. Testes manuais recomendados

1. Cadastrar check-in só com peso e data.
2. Cadastrar check-in com gordura e altura para validar IMC/FFMI.
3. Trocar métrica no seletor e confirmar atualização do gráfico.
4. Abrir e fechar seção Body repetidamente para validar limpeza de charts.
5. Simular backend fora do ar e verificar feedback de erro parcial.
