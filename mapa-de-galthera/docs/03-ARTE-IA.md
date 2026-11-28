# 03 · Arte com IA

A arte é a parte que mais pesa no resultado. A IA gera imagens de 1–2 mil pixels; um mapa com zoom profundo precisa de 8–16 mil. Por isso a arte é feita **em níveis**, não numa imagem só.

## A regra mais importante

**A IA nunca escreve texto no mapa.** Nada de nomes, legendas ou rosa dos ventos com letras. A IA erra letras, e o texto pintado não pode ser traduzido, buscado nem escondido pela névoa. Todos os nomes vêm do site, com fonte própria.

Inclua sempre no prompt: *"no text, no labels, no letters, no typography, no legend"*.

## Resolução: o PNG atual basta?

| Lado maior do PNG | O que dá para fazer |
|---|---|
| até 4 096 px | só protótipo; o zoom fica borrado cedo |
| 8 192 px | bom: continentes e cidades legíveis |
| **16 384 px** | **alvo**: zoom de Runeterra |
| acima de 20 000 px | desnecessário; pesa sem ganho visível |

Se o PNG for menor que o alvo, há dois caminhos (podem ser combinados):

1. **Ampliação com IA** (upscale) de 2× ou 4×: Upscayl (grátis, roda no PC), Real-ESRGAN, Magnific ou Krea (pagos, melhores em pintura). Amplia sem inventar muito.
2. **Passes de detalhe por região** (o que dá o efeito Runeterra): recortar um pedaço do mapa já ampliado, pedir à IA para **redesenhar só aquele pedaço com mais detalhe** (img2img / "edit image", força baixa, 25–40%), e devolver no lugar. Assim cada região ganha árvores, telhados e rios finos sem mudar a forma geral. `tools/` terá um script para cortar o mapa em blocos com sobreposição e depois juntar com bordas suaves.

## Os três níveis da arte

| Nível | O que é | Tamanho | Onde aparece |
|---|---|---|---|
| **1. Mapa-mundo** | a pintura inteira | 16 384 px (após upscale e passes) | sempre (tiles) |
| **2. Insets** | pintura detalhada de uma cidade ou lugar importante, encaixada no ponto exato | 2 048–4 096 px cada | só em zoom alto, aparecendo aos poucos |
| **3. Ilustrações** | cena do lugar visto de perto (rua, templo, porto) | 1 600 × 900 | no painel lateral ao abrir o local |

Os insets são o segredo do zoom: em vez de exigir que o mapa inteiro tenha detalhe de rua, só os lugares importantes têm. Para fazer um inset, recorte o mapa naquele ponto e peça à IA para **expandir em detalhe mantendo as formas**, para o encaixe bater.

Extras pequenos:

- **Ícones** de tipo de local (cidade, vila, ruína, masmorra, templo, porto): conjunto de 12–16, mesmo estilo, fundo transparente, 128 px.
- **Textura de névoa**: nuvem/pergaminho que cobre o desconhecido, 1 024 px, repetível (seamless).
- **Moldura e interface** (opcional): borda do painel, brasões de facção.

## Consistência de estilo

Uma "bíblia de estilo" curta, colada no começo de **todo** prompt:

```
[ESTILO GALTHERA] hand-painted fantasy world map, top-down view,
painterly digital illustration in the style of a AAA game atlas,
soft atmospheric lighting from the upper left, rich but muted palette
(deep teal seas, ochre and olive lands, snow-white peaks),
fine brush texture, no text, no labels, no letters, no legend, no border
```

Preencher depois da primeira imagem aprovada (ver 07-PENDENCIAS):

- paleta (3–5 cores com hexadecimal, tiradas da imagem aprovada);
- direção da luz (sempre a mesma, senão as montanhas "viram");
- 2–3 imagens de referência guardadas em `arte/referencias/` para enviar junto em cada pedido (Gemini, Midjourney `--sref` e outros aceitam imagem de estilo).

## Modelos de prompt

**Passe de detalhe (img2img sobre um bloco do mapa):**
```
[ESTILO GALTHERA] Repaint this exact section of the map with much finer detail.
Keep every coastline, river, mountain and road exactly where it is.
Add: individual trees in forests, small rivers, rocky texture on mountains,
fields near settlements. Do not add new cities. no text.
```

**Inset de cidade:**
```
[ESTILO GALTHERA] Detailed top-down painted view of the city of {NOME},
{DESCRIÇÃO CURTA: porto no estuário, muralha em anel, castelo no morro norte}.
Same viewpoint and lighting as the world map. Matches this crop exactly
in shape and position (attached). no text.
```

**Ilustração do painel:**
```
[ESTILO GALTHERA] Wide establishing shot of {NOME}, eye level, {HORA, CLIMA},
{3 DETALHES MARCANTES}. Cinematic, painterly, 16:9. no text.
```

## Nomes dos arquivos

```
arte/
├── referencias/          imagens de estilo aprovadas (não vão para o site)
├── insets/{id}.webp      ex.: insets/mare-alta.webp
├── ilustracoes/{id}.webp ex.: ilustracoes/mare-alta.webp
├── icones/{tipo}.png     ex.: icones/cidade.png
└── nevoa.webp
```

O `{id}` é o mesmo do local em `dados/locais.json`. Assim, o site acha a arte sozinho.

## Fluxo de produção

1. Fabrício entrega o PNG do mapa-mundo (Drive).
2. Eu meço o tamanho e digo quanto falta para o alvo.
3. Upscale → passes de detalhe nas regiões que importam primeiro (onde o grupo vai jogar).
4. Fatiar (`tools/gerar_tiles`) → publicar.
5. Insets e ilustrações entram **conforme o jogo precisa**, não todos de uma vez.
