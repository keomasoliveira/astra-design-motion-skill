# Ofício do personagem vetorial

Leia esta referência ao criar ou refazer um personagem em SVG para uma página da skill. Ela complementa o [gate e a atuação](character-motion.md): o objetivo é preservar a arte mestre em formas editáveis que continuem coerentes quando animadas. Um bom IoU global ainda pode esconder olhos, mãos, pés ou juntas errados.

## Prepare uma fonte de verdade

Fixe uma **imagem raster mestre** com pose, ângulo, canvas, alpha, luz e expressão identificados. Se houver arte aprovada pelo usuário ou pela marca, ela prevalece. Se a arte ainda for conceitual, registre essa condição; gerar uma imagem não a torna automaticamente aprovada. Quando o briefing não exigir aprovação externa, a revisão e os gates internos podem fixá-la como mestre de trabalho. Guarde versão ou hash de mestre, SVG e cena usada na captura. Trabalhe no mesmo enquadramento e escala uniforme. Corrija a mestre quando ela própria tiver anatomia ou expressão fracas; nunca derive uma nova “mestre” do SVG para elevar a nota.

Escreva um contrato curto antes de traçar: silhueta e proporções; espessura e hierarquia de contornos; direção da luz; cores e material; traços invariantes da expressão; partes que cruzam ou seguram objetos; âncoras, pivôs e ordem de oclusão. Descreva apenas elementos que o personagem possui. No menor tamanho de uso, forma e intenção devem ser legíveis sem legenda, brilho ou movimento.

## Reconstrua forma, volume e articulação nessa ordem

1. **Massas e espaços negativos.** Bloqueie cabeça, tronco, membros e vazios entre eles com poucos paths editáveis. Compare em preto antes de detalhar. Ajuste proporções e linha de ação sem compensar um erro grande com um detalhe pequeno.
2. **Topologia e contato.** Defina onde cada massa nasce, se dobra, se sobrepõe e termina. Marque no `viewBox` pontos de olhos, boca, ombros, palma, quadril, joelho, tornozelo e pontas que existirem. Um ponto dentro de 2% da altura é apenas um teto de triagem; olho ou dedo ainda pode parecer errado com deslocamento menor.
3. **Partes semânticas.** Separe grupos que realmente precisam de movimento ou troca de pose. Mantenha `id`, pivô, geometria visível e elemento de oclusão compreensíveis. Não fragmente cada mancha de cor em uma junta independente nem una num único path partes que exigem movimentos incompatíveis.
4. **Volumes antes de enfeites.** Modele planos claros/escuros, sombra de contato e luz conforme a forma. Gradientes e realces seguem o cilindro de um dedo, a curvatura da bochecha ou o volume de um pé; manchas geométricas arbitrárias deixam o vetor plano. Use textura só depois que forma, rosto e anatomia funcionarem sem ela.
5. **Contornos e detalhes.** Decida para cada path se ele é **borda externa**, **limite de oclusão** ou **vinco interno**. Dê continuidade de espessura e tangente às bordas estruturais. Vinco interno começa e termina em uma forma plausível; não deixe ponta escura solta. Verifique `stroke-linecap`, `stroke-linejoin`, preenchimento e clipping no render real; caps arredondados não consertam uma junta desconectada.

| Parte presente na ficha | Faça | Rejeite quando aparecer |
| --- | --- | --- |
| Olhos e sobrancelhas | Compare **cada olho** separadamente: abertura, globo, pálpebra, íris/pupila, reflexo, olhar e relação com a crista/sobrancelha; teste a piscada. | Ovais genéricos iguais, branco excessivo, pupila deslocada sem o arco acompanhar, expressão diferente da mestre. |
| Boca, mandíbula e rosto | Faça a boca nascer da superfície do focinho; confira cantos, tensão do sorriso, queixo e sombra de contato com a mão. Preserve o volume da mandíbula nas expressões alternativas. | Linha fina flutuante, canto quebrado, mandíbula como faixa plana, expressão que muda só pela troca de um path. |
| Mãos e dedos | Desenhe palma e origem de **cada dedo** antes do vinco. Verifique número, separação, espessura, volume, espaço negativo e contato com rosto/objeto no tamanho real. | Mão em Y ou pinça sem palma, dedos fundidos/amarrados, laços sem origem anatômica, dedo que atravessa rosto ou fica sem contato. |
| Tronco e pernas | Siga de quadril a coxa, joelho, canela, tornozelo e pé. Faça luz e linha externa atravessarem mudanças de volume sem saltos; confira ambas as pernas. | Faixa diagonal rígida no quadril, joelho como quina ou círculo colado, canela tubular sem massa, borda que some na junta. |
| Pés ou extremidades | Construa apoio, calcanhar e cada dedo/lobo a partir de volumes; desenhe vales internos onde a separação ocorre e confira leitura no chão e no celular. | Forma de luva, dedos definidos apenas por riscos superficiais, solado sem contorno, tornozelo desligado do pé. |
| Roupa e acessórios, se houver | Preserve corte, fixação, material, texto/símbolos e oclusão em todas as poses. | Acessório que flutua, muda de lado ou forma, texto inventado pelo morph. |

