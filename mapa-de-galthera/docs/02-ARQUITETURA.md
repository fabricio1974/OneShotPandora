# 02 · Arquitetura

## Decisões

| Tema | Escolha | Por quê | Alternativas descartadas |
|---|---|---|---|
| Motor do mapa | **Leaflet 1.9** com `L.CRS.Simple` | Leve (40 KB), trata a imagem como mapa com coordenadas em pixels, ótimo no celular (pinça, arrasto), muito documentado | OpenLayers (mais pesado e complexo); OpenSeadragon (ótimo zoom, fraco para marcadores e polígonos); Pixi/WebGL próprio (lindo, mas é construir um motor) |
| Imagem | **Tiles** de 256 px em **WebP** | Uma imagem de 16 mil px não carrega no celular; tiles carregam só o que está na tela | Imagem única (só serve até ~4000 px) |
| Fatiamento | **libvips** `dzsave --layout google` | Um comando, rápido, gera direto a pasta `{z}/{y}/{x}` | gdal2tiles (funciona, mais lento e verboso) |
| Código | HTML + CSS + JavaScript puro, sem build | Igual ao resto do repositório; abre direto no GitHub Pages; fácil de aprender e mexer | React/Vite (exige compilação e passo extra para publicar) |
| Dados fixos | **JSON** em `dados/` | Versionado no Git, editável à mão ou pelo editor | Planilha (difícil de versionar) |
| Dados ao vivo | **Supabase** (o mesmo projeto `oneshot-cartas`), tabelas próprias | Já existe e funciona; tempo real pronto | ntfy.sh (`ponte.js`): bom para comandos, não guarda estado |
| Hospedagem | **GitHub Pages** do OneShotPandora | Já é usado; grátis | Netlify, artifact do Claude |
| Bibliotecas | Copiadas em `vendor/` | Não quebra se um CDN cair na hora da sessão | CDN |

## Coordenadas

- O sistema é o do **PNG original**: `[y, x]` em pixels, origem no canto superior esquerdo (Leaflet usa `[lat, lng]` = `[y, x]`).
- Tudo em `dados/` usa essas coordenadas. Se o PNG for trocado por outro do **mesmo tamanho**, nada muda. Se mudar de tamanho, `tools/` terá um script que reescala as coordenadas.
- Níveis de zoom: com o lado maior de 16 384 px, os tiles vão do zoom 0 (o mundo inteiro em 256 px) ao 6 (pixel real). Acima disso, o Leaflet amplia sem novos tiles (`maxNativeZoom`), e os **insets** (ver 03-ARTE-IA) entram com detalhe extra.

## Camadas do desenho (de baixo para cima)

1. **Fundo**: cor do mar/pergaminho fora do mapa.
2. **Tiles** do mapa pintado.
3. **Insets**: pinturas detalhadas de cidades que aparecem só em zoom alto (`L.imageOverlay` com opacidade por zoom).
4. **Regiões**: polígonos invisíveis que acendem ao toque.
5. **Rotas**: linhas tracejadas (estradas, rotas marítimas, a viagem do grupo).
6. **Névoa**: máscara escura sobre o que não foi revelado (canvas).
7. **Marcadores** e **rótulos** (texto do próprio site, nunca pintado pela IA).
8. **Grupo**: marcador animado.
9. **Interface**: busca, camadas, painel lateral, bússola.

## Páginas

| Página | Para | Diferença |
|---|---|---|
| `index.html` | jogadores | só leitura; vê o que foi revelado |
| `mestre.html` | Mestre | mesma base + revelar, mover grupo, "seguir o Mestre", ver tudo |
| `editor.html` | preparação | clicar para criar local, desenhar região, arrastar marcador; exporta o JSON |
| `index.html?mesa` | tablet | tela cheia, sem interface, segue a câmera do Mestre |

As três páginas usam os mesmos módulos em `js/`:

```
js/
├── mapa.js        cria o Leaflet, tiles, insets, limites, zoom
├── dados.js       carrega dados/*.json e junta com o estado do Supabase
├── camadas.js     regiões, rotas, marcadores, rótulos por zoom
├── nevoa.js       máscara do desconhecido
├── painel.js      painel lateral, busca, voo de câmera
├── aovivo.js      Supabase: ler, assinar mudanças, enviar (Mestre)
└── editor.js      só no editor.html
```

## Fluxo

```
PNG mestre (Drive) ──libvips──> tiles/  ─┐
dados/*.json  (Git) ─────────────────────┼──> navegador ──> mapa
Supabase: revelados, grupo, notas ───────┘        ▲
              ▲                                   │ tempo real
        mestre.html envia ────────────────────────┘
```

## Integração com o resto do repositório

- Link no `combate.html` (aba Ajustes, ao lado do atalho do mapa atual).
- O `tela.html` pode abrir `mapa-de-galthera/?mesa` para o tablet.
- O `mapa/` atual (Estrada para Maré-Alta) continua como está. Se a estrada fizer parte de Galthera, vira uma **rota** e um **inset** dentro do novo mapa.

## Desempenho

- Alvo: abrir em menos de 3 s num celular com 4G; arrastar sem engasgar.
- WebP qualidade ~80: cerca de 15–35 KB por tile.
- Estimativa para 16 384 px: ~5 500 tiles, ~120–180 MB no total. O GitHub Pages aceita (limite do site: 1 GB). O navegador baixa só o que aparece.
- Se ficar pesado demais, o plano B é parar em 12 288 px ou usar tiles de 512 px.
