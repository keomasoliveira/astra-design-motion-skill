# Régua de acabamento visual

Use para dirigir e revisar páginas do fluxo GPT. “AAA” significa uma meta de autoria e execução pronta para publicação, não uma nota obtida por contagem de efeitos. A estética pode ser sóbria ou exuberante. Compare o resultado ao briefing e a referências do mesmo contexto, sem copiar um site nem impor este exemplo como estilo.

## Antes de construir

- **Conceito específico.** Escreva uma frase que conecte público, promessa e forma visual. Se a frase e o hero servirem para outra marca apenas trocando o nome, procure outra ideia. Quando houver acesso, examine duas ou três referências adequadas e anote o princípio transferível (hierarquia, material, ritmo, transição), não cores ou formas para replicar.
- **Sistema visual.** Escolha papéis para tipos, escala, espaço, cor, composição e mídia. Identifique uma assinatura que reapareça com função nas passagens e no conteúdo, sem transformar tudo na mesma seção. Tipografia padrão pode funcionar quando escolhida e composta deliberadamente; uma combinação arbitrária de fontes e um fundo escuro com acento neon não constituem direção.
- **Matéria visual.** Use os assets aprovados. Se faltarem, crie uma imagem, ilustração, diagrama ou cena original que represente o assunto com honestidade. Não fabrique capturas de um case real ou esconda uma ausência de conteúdo sob um objeto abstrato. Indique o que ainda depende do usuário para publicação.
- **Cena 3D.** Faça um pequeno mapa `forma/material/luz → conceito` e `ação/etapa → mudança visível → informação comunicada`. Revise enquadramento e silhueta no tamanho real do hero e no celular. A cena deve continuar compreensível como imagem alternativa e texto quando WebGL não estiver disponível.
- **Motion.** Planeje um ritmo de entrada, passagem e interação com gatilho e função claros. Um fade repetido em toda seção ou um loop contínuo em todos os ícones é um efeito, não uma coreografia. Inclua os estados de saída, interrupção e movimento reduzido.

## Revisão visual no navegador

Inspecione a primeira dobra, uma seção central, a cena 3D em interação e o fechamento em desktop e celular. Veja capturas estáticas e a experiência em movimento. Em cada revisão, registre os três problemas mais relevantes e corrija os que afetem entendimento ou acabamento antes de entregar.

| Eixo | Pergunta de revisão | Sinal de que precisa de outra passada |
| --- | --- | --- |
| Direção | A primeira dobra identifica assunto, promessa e caráter próprio? | O mesmo hero caberia em qualquer empresa do setor. |
| Composição e tipo | Existe hierarquia, tensão e respiro intencional em todos os tamanhos? | Títulos dominam sem relação com conteúdo, alinhamentos mudam sem motivo ou o celular vira uma pilha vazia. |
| Mídia e 3D | Imagem, cena e interação ajudam a entender algo específico? | Apenas órbitas/cubos genéricos, cena pequena e isolada, ou visual central oculto no celular. |
| Narrativa | Cada seção traz informação e um momento visual novo? | Trocar a ordem das seções não altera a história. |
| Movimento | Entrada, navegação e microinterações têm causa, resposta e ritmo comum? | Tudo usa o mesmo reveal, hover sem feedback, menus abruptos ou movimento que compete com a leitura. |
| Acabamento | Estados, contraste, enquadramento e performance resistem ao uso real? | Canvas em branco, texto sobreposto, mídia cortada, controles quebrados ou engasgos persistentes. |

Corrija a causa visual, não só um valor de CSS. Se o conceito não funcionar, repense a composição ou a mídia. Não declare “AAA” por autoavaliação: uma revisão visual comparativa independente ainda é necessária para sustentar essa afirmação.

## Base técnica para a revisão

- Verifique pixels do canvas e interação real em desktop e celular; dependência instalada ou canvas presente não prova a cena. O [guia de frontend da OpenAI](https://developers.openai.com/api/docs/guides/frontend-prompt) também enfatiza inspeção visual e mídia pertinente; suas escolhas de layout específicas são exemplos, não regras universais desta skill.
- Ajuste a resolução do desenho 3D ao tamanho e à densidade de tela; o [manual do Three.js](https://threejs.org/manual/pages/responsive.html) explica o custo de renderizar em DPR alto.
- Mantenha o conteúdo acessível quando a animação é reduzida ou interrompida. A [W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) documenta controles para movimento automático prolongado; [web.dev](https://web.dev/articles/animations-guide) descreve propriedades de animação mais eficientes.