SVG editável não significa cópia por *autotrace*: paths excessivos podem preservar ruído e destruir o controle das articulações. Também não significa inserir PNG em `<image>`, cobrir defeitos com sombra ou preencher fenda com blur. Quando um detalhe essencial exige deformação que o rig não consegue manter, redesenhe a parte ou reavalie rig versus quadros completos.

## Contrato geométrico de cada junta do rig

Para uma junta que forma a silhueta, registre `parte A`, `parte B`, âncoras `pA/pB`, transformações `TA(t)/TB(t)` e camada que cobre a costura. Compare `TA(t)·pA` com `TB(t)·pB` no espaço final em repouso, antecipação, extremos, contato e retorno. A proximidade numérica não basta: confira também tangente do contorno, sobreposição dos preenchimentos, espessura e oclusão no pixel renderizado. Um deslocamento do tronco que não é aplicado à perna pode abrir a costura mesmo quando os pivôs coincidem no SVG parado.

Mantenha o contorno estrutural opaco e separado das luzes/sombras. Se a borda precisa acompanhar dois grupos, escolha âncora e transformação compartilhadas, trecho de ponte desenhado ou deformação controlada. Reprove fenda de fundo, entalhe, traço duplicado, ponta solta e linha que vira interna em outra pose. **Não** apague a borda com gradiente até alpha zero, arredonde caps ou sobreponha sombra para esconder falha. Depois de editar path, gradiente, pivô, camada ou timing, sincronize as cópias geradas da arte e refaça as evidências estática e dinâmica afetadas.

