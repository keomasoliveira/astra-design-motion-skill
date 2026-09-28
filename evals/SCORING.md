# Avaliação de comportamento para GPT/Codex

Use os casos de `cases.jsonl` para comparar **o mesmo modelo GPT**, briefing, repositório inicial, ferramentas e limite de tempo/tokens em duas execuções isoladas: uma com esta skill disponível e outra sem ela. Nos casos que citam assets ou projeto existente, forneça a mesma fixture nas duas execuções. Alterne a ordem das condições entre casos. Entregue ao modelo apenas `prompt`; `should_trigger` e `focus` são para quem avalia. Registre versão da skill e do modelo, tempo, tokens/custo, arquivos alterados e artefatos. Estes casos ainda não foram executados.

## Julgamento

1. **Acionamento (todos os casos):** compare `should_trigger` com o uso real da skill. Nos casos negativos, cumprir a tarefa sem invocar esta skill é o resultado esperado. Não exija que o modelo recuse a tarefa.
2. **Resultado visual (casos positivos):** avalie capturas **desktop e mobile** com o briefing em mãos: identidade, hierarquia, conteúdo, legibilidade, composição e acabamento. Compare os dois resultados às cegas, quando possível. Não premie uma estética específica da skill se ela conflitar com a marca.
3. **Funcionamento (casos positivos):** abra a página e execute o [contrato de UX](../references/ux-contract.md) para cada classe de controle presente, inclusive menu, sidebar e ícones. Nos casos que pedem motion ou 3D, verifique o efeito no navegador e sua utilidade; uma biblioteca instalada, um canvas vazio ou uma imagem 2D não comprova 3D. Quando houver personagem novo, julgue separadamente conceito/silhueta, arte mestre raster, reconstrução SVG editável quando usada, ficha/consistência e atuação estática antes da fluidez; aplique o [processo de personagem](../references/character-motion.md) e registre quadros/poses observados e perdas. Um `<image>` de PNG dentro de SVG não comprova vetorização; `requestAnimationFrame` sozinho não comprova a taxa do personagem. Teste teclado, toque, viewport móvel, movimento reduzido e fallback. Build e typecheck são evidências separadas.
4. **Fidelidade:** confira preservação da stack, marca e conteúdo existentes; identifique fatos inventados, escopo extrapolado ou requisitos ignorados. Requisitos explícitos do briefing têm prioridade sobre a receita da skill.
5. **Eficiência:** registre tempo e tokens/custo até uma entrega utilizável, incluindo correções. Compare a qualidade por custo, sem assumir que mais agentes ou mais arquivos significam melhor resultado.

Registre **acionamento correto/incorreto**. Para resultado visual, funcionamento e fidelidade aplicáveis, dê **0–4**: 0 = ausente/quebrado; 1 = grande falha; 2 = utilizável com lacunas importantes; 3 = atende ao briefing; 4 = atende com execução especialmente boa. Anote tempo e tokens/custo como valores medidos, sem nota subjetiva. Registre evidência curta (captura, URL local, comando ou observação) para cada nota. Nos casos negativos, pontue apenas fidelidade ao escopo e acionamento; marque os eixos de página como `N/A`.

Relate por caso as notas das duas condições e a diferença, sem somar eixos `N/A`. Use a mediana por eixo e liste falhas graves separadamente. Marcas de DOM, número fixo de seções, scroll virtual, preloader ou cor de destaque não são métricas universais de qualidade para estes briefings.

## Régua experimental para “AAA”

“AAA” aqui é um alvo de acabamento criativo, separado dos níveis de conformidade WCAG. Ele não pode ser atribuído por um script ou por autoavaliação. Para um teste mais forte, congele as versões da skill e use briefings inéditos, com assets reais, modelos, ferramentas, repositório inicial e orçamento equivalentes. Avalie capturas de hero, seção-chave e fechamento em desktop/mobile e um vídeo curto dos estados interativos. Oculte dos avaliadores a condição usada e alterne a ordem das versões.

Três avaliadores independentes pontuam cada eixo de 0 a 4 em incrementos de 0,5: 0 = quebrado, 1 = genérico ou falha grande, 2 = utilizável com lacunas, 3 = polido e fiel ao briefing, 4 = distintivo e pronto para publicar. A [régua visual](../references/quality-bar.md) fornece sinais observáveis, sem prescrever uma estética.

| Eixo | Peso |
| --- | ---: |
| Direção visual e aderência à marca | 25% |
| Tipografia, composição e ritmo | 20% |
| Autoria e integração de assets/3D | 20% |
| Motion e microinterações | 15% |
| Narrativa e credibilidade do conteúdo | 10% |
| Acabamento responsivo | 10% |

Defina como **AAA operacional no experimento** apenas uma saída que passe todos os itens bloqueantes do contrato de UX, obtenha média ponderada das medianas dos avaliadores ≥ 3,6/4, nenhum eixo < 3/4, os quatro primeiros eixos ≥ 3,5/4, e seja considerada publicável sem retrabalho de direção por pelo menos dois avaliadores. Esses limiares são uma hipótese de pesquisa, não um padrão externo nem garantia de que toda execução da skill alcançará esse nível.

Nos casos com personagem criado do zero, registre ainda notas **separadas** de 0–4 para identidade e originalidade, legibilidade em escala, consistência de ficha e poses, atuação ligada ao produto e execução técnica. Não deixe uma animação suave compensar um desenho genérico: para sustentar acabamento excepcional, as medianas de identidade, leitura e atuação estática devem alcançar pelo menos 3,5/4, sem falha bloqueante, e ainda passar por revisão independente. Compare a qualidade visual às cegas com referências de mais de uma linguagem, sem pontuar semelhança com uma marca. O limiar é uma hipótese de avaliação deste projeto, não um padrão da indústria.

Para qualquer SVG de personagem criado ou refeito, verifique **antes de aprovar o vetor ou seu motion** o gate obrigatório de fidelidade do [processo de personagem](../references/character-motion.md): arte mestre aprovada, PNG transparente renderizada do SVG, montagem lado a lado e sobreposta, máscaras no mesmo canvas com IoU ≥ 0,95, pontos/partes sem erro anatômico e duas avaliações visuais ≥95/100. Inspecione cada olho (formato, íris/pupila, pálpebra e expressão), corpo, boca, cada braço/mão e cada perna/pé **presentes** como bloqueios individuais; uma média alta não compensa um olhar diferente ou membro mal conectado. Anote comando, limiar alpha, score e evidência, sem aceitar uma porcentagem autodeclarada pelo modelo. Falha ou ausência de evidência impede aprovar a ilustração vetorial como pronta, mesmo que a página e os controles funcionem.

Compare a versão nova com a anterior e com a condição sem skill em mais de um briefing e com repetições independentes. Registre preferência pareada, taxa de falhas bloqueantes, dispersão, tempo e custo. Uma execução isolada não prova ganho causal da skill nem nível AAA.
