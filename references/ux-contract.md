# Contrato de UX verificável

Use este contrato no fluxo GPT para que o acabamento cubra a interface inteira, inclusive menu, sidebar, ícones e estados menores. Em um painel com opções ilustradas, verifique separadamente o estado do acionador, a entrada e saída do painel, o movimento dos diagramas e o fechamento por `Escape`. O [motion kit](../assets/motion-kit/) demonstra esses estados em uma interface executável.

## Inventário de interações

Antes de implementar, agrupe os controles reais da página por componente e preencha uma linha para cada comportamento distinto. Não crie controles para preencher a tabela. Um link estático sem estado complexo pode ter uma linha simples.

| Componente | Intenção e destino | Padrão → hover/foco → ativação | Saída, erro ou retorno | Toque e teclado | Movimento reduzido |
| --- | --- | --- | --- | --- | --- |
| Ex.: menu de recursos | Explorar recursos | Fechado → indicador reage → painel abre com opções | `Escape`, clique fora ou escolha fecham; foco retorna quando cabível | Toque abre; Tab alcança os itens; Enter/Space ativa | A mesma informação aparece sem deslocamento animado |

Para cada animação de interface, anote **gatilho, mudança visível, duração/easing escolhido, função e estado final**. Um ícone de controle pode indicar abertura ou seleção; um diagrama pode ter loop independente do hover para explicar um processo. Nesse caso, registre quando o loop roda e pausa, e mantenha a informação legível no quadro parado. A linguagem de movimento deve pertencer à mesma direção da página, sem impedir uma ação rápida.

## Portão de aceite

Execute os testes no navegador e marque cada item como passou/falhou com evidência curta. Uma inspeção de HTML ou CSS não substitui acionar o componente. Falhas bloqueiam a entrega como experiência concluída.

1. **Destino real:** cada link e CTA leva ao destino correto; nenhuma âncora interna quebrada; nenhum botão visualmente ativo é inerte. Controles que alteram dados ou conteúdo apresentam um resultado observável.
2. **Estados coerentes:** menus, sidebars, abas e seletores têm entrada, estado ativo e saída; indicadores e conteúdo mostram a mesma seleção. Trocar de item não deixa um estado visual antigo.
3. **Mouse, teclado e toque:** todo comportamento em hover também pode ser alcançado por foco ou toque. A ordem de Tab é lógica, foco é visível, Enter/Space acionam controles apropriados e `Escape` fecha painéis temporários sem perder o contexto. Teste o retorno do foco quando a interação o exigir.
4. **Semântica:** use link para navegação e botão para ação. Ícones funcionais têm nome acessível; ícones decorativos não anunciam ação. Exponha estado aberto/selecionado por semântica adequada, como `aria-expanded` ou `aria-selected`, quando aplicável.
5. **Tamanho e layout:** alvos de ponteiro cumprem pelo menos o mínimo de 24 × 24 CSS px ou uma exceção válida de espaçamento da [WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum). Confirme ausência de overflow horizontal e de elementos cobertos em 320, 390, 768 e 1440 px, adaptando as larguras aos breakpoints reais do projeto.
6. **Motion controlado:** animações automáticas prolongadas têm pausa/parada quando necessário; `prefers-reduced-motion` mantém informação e ações sem efeitos intensos. Abrir/fechar um menu não bloqueia o foco ou o clique durante a transição.
7. **3D e falha:** interação 3D pedida funciona por mouse e toque, com alternativa de teclado quando ela controla informação essencial. Teste o fallback sem WebGL e a perda de contexto ou o tratamento de erro pertinente; não deixe um retângulo vazio. Pause renderização contínua fora de vista quando possível.
8. **Estabilidade:** nenhuma exceção de console, tela em branco ou mudança inesperada de layout ao acionar os estados; build e typecheck disponíveis passam.

O teste é determinístico quanto ao comportamento esperado e ao resultado observado. Ele não decide sozinho se a composição é bela; use também a [régua visual](quality-bar.md). Registre falhas e corrija antes de chamar o trabalho de finalizado.