Essa regra de transformações é uma **inferência operacional** apoiada em práticas de anexar partes e deformar meshes; não é fórmula literal das fontes. [Adobe documenta attachments e handles](https://helpx.adobe.com/adobe-character-animator/desktop/rigging/attachment-and-handles.html), [Rive documenta bones](https://rive.app/docs/editor/manipulating-shapes/bones) e [MDN documenta line caps](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-linecap), [joins](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-linejoin) e [gradientUnits](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/gradientUnits).

## Revise com pixels e uma matriz de partes

Renderize o SVG em PNG RGBA com o mesmo canvas, pose, escala e ângulo da mestre; guarde lado a lado e sobreposição. Examine em 1×, no tamanho de uso, em 32/64/128 px e ampliado. Calcule IoU da silhueta global conforme o [gate de aceite visual](character-motion.md). Use recortes regionais alinhados como **diagnóstico** quando o score global esconder pé ou mão fraco; recorte alpha não mede olho, material nem anatomia interna. Não ajuste o recorte para excluir defeito.

Para cada parte aplicável, preencha `PASS / FAIL / N/A` com captura real. Falha crítica em forma, expressão, contato, oclusão, transparência ou contorno bloqueia o vetor, mesmo com IoU e nota agregada altos. Não marque `PASS` quando imagem ou pose não foi vista.

| Parte e lado | Pose/tempo, viewport e escala | Evidência | Diferença com coordenada/camada | Causa e correção | Estado | Versão rechecada |
| --- | --- | --- | --- | --- | --- | --- |
| Ex.: olho esquerdo | Pose mestre, celular, 1× + zoom | crop PNG | Abertura maior no arco superior | Redesenhar pálpebra e testar piscada | `FAIL` | SVG/scene hash |

Inclua cada olho, boca/mandíbula, corpo, cada braço/mão, cada perna/pé e cada contato **presentes**. Para rig, use `renderAt(t)` ou scrub reproduzível: capture os extremos e ao menos o meio de **cada intervalo que move uma junta de silhueta**. Amplie para 25/50/75% e os instantes antes/depois de contato nos intervalos com grande rotação, deformação, mudança de oclusão ou histórico de falha. Capture também limites de beat e poses extremas. Inspecione junta ampliada e em escala de uso no desktop e no celular; reproduza movimento contínuo. Amostragem não prova ausência de defeitos em todos os tempos. Em sequência de imagens, revise cada frame aceito e pares adjacentes, inclusive o loop.

As **duas avaliações visuais independentes** recebem mestre e SVG renderizado, crops e poses reais, sem código, notas da outra avaliação ou texto persuasivo. Cada uma pontua categorias do gate e identifica falhas locais. Se não viu a imagem, marque `não avaliado`; não estime nota. Registre arte mestre, SVG, cena, versões/hashes, método, canvas, alpha, notas, matriz por parte e defeitos ainda abertos. **Qualquer mudança visual na arte invalida ambas as notas globais da versão anterior**; refaça-as mesmo quando só uma parte mudou. Refaça crops e capturas das partes afetadas, além de qualquer evidência dinâmica alterada por rig ou timing, antes de dizer “pronto”.

| Falha encontrada | Volte para | Não tente resolver apenas com |
| --- | --- | --- |
| Silhueta/proporção geral errada | Massas principais e landmarks | Brilho, textura, microdetalhe. |
| Olho, mão, pé ou contato errado | Anatomia e oclusão da parte **e da vizinha** | Deslocar um elemento isolado sem verificar relação. |
| Volume plano ou faixa de cor rígida | Planos de luz/sombra ligados à forma e material | Mais um realce ou gradiente arbitrário. |
| Junta abre só em movimento | Âncoras, transformações, preenchimento e camada | Cap arredondado, blur, sombra ou stroke transparente. |
| Morph muda identidade/topologia | Poses-chave e decisão de ponte, midpoint único ou corte | Mais amostras do morph instável ou crossfade. |

## Prompts de correção e crítica

**Cirurgia vetorial.** “Use a imagem mestre e o PNG renderizado do SVG [versões/links] na mesma pose/canvas. Corrija [parte/contato] e as camadas vizinhas necessárias. Primeiro identifique a diferença observável em 1× e zoom, com coordenadas e relação anatômica; classifique borda externa, vinco interno e oclusão. Decida se a topologia e o volume estão corretos: nesse caso, ajuste paths/gradientes localmente; se estiverem errados, redesenhe as massas e a junção, preservando apenas pivôs ainda válidos. Renderize o vetor resultante e entregue comparação lado a lado, overlay, crop da parte, teste no tamanho de uso e matriz PASS/FAIL atualizada. Se a correção abrir outra junta ou reduzir fidelidade, rejeite-a e retorne à construção do volume. Não use blur, PNG embutida ou traço transparente para ocultar defeitos.”

**Crítica adversarial.** “Receba apenas a arte mestre, o SVG renderizado e poses reais de [versão], sem código nem notas anteriores. Aponte primeiro falhas bloqueantes por parte, lado, pose/tempo e escala; compare olhos, boca/mandíbula, origem e separação dos dedos, quadril→pé, material, oclusão e contorno em movimento quando presentes. Preencha PASS/FAIL/N/A com evidência e depois pontue as cinco categorias do gate. Não infira semelhança total do IoU nem atribua nota a parte que não viu. Se faltar evidência ou houver falha crítica, declare EM REVISÃO e liste a próxima correção estrutural mais útil; não elogie genericamente.”

## Fontes de método

Use fontes para estudar a disciplina, sem reproduzir personagens ou estilos: [Disney Visual Development](https://www.disneyanimation.com/process/visual-development/) e [Modeling](https://www.disneyanimation.com/process/modeling/) relacionam design, presença e construção; [Rive Bones](https://rive.app/docs/editor/manipulating-shapes/bones) e [Meshes](https://rive.app/docs/editor/manipulating-shapes/meshes) mostram articulação e deformação; [MDN clipPathUnits](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/clipPathUnits) e [fill-rule](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule) explicam coordenadas e preenchimento. O gate numérico e a matriz acima são critérios **desta skill**, não normas dessas fontes.
