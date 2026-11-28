# 08 · Análise do mapa atual

Arquivo: `Galtherdara_revisado.png` (Downloads do Fabrício, 28/11/2026). Prévia reduzida em `arte/referencias/galtherdara_previa.jpg`.

| Item | Valor |
|---|---|
| Tamanho | **8 192 × 6 144 px** (4:3) |
| Formato | PNG RGBA, 90 MB (o canal alfa é todo opaco; pode virar RGB) |
| Nitidez a 100% | **boa**: árvores, castelos, rios e falésias definidos, sem borrão de upscale |
| Estilo | pintura de atlas com ícones (castelos, montanhas, florestas), mar escuro com costa turquesa brilhante |

## Veredito

**Serve para começar sem mexer.** 8 192 px está na faixa "bom" do 03-ARTE-IA: dá zoom 0 a 5 com tiles reais. Para chegar ao nível Runeterra, o plano é **insets nas cidades**, não ampliar o mapa inteiro: o mapa já tem detalhe de sobra para o nível de região, e o que falta é o "mergulho" nas cidades.

Ampliar 2× (para 16 384 px) é opcional e só vale depois, se no uso o zoom parecer raso.

## Problemas a resolver

1. **Nomes pintados na imagem** (Valantir, Amox, Feltônia, Pântano dos Enforcados etc.). Contrariam a regra do 03-ARTE-IA: não somem na névoa, não mudam de tamanho com o zoom e entregam lugares que deveriam ser segredo.
   - Não existe versão sem texto (confirmado em 28/11/2026). **Decisão:** apagar os nomes com edição por IA.
   - **Provisório:** a Fase 1 usa o mapa com os nomes, só para testar.

   **Plano de limpeza dos nomes**
   1. `tools/recortar_rotulos.py` (futuro) corta um quadrado de ~1 024 px em volta de cada nome, com a posição anotada.
   2. Cada recorte vai para a IA (Gemini "editar imagem") com o pedido: *"Remove only the text label. Fill the area with the same terrain that surrounds it, matching style, lighting and detail. Change nothing else."*
   3. `tools/colar_rotulos.py` (futuro) devolve cada recorte limpo no lugar, com borda suave, e gera o PNG limpo.
   4. Conferir lado a lado (antes/depois) e refazer o recorte que ficar estranho.

   Os nomes pintados também servem: a posição de cada um vira a coordenada do local no `locais.json`.
2. **Moldura, título e rosa dos ventos** pintados. Para o mapa interativo, a área útil é o **mar escuro dentro da moldura**: a moldura sai dos tiles (corte de algumas centenas de pixels em cada lado) e pode ser reaproveitada na interface. A rosa dos ventos e o título viram elementos do site.
3. **Nome do mundo:** **Galtherdara**, como na imagem (confirmado).

## Lugares visíveis no mapa (para o primeiro `locais.json`)

Desfiladeiro Gélido, Bradória, Dolrath, Bloompog, Amox, Valantir, Floresta sem Retorno, Cidade dos Ossos, Feltônia, Hafalarenn, Lassi-Norien, Pedânia, Artênia, Pântano dos Enforcados, Pebaktor'dasak, Wyverstone. Além disso: um vulcão a oeste de Bloompog, um redemoinho no mar a leste, auroras ao norte e a leste.
