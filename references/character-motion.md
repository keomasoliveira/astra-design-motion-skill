# Personagem animado em uma página

Use este processo somente quando o briefing de uma landing page, site pessoal ou portfólio de página única incluir um personagem animado. Ele complementa o [sistema de motion](motion-system.md) e o [contrato de UX](ux-contract.md); não exige 3D nem substitui a direção visual da página. Preserve a identidade aprovada e o conteúdo real do projeto. Se o personagem ainda não existir, crie-o antes de produzir o movimento.

## Antes do storyboard: crie o personagem quando faltar

Se o briefing pede personagem e não há arte aprovada, derive um conceito **original** da função narrativa e da direção visual da página. Defina silhueta reconhecível, proporções, rosto, roupa, acessórios, paleta, traço e capacidade de executar os gestos necessários. Produza uma ficha com pose neutra, vistas/ângulos necessários, expressões, mãos e detalhes que tendem a derivar; confira a leitura no tamanho real do site e no celular. Escolha e fixe uma versão como referência para todos os keyframes. Não copie um personagem de referência nem invente fatos da marca para justificar o desenho. Se a identidade ainda depender de aprovação externa, identifique a proposta como conceitual no material entregue.

## 1. Dê uma função a cada gesto

Antes de gerar quadros, descreva a cena como uma sequência de eventos observáveis:

| Beat | Intenção narrativa | Gesto e pose legível | Objeto/contato | Estado de entrada e saída |
| --- | --- | --- | --- | --- |
| Preparação | O que a pessoa deve entender? | Onde olhar, como antecipar a ação? | O que já está na mão ou na cena? | De onde vem e para onde pode voltar? |

Defina repouso, antecipação, ação, consequência e encerramento apenas quando fizerem sentido para a história. Marque os instantes exatos de tocar, segurar e soltar objetos. Um gesto que não esclarece conteúdo, estado ou personalidade deve ser simplificado. Registre duração desejada, viewport, gatilho, possibilidade de interrupção e equivalente estático/textual. A pessoa deve conseguir ler e agir sem esperar a atuação terminar.

## 2. Trave a identidade antes de interpolar

Use a ficha visual existente ou a versão original fixada antes do storyboard e poses-chave suficientes para os eventos da cena. Para quadros completos RGBA, mantenha dimensões do canvas, ponto de ancoragem, escala, enquadramento e espaço transparente estáveis. Separe o personagem do fundo; não corte mãos, acessórios ou sombra por acidente. Não presuma que dois PNGs com o mesmo tamanho têm alinhamento visual igual. Inventarie objetos já pintados nos quadros: se um deles deve se soltar e seguir como elemento externo, prepare quadros/camadas do personagem **sem** o objeto após a soltura, mais a camada do objeto. Ocultar apenas a cópia externa não remove um objeto embutido na imagem.

Revise **cada pose-chave e cada intervalo aceito**, em tamanho de exibição real, lado a lado e sobreposto, sobre fundo claro, escuro e quadriculado:

- **Rosto:** proporção, expressão, olhos, nariz, boca, cabelo e contorno não mudam de identidade entre poses.
- **Óculos e acessórios:** armação, hastes, lentes, alinhamento com o rosto e oclusão permanecem plausíveis.
- **Mãos:** número de dedos, anatomia, gesto, contato e qual mão segura o objeto são consistentes.
- **Roupa:** corte, costuras, cores, textura e detalhes reconhecíveis não derivam.
- **Texto e símbolos:** formas e grafia aprovadas não viram letras inventadas durante morph ou compressão.
- **Transparência:** alpha real, bordas sem halo, sem fundo opaco residual, recorte e sombra coerentes; teste composição em fundos contrastantes.

Monte uma folha de contato com índices e compare pares adjacentes, incluindo o fechamento de um loop. Se a identidade ou a silhueta falhar, **rejeite o intervalo**; suavidade matemática não corrige desenho incoerente. Guarde quais quadros foram aprovados e quais precisam de correção, sem aceitar uma sequência inteira por aparência de um único frame.

