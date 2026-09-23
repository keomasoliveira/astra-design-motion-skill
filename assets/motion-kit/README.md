# Motion kit: menu e diagramas animados

Esta demonstração mostra a combinação que motivou a pesquisa: **o menu abre com uma transição curta; os diagramas SVG dos três cartões continuam se movendo de modo independente do hover**. O hover e o foco acrescentam feedback, enquanto o clique/toque navega. O desenho, a tipografia e os tempos são exemplos adaptáveis, não uma identidade a replicar.

## Rodar

```bash
cd assets/motion-kit
python3 -m http.server 4174 --bind 127.0.0.1
```

Abra `http://127.0.0.1:4174/`. O exemplo não exige build nem dependências JavaScript. As fontes têm fallback local se a rede estiver indisponível.

## Implementação

- `menu.js` mantém `aria-expanded`, `inert`, origem da abertura (`hover` ou `activation`), fechamento por Escape/clique fora e foco. Se o menu foi aberto por clique, a saída do ponteiro não o fecha. O destino de um card recebe foco após a navegação.
- `styles.css` faz o painel entrar e sair com opacidade/deslocamento; cada SVG tem partes próprias para loop e feedback. `data-in-view`, `data-page-visible` e `data-motion` controlam a execução. O botão **Pausar diagramas** interrompe os keyframes e informa seu estado por `aria-pressed`.
- `prefers-reduced-motion` remove deslocamentos/loops, preservando texto, navegação e estados.

## Verificação de interação

| Sequência | Esperado |
| --- | --- |
| Hover com mouse fino → painel → fora | Abre, permanece durante a travessia, fecha após tolerância curta |
| Clique/toque em Explorar → ponteiro sai | Permanece aberto até novo clique, Escape, clique fora ou escolha |
| Tab até Explorar → Enter/Espaço → Tab | Painel e links entram na ordem de foco |
| Escape com foco dentro do painel | Fecha e devolve foco ao acionador |
| Escolher um card | Fecha, navega e foca a seção correspondente |
| Pausar/retomar | `aria-pressed` e `animation-play-state` concordam |
| Aba oculta ou painel fora da janela | Loops pausam; retornam ao ficar visíveis |
| Preferência de movimento reduzido | Painel e conteúdo funcionam sem loops/deslocamento |

Os mecanismos e as fontes pesquisadas estão em [`references/motion-system.md`](../../references/motion-system.md) e [`references/motion-examples.md`](../../references/motion-examples.md).
