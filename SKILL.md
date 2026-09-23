---
name: astra-design-motion-skill
description: Criar ou refinar landing pages, sites pessoais e portfólios de página única com direção de arte autoral, motion e 3D integrado.
---

# Astra Design Motion Skill

Crie uma página específica para o briefing, com composição visual forte e interações completas em desktop e celular. “AAA” é uma meta de acabamento criativo, não uma certificação automática nem conformidade WCAG nível AAA.

## Fluxo de trabalho

1. **Entenda o material disponível.** Leia o briefing e o projeto; inventarie marca, conteúdo aprovado, imagens, modelos, cases, rotas e restrições. Preserve a stack útil. Não invente métricas, clientes, depoimentos nem telas de projetos. Se faltar mídia real, identifique qualquer representação criada como conceitual.
2. **Defina uma direção própria.** Relacione público, promessa e forma visual em uma frase. Escolha tipografia, composição, cor, mídia e ritmo entre seções a partir dessa direção. Se a página servir a outra marca apenas trocando o nome, refine o conceito. Use a [régua visual](references/quality-bar.md) na construção e na revisão.
3. **Dê função ao 3D.** Relacione forma, material, luz, câmera e interação ao conteúdo. Faça a cena comunicar uma escolha, estado ou etapa quando houver motivo. Verifique os pixels renderizados no navegador e ofereça equivalente visual e textual se WebGL falhar. Respeite uma exclusão de 3D ou movimento no briefing.
4. **Desenhe o movimento da página inteira.** Planeje entrada, passagem entre seções e retorno de navegação, menus, ícones, cartões, controles, CTAs e cena 3D presentes. Não concentre tudo no hero. Consulte os [exemplos de motion](references/motion-examples.md) e as [receitas de implementação](references/motion-system.md) para definir gatilho, estado final, interrupção e movimento reduzido. Preencha o [contrato de UX](references/ux-contract.md) para cada classe de controle; nenhum elemento pode parecer clicável e ficar inerte.
5. **Componha o celular de propósito.** Reorganize hierarquia, tipografia, cena e controles para toque. Mantenha conteúdo e ação principal acessíveis sem hover. Ajuste resolução e ciclo de renderização 3D à tela e ao dispositivo.
6. **Revise o resultado real.** Inspecione hero, seção central e fechamento em desktop e celular. Acione menu, controles, links e CTAs em seus estados; teste teclado, foco, toque, movimento reduzido e fallback WebGL. Capture a página, corrija defeitos concretos de composição, legibilidade, ritmo ou comportamento e confira novamente. Rode build/typecheck disponíveis e verifique console e overflow antes de entregar.

Delegue partes independentes quando ajudar, integrando-as sob uma direção visual e um contrato de interação únicos. Não há número fixo de agentes, biblioteca, paleta ou anatomia de seções obrigatória.