## 3. Escolha o mecanismo pelo movimento necessário

| Mecanismo | Escolha quando | Custo e limite a verificar |
| --- | --- | --- |
| **Rig** com partes e juntas | Poucas partes deformam de modo controlável, há interação ou mudanças de estado em tempo real | Desenhe as juntas e a ordem de oclusão; teste mãos, rosto e acessórios nos extremos. Um rig não inventa poses que seus recortes não suportam. |
| **Sequência de quadros RGBA completos** | Silhueta, roupa ou expressão mudam além do que o rig preserva; o fundo da página deve aparecer atrás | Controle identidade entre todos os frames, carregamento, decodificação, memória e sincronização. Repetir ou segurar um quadro pode ser uma escolha de atuação, desde que declarada. |
| **Vídeo** | Há movimento contínuo com duração fechada e compressão/decodificação ajudam mais que interatividade por partes | Teste codec e, se necessário, transparência **nos navegadores alvo**. Metadado de alpha ou `canPlayType()` não prova pixels transparentes. Tenha pôster ou quadro RGBA completo de fallback. |

Um híbrido é válido: o personagem pode usar vídeo/quadros, enquanto um objeto externo usa DOM, SVG ou canvas. Não escolha uma tecnologia só pela taxa de quadros declarada. Faça uma amostra curta do intervalo mais difícil e abra no navegador antes de produzir o restante.

## 4. Calcule o orçamento temporal e o trabalho de interpolação

Para duração `T` segundos e amostragem alvo `F` quadros/s, planeje `N = ceil(T × F)` posições temporais nos instantes `i/F`, com `i = 0…N−1`. Isso **não** significa `N` desenhos únicos nem `N` quadros exibidos. Com poses-chave nos índices `a` e `b`, há `b − a − 1` posições internas a resolver. Some os intervalos e inclua a passagem final→inicial se houver loop. Assinale holds e cortes: eles ocupam tempo, mas não exigem interpolação de desenho.

Exemplo genérico: `T = 2,5 s`, `F = 24` dá 60 posições. Se quatro poses aprovadas ocupam os índices `0, 20, 40, 59`, restam `19 + 19 + 18 = 56` posições internas para interpolar, repetir ou redesenhar. A quantidade de propostas pode ser maior que 56 se um intervalo for rejeitado. Para `U` imagens RGBA **distintas** decodificadas de tamanho igual, `U × largura × altura × 4` bytes estima uma cópia bruta; caches, buffers e texturas podem aumentar o uso real. Holds reduzem `U`, mas não a duração. Meça memória e carregamento no navegador. Não gere tudo às cegas: resolva e audite um par difícil primeiro.

Para cada intervalo, descreva trajetória, velocidade, oclusão, contato e identidade esperados. Interpolação bidirecional ou múltiplas amostras aumenta o trabalho aproximadamente com `pares × amostras × passagens`; conte os candidatos gerados, os aceitos e os refeitos no plano de produção. Ajuste duração ou mecanismo se o volume de quadros e revisão ultrapassar o orçamento.

### Quando rejeitar, criar ponte, usar midpoint ou cortar

1. **Rejeite o intervalo** se aparecer rosto diferente, armação que troca de forma, dedos extras, roupa que deriva, texto ilegível, halo ou objeto duplicado. Não esconda a falha com blur ou crossfade de silhuetas incompatíveis.
2. **Crie um quadro de ponte desenhado/dirigido** quando o caminho precisa explicitar nova pose, mudança de oclusão ou contato (por exemplo, a mão que passa à frente do objeto). Audite os dois novos intervalos.
3. **Use um único midpoint** quando início e fim mantêm identidade e topologia, mas falta uma pose intermediária para corrigir arco ou ritmo. Aceite-o apenas se ambas as metades ficarem limpas; uma cadeia de midpoints para encobrir morph instável pede redesenho.
4. **Faça um corte intencional** quando a narrativa comporta salto de tempo/estado e a continuidade visual seria falsa. Troque diretamente no beat definido, preserve o estado do objeto e do controle e teste se a leitura continua clara. Corte não é defeito camuflado por fade.

