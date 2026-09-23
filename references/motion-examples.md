# Exemplos estudados de motion

Consulte estes casos para escolher **um princípio de movimento**, não para copiar identidade visual, imagens ou código sem verificar licença. O primeiro caso é uma demonstração executável deste repositório; os demais vêm das demonstrações e fontes públicas ligadas abaixo. Nenhum exemplo, isolado, resolve o [contrato de UX](ux-contract.md). Converta a ideia escolhida em gatilho, estado, interrupção e redução conforme o [sistema de motion](motion-system.md).

## 1. Motion kit: painel com diagramas SVG independentes

**Fonte executável:** [HTML, CSS e JavaScript do motion kit](../assets/motion-kit/), com [sequências verificadas no navegador](../evals/motion-kit-verification.md). Para a estrutura de navegação, consulte o [padrão disclosure da W3C](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/).

- **O que move:** o painel entra por opacidade e deslocamento curto em **240 ms**; o chevron e os cartões respondem em **150 ms**. Três diagramas SVG têm loops próprios de **2,6 s**, **2,2 s** e **1,3 s**, com defasagens entre partes.
- **Gatilho e estado:** hover de mouse fino ou ativação do botão abrem o painel e mudam o indicador; `Escape`, clique fora e escolha de link fecham. Os diagramas rodam enquanto o painel está aberto e visível, **independentemente do hover no cartão**. Um botão pausa os loops; `prefers-reduced-motion: reduce` os remove.
- **Mecanismo no código:** `transition` anima painel, indicador e cartões; `@keyframes` animam elementos SVG separados daqueles usados para feedback de hover/foco. `aria-expanded` acompanha o estado lógico, `inert` retira o painel fechado da interação, e atributos de visibilidade e pausa controlam `animation-play-state`.
- **Adapte:** separe a resposta causal do menu (abrir/fechar, seleção, foco) de uma animação explicativa dentro de um cartão. Redesenhe os pictogramas para representar o conteúdo do projeto; preserve uma leitura estática quando o loop parar.
- **Limite:** o kit é um exemplo de comportamento, não um layout ou uma identidade para copiar. Teste teclado, toque, foco e movimento reduzido no projeto real e no navegador de destino.

## 2. Motion: indicador de aba que acompanha a seleção

