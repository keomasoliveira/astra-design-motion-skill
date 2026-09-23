# Sistema de motion implementável

Use esta referência quando a página tiver menu, sidebar, ícones animados, transições de seção ou cena 3D. O objetivo é produzir movimento com causa, estado final e saída previsíveis. A direção de arte define **como** cada efeito parece; as receitas abaixo definem **como fazê-lo funcionar**. Consulte os [exemplos estudados](motion-examples.md) e veja [a demonstração executável](../assets/motion-kit/) para adaptar um disclosure, diagramas animados e estados de ponteiro, teclado e toque. Ela é uma base de comportamento, não um layout a copiar.

## Contrato de cada movimento

Antes de animar, escreva `gatilho → estado inicial → propriedade alterada → estado final → interrupção → versão reduzida`. O conteúdo e a ação nunca podem depender do efeito terminar. O estado acessível deve acompanhar o estado lógico, mesmo durante uma transição visual. Não adicione motion só porque a biblioteca oferece um preset.

| Gatilho | Mudança e propriedade preferida | Tempo inicial para ajustar no navegador | Se interrompido | Com movimento reduzido |
| --- | --- | --- | --- | --- |
| Menu abre por botão, toque ou hover deliberado | Painel entra com `opacity` e `transform` curto; indicador gira para o estado aberto | 160–240 ms, saída suave | Nova abertura cancela a saída; links ficam operáveis assim que o painel abre | Painel aparece no lugar, indicador muda sem giro |
| Menu fecha por botão, `Escape`, clique fora ou saída do conjunto | Painel perde opacidade e volta alguns pixels; indicador retorna | 120–180 ms | Nova entrada reverte do ponto atual; painel fechado deixa de receber foco/cliques imediatamente | Fecha sem deslocamento; foco continua previsível |
| Cartão recebe hover ou `:focus-visible` | Borda, cor ou elevação discreta; ícone explica seleção se isso tiver sentido | 120–180 ms | Troca de cartão restaura o anterior, sem fila de animações | Mesma indicação por cor, borda e foco, sem movimento |
| Controle muda de valor/seleção | Partes do SVG e rótulo respondem ao novo estado, por `transform`/`opacity` quando possível | 150–250 ms | O alvo passa a ser o novo valor; não reproduza uma animação antiga | Estado final, rótulo e valor continuam visíveis |
| Seção entra no campo de visão | Uma mudança editorial específica de posição/opacidade ou máscara; texto permanece no fluxo | 280–450 ms; stagger curto só onde melhora a leitura | Entrada repetida não empilha timelines; retorno preserva a leitura | Conteúdo imediatamente presente e legível |
| Pessoa altera a cena 3D | Câmera, forma, material ou luz interpolam para um estado que comunica a escolha | 350–800 ms segundo distância e função | Alvo muda a partir do valor atual; sem salto nem controle bloqueado | Renderize o estado escolhido sem percurso espacial |
| Diagrama ou ícone demonstra processo automaticamente | Loop localizado, com informação estática equivalente | Só enquanto visível e justificado | Pause quando oculto, fora de vista ou a pessoa pedir | Quadro estático com a mesma informação |

Essas durações são **pontos de partida**, não uma identidade visual obrigatória. Ajuste vendo a página real e mantenha uma família pequena de tempos e curvas. Um exemplo de tokens:

```css
:root {
  --motion-response: 150ms;
  --motion-panel: 210ms;
  --motion-story: 360ms;
  --ease-enter: cubic-bezier(.2, .8, .2, 1);
  --ease-exit: cubic-bezier(.4, 0, 1, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-response: 0ms;
    --motion-panel: 0ms;
    --motion-story: 0ms;
  }
  html { scroll-behavior: auto; }
}
```

