# Astra Design Motion Skill

Skill para GPT/Codex criar landing pages, sites pessoais e portfólios de página única com direção de arte autoral, animações úteis, 3D ligado ao conteúdo e UX verificável.

## Origem e crédito

O fluxo usa o **motor metodológico** do [Fable Design, de ustoppble](https://github.com/ustoppble/fable-design), como ponto de partida para pensar direção, execução e revisão. Esta é uma implementação independente para GPT/Codex: não redistribui a doutrina, os templates, o verificador nem as evidências do projeto original. O crédito indica essa origem, sem sugerir afiliação ou uma licença para o material de terceiros.

## Como funciona

O [SKILL.md](SKILL.md) traz o fluxo curto: entender o material real, definir uma direção específica, integrar 3D ao conteúdo, planejar motion e estados de interface, compor o celular e revisar a página no navegador. Leia os recursos detalhados quando a tarefa pedir:

| Recurso | Uso |
| --- | --- |
| [Régua visual](references/quality-bar.md) | Direção de arte, composição e revisão de acabamento |
| [Exemplos de motion](references/motion-examples.md) | Padrões estudados com gatilho, mecanismo e limites de adaptação |
| [Sistema de motion](references/motion-system.md) | Menus, ícones, seções, 3D, interrupção e movimento reduzido |
| [Personagem animado](references/character-motion.md) | Imagem raster mestre, reconstrução vetorial com comparação obrigatória de silhueta e partes, duas avaliações visuais ≥95/100, ficha, gestos narrativos, rig/quadros/vídeo, continuidade e medição no navegador |
| [Ofício do personagem vetorial](references/character-vector-craft.md) | Desenhar forma, volume, olhos, mãos e pés; manter contornos e juntas coerentes em movimento; matriz de falhas, evidência por parte e prompts de correção/crítica |
| [Render para comparação](scripts/render_svg_for_comparison.cjs) | Exporta o SVG editável em PNG RGBA no canvas da imagem mestre; usa `sharp` se instalado ou Chrome headless com Node 22+ |
| [Medição de silhueta](scripts/measure_silhouette.py) | Compara máscaras alpha no mesmo canvas e gera evidência visual; `--region` adiciona recortes diagnósticos. Seu IoU ≥95% é apenas uma etapa do gate, não a porcentagem de semelhança total |
| [Contrato de UX](references/ux-contract.md) | Estados e testes observáveis para controles e navegação |
| [Motion kit](assets/motion-kit/) | Menu executável com três diagramas SVG, loops independentes do hover e controle de pausa |
| [Exemplo do sapinho](assets/frog-example/) | Personagem original criado de imagem raster para SVG editável, com rig, microhistória, objeto sincronizado, controles e ficha de criação |
| [Avaliação](evals/SCORING.md) | Casos e critérios para comparar o uso da skill com e sem ela |

O motion kit funciona com HTML, CSS e JavaScript sem build. Consulte seu [README](assets/motion-kit/README.md) para abrir e testar.
O exemplo animado do sapinho usa apenas arquivos estáticos e pode ser aberto em [assets/frog-example/index.html](assets/frog-example/index.html). Compare a [imagem mestre](assets/frog-example/concept-master.png), o [SVG reconstruído](assets/frog-example/premium-frog.svg) e a [ficha](assets/frog-example/character-sheet.svg) para inspecionar o processo antes da animação. O [README do exemplo](assets/frog-example/README.md) registra o gate ainda pendente; a existência do SVG e da cena demonstra um protótipo de rig, não aprovação visual do personagem.

## Instalação

Clone no diretório de skills do Codex:

```bash
git clone https://github.com/keomasoliveira/astra-design-motion-skill "${CODEX_HOME:-$HOME/.codex}/skills/astra-design-motion-skill"
```

Depois peça, por exemplo:

> Use $astra-design-motion-skill para criar uma página de apresentação para meu estúdio. Tenho texto e imagens aprovados; quero motion ligado à narrativa e uma cena 3D que explique o produto. Revise desktop, celular e interações no navegador.

## Escopo da qualidade

“AAA” neste projeto é uma meta de acabamento criativo, não uma certificação automática nem conformidade WCAG nível AAA. A skill exige revisão visual e testes de interação, mas a qualidade de cada página deve ser julgada no briefing e no resultado real. Não invente provas comerciais ou conteúdo que o usuário não forneceu.