**Fontes:** [Tab select](https://motion.dev/examples/react-tab-select) (demo e introdução públicas) e [Shared layout animation](https://motion.dev/examples/react-shared-layout-animation) (exemplo com fonte pública).

- **O que move:** uma linha ou marca de seleção parece atravessar os botões, enquanto cada botão recebe resposta breve a pressionar e focar.
- **Gatilho e estado:** selecionar outra aba altera `selectedTab`; `whileTap` e `whileFocus` respondem às respectivas interações. O exemplo indica testar Tab e Enter.
- **Mecanismo documentado:** elementos condicionais com o mesmo `layoutId` permitem ao Motion interpolar a posição do indicador entre layouts; as propriedades de gesto cuidam do retorno ao estado normal.
- **Adapte:** use um elemento visual compartilhado quando a seleção se move entre itens e há uma relação espacial clara. O estado selecionado, conteúdo mostrado e `aria-selected` devem mudar juntos; aplique feedback equivalente a teclado e toque.
- **Limite:** em **Tab select**, a demonstração e o começo do tutorial são públicos, mas a fonte completa e o restante do tutorial exigem Motion+. O exemplo **Shared layout animation** fornece fonte pública para a técnica de `layoutId`; não trate seu markup como um padrão de tabs acessíveis pronto sem validar ordem de foco e teclado.

## 3. Motion: três políticas de entrada e saída

**Fonte com demo e código públicos:** [AnimatePresence modes](https://motion.dev/examples/react-animate-presence-modes) e [documentação de `AnimatePresence`](https://motion.dev/docs/react-animate-presence).

- **O que move:** ao acionar “Switch”, um elemento sai com escala/opacidade e outro entra; o exemplo usa transições de **0,3 s** para comparar os modos.
- **Gatilho e estado:** a mudança de uma chave React substitui o filho. `sync` põe entrada e saída em paralelo; `wait` termina a saída antes da entrada; `popLayout` retira o elemento que sai do fluxo para permitir que vizinhos se rearranjem.
- **Mecanismo documentado:** `AnimatePresence` mantém temporariamente o filho removido para executar seu `exit`; `mode` decide a coordenação. `wait` aceita um filho por vez.
- **Adapte:** escolha a política de troca conforme o conteúdo. Um painel que precisa responder imediatamente não deve esperar uma saída longa; uma sequência editorial pode justificar `wait`; listas mutáveis podem usar `popLayout`.
- **Limite:** presença animada não gerencia automaticamente `aria-expanded`, foco, `inert` ou destino dos links. Trate a semântica e a possibilidade de interação separadamente da animação visual.

## 4. MDN: galeria com View Transitions nativas

**Fontes:** [demonstração da galeria](https://mdn.github.io/dom-examples/view-transitions/spa/) e [guia da MDN com código](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using).

- **O que move:** a imagem principal e sua legenda transitam entre versões anterior e nova; a legenda pode receber tratamento separado do restante da página.
- **Gatilho e estado:** clicar em uma miniatura atualiza `src` e `figcaption`. O destino é a imagem selecionada mesmo quando não há suporte à API.
- **Mecanismo documentado:** `document.startViewTransition(() => displayNewImage())` captura estados antigo/novo; a transição padrão faz um crossfade. `view-transition-name` separa a legenda para animá-la com os pseudo-elementos `::view-transition-old/new(...)`. Se a API falta, o código atualiza o DOM diretamente.
- **Adapte:** use snapshots para passagem entre estados visuais bem definidos, como galeria de trabalhos ou detalhe de produto. Mantenha atualização funcional sem animação e defina nomes únicos quando destacar elementos específicos.
- **Limite:** uma View Transition não substitui a lógica de seleção, foco ou fallback. A documentação alerta que nomes duplicados no mesmo estado podem fazer a transição ser ignorada; confira compatibilidade e foco depois da troca.

## 5. Codrops: imagem editorial que acompanha item do menu

**Fontes com código aberto:** [tutorial de Manoela Ilic](https://tympanus.net/codrops/2020/07/01/creating-a-menu-image-animation-on-hover/), [demo](https://tympanus.net/Tutorials/RapidImageHoverMenu/) e [repositório](https://github.com/codrops/RapidImageHoverMenu/).

- **O que move:** uma imagem aparece ao lado do item e acompanha a posição horizontal/vertical do ponteiro; sua inclinação e brilho respondem à velocidade do movimento.
- **Gatilho e estado:** `mouseenter` mostra, `mousemove` alimenta a posição, `mouseleave` esconde e para o loop. A imagem e seu recorte entram de lados opostos em cerca de **0,2 s**.
- **Mecanismo publicado:** o tutorial usa timeline GSAP para entrada/saída, `killTweensOf` antes de uma nova transição e `requestAnimationFrame` com interpolação para o acompanhamento do cursor.
- **Adapte:** uma prévia de projeto pode aparecer ao focar/selecionar um item; a geometria da imagem deve reforçar o trabalho real mostrado. Interrompa a timeline anterior ao mudar rapidamente de item.
- **Limite:** a demonstração é um experimento **centrado em hover**. Em produto, ofereça seleção por teclado/toque e uma alternativa sem movimento; não copie as imagens de exemplo, cujos créditos e licença aparecem no repositório.

## 6. Three.js: transição entre estados de uma cena 3D

**Fontes com demo e código:** [skinning and morphing](https://threejs.org/examples/webgl_animation_skinning_morph) e [arquivo da demonstração no repositório oficial](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_animation_skinning_morph.html).

- **O que move:** o personagem alterna ações cíclicas e gestos únicos por mistura entre clipes; expressões faciais usam influências de morph targets independentes.
- **Gatilho e estado:** mudar “state” no controle aciona fade de **0,5 s**; ações pontuais usam **0,2 s** e retornam ao estado base quando terminam. A expressão altera pesos de morph diretamente.
- **Mecanismo publicado:** `AnimationMixer`, `clipAction`, `fadeOut`/`fadeIn` e atualização do mixer com `dt` a cada frame; o renderer usa `setAnimationLoop`.
- **Adapte:** em um objeto do briefing, associe cada estado a informação real: abrir/fechar uma peça, mudar um feixe de luz, mostrar material ou detalhe. Separe transição de estado de movimento ambiente e permita trocar de escolha antes da animação acabar.
- **Limite:** a demo ensina mistura de animações, não é um componente de site final. Seu uso de resolução e renderização contínua precisa de revisão de custo em celular, pausa fora de vista, fallback WebGL e equivalente textual; consulte [responsividade do Three.js](https://threejs.org/manual/pages/responsive.html).

## 7. Codrops: duas camadas de animação no mesmo menu

**Fontes com código:** [artigo original](https://tympanus.net/codrops/2021/11/02/svg-overlay-and-infinite-menu-background-animation/), [demo](https://tympanus.net/Development/Theodore/) e [repositório MIT](https://github.com/codrops/Theodore/).

- **O que move:** um caminho SVG faz a transição de abertura/fechamento; por trás, linhas de imagens seguem em movimento contínuo. São movimentos com ciclos e propósitos separados, como um painel e os diagramas dentro dele.
- **Gatilho e estado:** abrir/fechar o menu controla a transição SVG. O fundo usa `@keyframes` de translação infinita, com linhas em durações distintas de 10, 16 e 22 s. A repetição das imagens permite reiniciar o ciclo no mesmo quadro visual.
- **Adapte:** separe uma timeline de entrada/saída do loop interno, e desenhe este último para transmitir algo do conteúdo. O mesmo princípio pode servir a cartões com barras, feixes, linhas de processo ou números que avançam.
- **Limite:** o efeito longo do demo é ornamental e requer revisão de pausa, visibilidade, movimento reduzido e custo antes de entrar num site de produção. Não reproduza as imagens ou a composição do projeto.

## 8. Motion: morph contínuo de um pictograma SVG

**Fonte com código público:** [SVG path morphing](https://motion.dev/examples/js-svg-path-morphing).

- **O que move:** um pictograma alterna entre duas formas e cores. O exemplo troca estrela e coração a cada 1 s, animando a passagem por 0,5 s.
- **Mecanismo publicado:** Flubber interpola os dados `d` dos caminhos; `animate` do Motion conduz o progresso e a cor; `setInterval` dispara cada troca.
- **Adapte:** use morph de `path` quando duas formas precisarem indicar etapas reais de um processo ou estados de um controle. Para pictogramas simples, transforme grupos SVG com CSS antes de acrescentar dependências.
- **Limite:** o exemplo público não pausa o `setInterval`. Ao adaptar, pare intervalo e animações quando o componente sair da tela, a aba estiver oculta, a pessoa pausar ou preferir movimento reduzido; limpe-os ao desmontar. Não trate a alternância automática como substituta de um estado selecionado pelo usuário.

## Fonte parcialmente fechada

O [Mega Menu do Motion](https://motion.dev/examples/react-mega-menu) anuncia indicador deslizante, dropdown com spring e colunas em sequência. A demonstração é visível, mas o **código completo exige Motion+**. Serve como referência de composição de camadas; não atribua a ele detalhes de implementação não publicados e não dependa dele para gerar o componente. Para construir o menu, use o [sistema de motion](motion-system.md) e o [motion kit](../assets/motion-kit/), que têm instruções e código inspecionáveis.