## 5. Sincronize personagem e objetos externos

Use **um relógio de cena** para pose, objeto, efeitos e eventos de contato. Para rig ou sequência de imagens, avance um tempo monotônico controlado pela cena. Quando um vídeo conduz o personagem, use a linha do tempo da mídia como fonte de verdade para o objeto externo: amostre `currentTime` para a trajetória contínua e confira os eventos de contato com `mediaTime` de `requestVideoFrameCallback()` quando disponível. Não avance um relógio JS independente; se o vídeo parar ou aguardar dados, o objeto também para. Faça seek apenas no reinício ou para corrigir uma deriva observada, nunca em cada callback. Defina tempo local de cada beat, coordenadas e âncoras em relação ao container responsivo; recalcule trajetórias quando o layout mudar. Na passagem mão→voo ou voo→mão, o objeto embutido deve desaparecer no quadro de transferência antes de surgir na camada externa, sem duplicação. Verifique ordem de camadas, sombra, escala, direção e posição nos frames antes/depois da transferência. Pausa congela todos no mesmo instante; replay volta todos ao mesmo estado inicial.

Modele `idle → playing → paused → ended` (e um estado estático para movimento reduzido) como estado lógico, não como efeito CSS. Reproduzir novamente reseta relógio, pose, objeto e eventos; retomar continua do instante pausado. Aba oculta e elemento fora de vista suspendem trabalho contínuo; ao voltar, não aplique um delta gigante. Mudança de aba informativa ou redimensionamento não deve reiniciar a atuação sem intenção do usuário. Se vídeo substituir quadros completos, faça seek em reinício ou deriva real, não a cada callback do relógio externo. Exponha botões operáveis de pausa/retomada e replay quando a animação automática os exigir, com nomes e estado acessíveis. Em `prefers-reduced-motion`, mostre pose/resultado informativo e texto equivalente, mantendo controles e conteúdo utilizáveis.

## 6. Meça o que aparece no navegador

Separe quatro observações: **callbacks agendados**, **pose/índice desenhado pela aplicação**, **quadro enviado ao compositor** e **mudança visual observada**. `requestAnimationFrame` mede a oportunidade de atualizar; 60 callbacks/s podem repetir a mesma pose, chegar tarde ou nem exibir o personagem. **Nunca o apresente como prova de 60 fps do personagem.**

