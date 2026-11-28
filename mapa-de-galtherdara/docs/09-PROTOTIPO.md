# 09 · Protótipo (28/11/2026)

Objetivo: **mostrar à guilda Plano Logos o que um site centralizado pode ser**, não ser o site final. Quem tocar o projeto de verdade pode partir daqui ou recomeçar.

## O que faz

- Mapa de 8 192 × 6 144 px com zoom (tiles WebP, zoom 0–5, mais 2 níveis ampliados), moldura original mantida.
- Tela de entrada e voo de câmera até o centro do continente.
- 18 lugares com losango dourado, lista lateral, busca e painel com descrição. As descrições dizem **só o que se vê no mapa**; a história de cada lugar fica para a guilda escrever.
- **Quem é você?**: nome do personagem e cor, guardados no navegador.
- **＋ Nota**: anotação presa num ponto do mapa (título e texto).
- **✎ Trilha**: caminho ponto a ponto, com nome.
- Tudo o que se anota aparece **na hora para todos** (Supabase Realtime). Bolinha no canto de baixo: verde = conectado.
- Aba **Personagens**: mostra/esconde cada um e leva até o que ele marcou.
- Só quem criou (o mesmo navegador) pode editar ou apagar.
- Funciona no celular (painel recolhível, painel do lugar embaixo).

## Como foi feito

| Parte | Arquivo |
|---|---|
| Página | `index.html` |
| Estilo | `css/estilo.css` |
| Código | `js/app.js` |
| Lugares | `dados/locais.json` (posições em pixels do PNG, tiradas dos nomes pintados) |
| Tiles | `tiles/{z}/{y}/{x}.webp`, gerados com Python (Pillow) a partir do PNG |
| Banco | Supabase `oneshot-cartas`, tabelas `galtherdara_notas` e `galtherdara_trilhas`; ver `tools/supabase/galtherdara_001.sql` |
| Bibliotecas | `vendor/` (Leaflet 1.9.4, supabase-js 2) |

## Limites conhecidos (aceitáveis para um protótipo)

- Sem contas: qualquer pessoa com o link escreve com o nome que quiser. Trocar de navegador perde o direito de apagar o que criou.
- Os nomes pintados no mapa continuam lá (ver 08-MAPA-ATUAL).
- Zoom em passos inteiros (evita linhas finas entre os tiles em alguns navegadores).
- O banco é o mesmo do one-shot (projeto grátis do Fabrício). Um site de verdade da guilda deveria ter o próprio.
- Para limpar as anotações de teste: `delete from galtherdara_notas; delete from galtherdara_trilhas;` no Supabase.

## Rodada 2 (28/11/2026, pedidos do Fabrício)

- **Fundo borrado**: a imagem inteira em baixa resolução fica por baixo dos tiles; ao dar zoom, em vez de quadrados pretos aparece o mapa desfocado, que vai ganhando nitidez (`tiles/base.webp`).
- **Painel lateral começa recolhido.**
- **Camadas** (botão ◫ no topo): liga/desliga lugares, minhas anotações, anotações dos outros, minhas trilhas, trilhas dos outros. Fica lembrado no navegador.
- **Imagens nas anotações**: até 4 por nota, reduzidas no navegador (1600 px, WebP) e enviadas ao armazenamento do Supabase. Toque na imagem para ampliar.
- **Diário de cada personagem**: toque no nome (aba Personagens ou no balão da nota) para ver a linha do tempo de anotações e trilhas; cada item leva ao ponto no mapa.
- **Trilha à mão livre**: ferramentas Desenhar (arrastar), Pontos (tocar) e Mover (arrastar o mapa). A linha desenhada é simplificada; as bolinhas podem ser arrastadas para ajustar, e duplo clique apaga uma. Trilhas próprias podem ser **editadas** depois.
- **Três personagens de exemplo** (fictícios): Liora Vennt (barda, Amox → Valantir → Porto Murado → Costa Funda), Brana Forjafunda (ferreira de Bradória até Dolrath) e Tico Pé-Ligeiro (ladino de Undermine a Bloompog). Script em `tools/supabase/galtherdara_exemplos.sql`.
