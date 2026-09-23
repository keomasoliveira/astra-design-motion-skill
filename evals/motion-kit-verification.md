# Verificação do motion kit — 22/09/2026

Ambiente: servidor local na porta 4174, navegador integrado baseado em Chromium, inspeção visual, árvore de acessibilidade e estilos computados. Artefato: [`assets/motion-kit/`](../assets/motion-kit/). Esta verificação confirma o exemplo executável; não certifica os sites futuros gerados pela skill.

| Sequência acionada no navegador | Resultado observado |
| --- | --- |
| Abrir “Explorar” | `aria-expanded=true`; três links aparecem na árvore de acessibilidade; painel visível; loops dos SVGs têm `animation-play-state: running` |
| Passar o mouse sobre “Explorar”, sem clicar | O painel abre e `aria-expanded` passa a `true`; os três links aparecem na árvore de acessibilidade |
| Mover ponteiro para o cartão “Feedback” | Somente esse card passa a `:hover`; a peça móvel de seu SVG se desloca 38 px, enquanto os loops continuam independentes |
| Tab até o primeiro cartão → Escape | Foco alcança o link; menu fecha, `aria-expanded=false`, foco volta a “Explorar” |
| Pausar diagramas → retomar | `aria-pressed=true/false` acompanha o rótulo; estilo computado das barras passa de `running` para `paused` e volta a `running` |
| Abrir menu → rolar até o painel sair da janela | `data-in-view=false`; animação das barras fica em `paused` |
| Escolher cartão “Feedback” | URL termina em `#icones`; painel recebe `inert`, fecha e o foco vai para a seção `icones` |
| Com foco em um card, clicar num link fora do painel | Menu fecha e o foco segue para o destino externo ao painel, sem voltar indevidamente ao acionador |
| Abrir em largura de 390 px | Cards mudam para uma coluna; painel cabe na largura; documento não tem overflow horizontal no estado inspecionado |
| Console no fluxo de navegação | Nenhum erro registrado |

O primeiro teste de pausa encontrou `aria-pressed=true` com animação ainda em `running`: uma regra `animation` tinha maior especificidade que `animation-play-state`. A regra foi corrigida e o caso foi repetido até observar `paused` no estilo computado. Alternância da preferência do sistema por movimento reduzido e perda de visibilidade da aba devem ser repetidas em navegadores/dispositivos alvo antes de usar o kit como componente de produção; a implementação dessas condições existe no código.