- **Vídeo:** em uma janela de teste visível, leia antes/depois `video.getVideoPlaybackQuality()`; `ΔtotalVideoFrames − ΔdroppedVideoFrames` estima quadros apresentados, e `ΔdroppedVideoFrames` registra perdas. Use `requestVideoFrameCallback()` para registrar `mediaTime`, `presentedFrames` e tempos de apresentação; saltos em `presentedFrames` indicam callbacks perdidos, não necessariamente frames de vídeo perdidos. Esses dados contam submissão/composição ou qualidade de playback, não garantem cada varredura física do monitor. [MDN: quality](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/getVideoPlaybackQuality) e [MDN: video frame callback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback).
- **Rig ou sequência de imagens:** instrumente o índice/pose que a aplicação realmente desenha; depois confira a **região do personagem** em uma gravação Performance com Frames e screenshots/filmstrip. Conte mudanças visuais distintas, repetições e lacunas no período, correlacionando com os índices e frames perdidos/parcialmente apresentados do navegador. Contar `src` atribuído, imagens carregadas ou `rAF` não mede quadros vistos. [Chrome DevTools: Frames e screenshots](https://developer.chrome.com/docs/devtools/performance/reference).
- **Relatório:** informe duração medida, dispositivo/viewport, frequência de atualização quando conhecida, visibilidade da aba, mecanismo, quadros/poses distintos observados, perdas, holds deliberados e limitações da captura. Filmstrip e gravação também têm cadência e não provam cada varredura física da tela. Teste replay, pausa, retomada, resize, celular e movimento reduzido. Não declare uma taxa sustentada quando a evidência cobre só o loop de callback ou um arquivo codificado.

## Prompts prontos para Astra

Substitua os campos entre colchetes pelo briefing e pelo material disponível; anexe a ficha visual e os quadros existentes quando houver. Peça saída verificável, sem inventar conteúdo comercial.

**Criação do personagem, se faltar**

> A página [briefing, público e direção visual] precisa de um personagem original para comunicar [função narrativa], mas não há ficha visual aprovada. Proponha uma identidade própria que funcione no tamanho real da página e permita os gestos [lista]. Entregue silhueta, proporções, rosto, roupa, acessórios, paleta e traço; inclua pose neutra, vistas/ângulos úteis, expressões, mãos e detalhes de continuidade. Mostre como a proposta se liga ao briefing sem copiar referências nem inventar fatos da marca. Marque-a como conceitual até aprovação externa e fixe uma versão de trabalho para os keyframes.

**Storyboard**

> Para a página [objetivo, público e contexto], desenhe um storyboard de [duração] para [personagem aprovado]. Cada beat deve ter função narrativa, pose/silhueta, olhar, contato com [objeto, se houver], instante de pegar/soltar, estado de entrada/saída e equivalente estático. Proponha um ritmo que não bloqueie leitura nem controles. Entregue tabela temporal e marque saltos que exigiriam quadro de ponte ou corte.

**Keyframes RGBA**

> Com base na ficha visual existente ou na versão original fixada [anexo] e no storyboard [anexo], produza/planeje poses-chave completas em RGBA transparente para os instantes [índices/tempos]. Mantenha canvas, âncora, escala, rosto, óculos/acessórios, mãos, roupa, traço e qualquer texto idênticos à referência. Não corte extremidades nem pinte fundo. Entregue folha de contato sobre fundos claro, escuro e quadriculado e liste diferenças de identidade que ainda exigem correção.

**Correção de morph**

> Compare os quadros [A] e [B] e as amostras intermediárias [anexos] no tamanho de exibição. Audite rosto, óculos/acessórios, mãos, roupa, texto, oclusão e alpha. Para cada falha, diga se deve rejeitar o intervalo, desenhar um quadro de ponte, inserir **um único midpoint** ou fazer um corte intencional; justifique pela continuidade narrativa e visual. Gere apenas a correção escolhida e mostre os dois novos intervalos para aprovação. Não use blur/crossfade para esconder deriva.

**Implementação**

> Implemente a cena aprovada [storyboard/assets] na página existente [stack]. Compare rig, sequência RGBA e vídeo conforme pose, transparência, interação, custo e compatibilidade; escolha e justifique. Calcule `ceil(duração × fps)` posições e os intervalos entre poses-chave. Inventarie objetos pintados nos quadros e prepare versões sem o objeto na transferência, quando ele passar a uma camada externa. Use um relógio para personagem e objetos externos, com a linha do tempo da mídia como fonte quando houver vídeo; implemente pausa, retomada, replay, visibilidade da aba, resize, fallback e `prefers-reduced-motion`. Meça quadros do personagem apresentados/observados e perdas no navegador com o método apropriado; não use apenas `requestAnimationFrame` como evidência. Preserve os controles e conteúdo já existentes.

**Crítica e aceite**

> Revise [URL/artefato] em desktop e celular com a ficha visual e o storyboard aprovados. Avalie função de cada gesto, identidade em todos os intervalos, rosto, óculos/acessórios, mãos, roupa, texto, transparência e sincronização do objeto. Acione pausa/retomada/replay, teste fallback e movimento reduzido. Registre duração real, quadros distintos observados, perdas/holds e método de medição. Liste falhas bloqueantes com frame e evidência; não declare taxa de quadros ou acabamento sem prova visual.