Use `transform` e `opacity` para mudanças de posição/entrada quando isso atende à direção visual; normalmente evitam trabalho de layout em cada quadro. Cor/borda podem ser animadas em elementos pequenos após medir o custo. Não espalhe `will-change` por toda a página: aplique apenas a componentes prestes a animar quando houver problema observado. [web.dev: animações eficientes](https://web.dev/articles/animations-guide).

## Menu de navegação e sidebar

**Estrutura.** Para links comuns de navegação, use `<nav>`, um `<button aria-expanded="false" aria-controls="id-do-painel">` e um contêiner de links. Não use `role="menu"` para um dropdown de links de site: esse papel exige um modelo de teclado diferente. A [W3C APG mostra o padrão disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/). Quando fechado, retire o painel da ordem de foco (`hidden` no estado estável, ou `inert` durante a saída). O indicador visual lê `aria-expanded` como fonte de verdade.

**Estado.** Trate `closed`, `opening`, `open` e `closing` como estados visuais de um booleano lógico `isOpen`. Atualize `aria-expanded` no mesmo passo que `isOpen`. Ao abrir, remova `hidden`/`inert`, deixe os links utilizáveis e então anime o painel. Ao fechar, aplique `inert` de imediato, anime a saída e só depois aplique `hidden`. Cancele o fechamento pendente antes de reabrir. `transitionend` pode não acontecer quando a duração é zero ou a propriedade muda; tenha finalização síncrona no modo reduzido e uma finalização segura para saída cancelada. Não deixe timers antigos esconderem um painel reaberto.

**Entrada.** Clique/Enter/Espaço no botão alternam o menu; toque tem a mesma ação. Hover para abrir é uma camada opcional apenas para ponteiro fino (`matchMedia('(hover: hover) and (pointer: fine)')`), nunca o único caminho. Se houver hover, considere botão **e painel** uma região contínua: atravesse o espaço entre eles sem fechar prematuramente; uma tolerância curta de saída pode ajudar. Guarde a razão da abertura: `hover` pode fechar quando ponteiro e foco saem do conjunto; `activation` permanece até novo acionamento, clique fora, `Escape` ou escolha de link. Assim, mover o mouse não desfaz um menu aberto por toque/clique. `Escape` fecha; devolva foco ao botão se o foco estava dentro do painel. Não desvie o foco para o botão num clique fora destinado a outro controle. A W3C exige que conteúdo mostrado por hover/foco seja [dispensável, alcançável pelo ponteiro e persistente](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus).

**Camadas e sidebar.** Um dropdown de navegação pode ser não modal: Tab continua pelos links e depois pela página. Se a sidebar móvel cobre a tela e bloqueia a página, trate-a como modal de verdade; `<dialog>.showModal()` fornece fundo inerte e comportamento de foco do navegador, mas inclua botão de fechar, restaure foco no acionador e teste a saída. [MDN: `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). Uma sidebar persistente de desktop não precisa virar modal.

**Interrupções a testar.** Abra/feche/abra rapidamente; mova o ponteiro botão → painel → fora; abra por teclado, Tab nos links e pressione Escape; toque para abrir e fechar; redimensione com menu aberto; mude `prefers-reduced-motion` enquanto ele está aberto. O indicador, `aria-expanded`, a visibilidade e a possibilidade de foco devem concordar após cada sequência.

## Ícones e feedback menor

Separe três funções, porque elas pedem ciclos diferentes:

1. **Indicador de estado** (chevron, mais/menos, play/pause): transforme o desenho entre dois estados persistentes. Use o estado do controle, não `:hover`, como fonte de verdade.
2. **Feedback de ação** (seta de CTA, confirmação): uma resposta curta ao hover/foco ou à ativação pode explicar a ação; ela deve poder voltar ou ser substituída por nova ação sem acumular efeitos. Em SVG, prefira agrupar partes e animar `transform`/`opacity`; desenho por `stroke-dashoffset` também pode servir em ícones pequenos quando testado.
3. **Diagrama ambiente** (ondas, medidor, fluxo): só faça loop se ele mostrar um processo real ou reforçar a leitura. Pode rodar independentemente do hover; a transição do painel/cartão e o loop interno do diagrama são camadas distintas. Pause fora de vista e ao ocultar a aba; loops automáticos prolongados exibidos junto a outro conteúdo podem exigir um controle de pausa/parada conforme [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide).

Um ícone que executa ação pertence a um botão/link com nome acessível; SVG decorativo usa `aria-hidden="true"`. Faça a indicação de hover aparecer também em `:focus-visible` ou em estado ativado por toque. Teste toque real: CSS `:hover` pode ficar “preso” em telas sensíveis ao toque; a documentação do [Motion sobre hover](https://motion.dev/docs/react-hover-animation) descreve esse problema e reconhecedores que filtram hover emulado. Uma mudança de cor ou borda é suficiente quando mover todas as partes do ícone só adicionaria ruído.

**Como construir diagramas que continuam animados no menu aberto.** Separe elementos SVG por responsabilidade: um grupo para o movimento ambiente (`.meter`, `.signal`, `.bar`) e outro para o feedback de hover/foco (`.chevron`, `.knob`, borda). Não aplique `transform` de duas animações concorrentes ao mesmo nó. Crie keyframes curtos para progressão, pulso ou alternância que correspondam ao conteúdo; defase as partes por `animation-delay`. Ative o loop quando o painel estiver aberto, visível na janela e na aba, e quando o controle de pausa estiver em “executando”. A [demonstração](../assets/motion-kit/) implementa essas condições via atributos `data-open`, `data-in-view`, `data-page-visible` e `data-motion`. Um recorte do mecanismo:

```css
.menu[data-open="true"] .bar {
  animation: pulse 1.3s ease-in-out infinite alternate;
  animation-play-state: paused;
}
.menu[data-open="true"][data-in-view="true"][data-page-visible="true"][data-motion="running"] .bar {
  animation-play-state: running;
}
.menu .bar:nth-child(2) { animation-delay: .18s; }
@media (prefers-reduced-motion: reduce) {
  .menu .bar { animation: none !important; }
}
```

Use `IntersectionObserver` para `data-in-view`, `visibilitychange` para `data-page-visible` e botão com `aria-pressed` para pausar/retomar, quando os loops persistirem por mais de cinco segundos em paralelo a outros conteúdos. A ilustração parada deve continuar comunicando a opção. Não prometa que o loop responde ao hover se ele roda por conta própria: são gatilhos distintos.

## Passagens entre seções

Escolha uma transição ligada à narrativa: revelar a materialidade de um produto, trocar escala do mesmo objeto, mudar plano de fundo para marcar capítulo. Não aplique o mesmo `fade-in` a cada bloco. Conteúdo deve existir e ser legível sem JavaScript: adicione uma classe de inicialização de motion somente depois que o código tiver registrado os observadores. Para entrada única, `IntersectionObserver` observa um limiar apropriado, inicia a transição e dá `unobserve` após o primeiro acionamento; `disconnect()` na desmontagem. [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

Um ponto de partida seguro é animar o **acento visual do capítulo**, mantendo título e texto legíveis desde o primeiro frame. Troque o acento deste exemplo por uma transição própria do conteúdo, como o feixe de uma luminária que se abre ao entrar no capítulo de iluminação:

```js
const chapters = document.querySelectorAll('[data-motion-chapter]');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in-view');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.2 });
  chapters.forEach((chapter) => observer.observe(chapter));
}
```

```css
[data-motion-chapter] .chapter-accent { transform: scaleX(.2); transform-origin: left; }
[data-motion-chapter].is-in-view .chapter-accent { transform: scaleX(1); transition: transform 360ms ease-out; }
@media (prefers-reduced-motion: reduce) { [data-motion-chapter] .chapter-accent { transform: none; } }
```

Essa receita não substitui a revisão da sequência completa. Veja se a passagem reforça a mudança de assunto; se ela apenas repete o mesmo enfeite, redesenhe-a.

Se o movimento acompanha scroll, mantenha o scroll nativo e uma relação clara entre posição e mudança. Não exija que a pessoa espere animações para acessar conteúdo. Em transição de rota/componente, preserve conteúdo até a saída acabar somente se o componente não ficar operável indevidamente; no React, `AnimatePresence` ajuda nisso, mas suas chaves e remoção precisam estar corretas. [Motion: AnimatePresence](https://motion.dev/docs/react-animate-presence).

## Cena 3D com propósito e fallback

Defina estados discretos como `overview`, `detail`, `selected` ou os valores reais do produto. Mapeie cada escolha a uma mudança visível de câmera, forma, material ou luz e a texto equivalente. Ao mudar de estado, interpole do **valor atual** para o novo alvo; use delta de tempo em segundos, não um incremento fixo por quadro. Uma aproximação estável para um parâmetro é `current += (target - current) * (1 - Math.exp(-k * dt))`, com `dt` limitado após a aba voltar do fundo. Para câmera/orientação, use o tipo de interpolação apropriado à cena, sem alterar uma transformação que quebre controles ou enquadramento.

Para um produto articulado, uma escolha pode mudar **junta, cabeça, inclinação e raio de luz ao mesmo tempo**. A seleção atualiza texto/semântica imediatamente; a geometria alcança o alvo sem bloquear uma nova escolha. Este esqueleto mantém a velocidade estável entre telas de 60 e 120 Hz e usa o mesmo estado para WebGL e SVG de fallback:

```js
const keys = ['elbowX', 'elbowY', 'headX', 'headY', 'tilt', 'beamRadius'];
let current = { ...modes.foco }, target = modes.foco;
let frame = 0, lastTime = 0;
function selectMode(name) {
  target = modes[name];
  updateAccessibleSelection(name);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) current = { ...target };
  requestRender();
}
function requestRender() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
}
function tick(now) {
  frame = 0;
  const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 1 / 60;
  lastTime = now;
  const alpha = 1 - Math.exp(-12 * dt);
  let changing = false;
  for (const key of keys) {
    const difference = target[key] - current[key];
    if (Math.abs(difference) > .001) {
      current[key] += difference * alpha;
      changing = true;
    } else current[key] = target[key];
  }
  drawWebGL(current); updateSvgFallback(current);
  if (changing) requestRender();
}
```

Ao voltar de uma aba oculta, redefina `lastTime = 0` e solicite um quadro; conecte a mesma retomada ao observador de visibilidade da cena. Não use este mapa de juntas para um objeto diferente: defina propriedades que expliquem **o briefing real**.

Cena estática ou que só responde a eventos pode renderizar sob demanda. Cena contínua pode usar `renderer.setAnimationLoop(callback)` e parar com `setAnimationLoop(null)` quando sair de vista, a aba ficar oculta ou o modo reduzido pedir estado estático. `IntersectionObserver` e `visibilitychange` fornecem os sinais; a [documentação do Three.js](https://threejs.org/docs/pages/WebGLRenderer.html) recomenda `setAnimationLoop`, e [MDN documenta `visibilitychange`](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event). Após retomar, calcule o próximo delta sem um salto gigante.

No resize, use o tamanho **CSS** do canvas para câmera e calcule o buffer de desenho explicitamente, com limite de densidade/pixels escolhido após testar o dispositivo. DPR integral em telas densas pode multiplicar o custo da GPU; veja o [manual responsivo do Three.js](https://threejs.org/manual/pages/responsive.html). Ao desmontar, pare o loop, desconecte observadores, remova listeners e libere geometria, material, textura e renderer conforme a vida útil do componente. Se WebGL falhar, mostre um pôster/ilustração, texto e controles informativos; não deixe uma área vazia. Em perda de contexto, apresente o fallback e tente reconstruir/retomar somente se a aplicação administrar esse ciclo. Teste uma falha simulada, além da cena bem-sucedida.

## Qual mecanismo escolher

| Situação | Escolha inicial | Por quê e cuidado |
| --- | --- | --- |
| Estado simples de um componente (hover, foco, aberto/fechado) | CSS transitions/keyframes + classe/atributo semântico | Menos código; JS ainda administra abertura, foco, fechamento e eventual `hidden`. |
| Animação DOM que precisa cancelar, reverter ou controlar progresso | Web Animations API (`element.animate`) | Guarde a instância; `cancel()` interrompe e rejeita `finished`, então trate cancelamento. Não dependa de `fill: forwards` permanente para estado lógico. [MDN: WAAPI](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API). |
| React com presença, layout compartilhado e gestos ligados a estado | Motion | `animate`, `whileHover`/`whileFocus`/`whileTap`, `layout` e `AnimatePresence` compõem estados; pare controles imperativos na desmontagem. [Motion: animação](https://motion.dev/docs/react-animation). |
| Coreografia com muitos elementos, timeline ou scroll detalhado | GSAP | Use quando coordenação real pagar a dependência; `gsap.matchMedia()` adapta breakpoint/reduced motion e `.revert()` limpa estilos/timelines. [GSAP: matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/). |
| Objeto, câmera, material e luz 3D | Motor da cena, como Three.js | Sincronize estado 3D com os controles HTML; não acrescente uma biblioteca de motion DOM só para girar um objeto. |

A escolha é local ao projeto. CSS pode bastar para uma página inteira; uma timeline não corrige um conceito fraco. Em qualquer mecanismo, ao sair de tela/desmontar/cancelar: remova observadores e listeners, pare loops e deixe o DOM no estado definido pela aplicação.

## Verificação no navegador

Teste a sequência completa, não só o primeiro frame: entrada → estado ativo → ação repetida/contrária → saída → reentrada. Confira visualmente desktop e toque, Tab/Shift+Tab/Enter/Espaço/Escape, foco visível, clique fora, `prefers-reduced-motion`, aba oculta e cenário sem WebGL. Inspecione os pixels da cena e registre no [contrato de UX](ux-contract.md) o resultado para cada controle. Use DevTools Performance quando houver travamento; `transform`/`opacity` não dispensam medir. O resultado exigido é comportamento consistente e acabamento visual específico do briefing, não uma contagem de animações.
