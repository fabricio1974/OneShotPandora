# Mapa de Galtherdara

Mapa interativo de **Galtherdara**, o mundo da **Akari Bellacord Sasaya** (guilda Plano Logos, no Discord), no estilo do mapa de Runeterra: uma pintura grande com zoom profundo, regiões clicáveis, locais com histórias e camadas que se ligam e desligam.

**Projeto à parte.** Não tem relação com o one-shot "O Cordeiro e o Lobo" nem com a campanha da Pandora; só divide o mesmo repositório e o mesmo GitHub Pages. Não usa nem altera os arquivos dos outros sites.

Endereço (quando publicado): https://fabricio1974.github.io/OneShotPandora/mapa-de-galtherdara/

> A pasta usa hífens (`mapa-de-galtherdara`) porque espaços viram `%20` nos endereços e quebram links. O nome que aparece no site é "Mapa de Galtherdara".

## Estado

**Protótipo no ar** (28/11/2026) para mostrar a ideia à guilda: mapa com zoom, 18 lugares marcados, anotações e trilhas de cada personagem, compartilhadas ao vivo. Ver [docs/09-PROTOTIPO.md](docs/09-PROTOTIPO.md).

## Documentos

| Arquivo | O que tem |
|---|---|
| [docs/01-VISAO.md](docs/01-VISAO.md) | O que o site faz, para quem, e o que fica fora |
| [docs/02-ARQUITETURA.md](docs/02-ARQUITETURA.md) | Tecnologia escolhida e por quê, pastas, fluxo dos dados |
| [docs/03-ARTE-IA.md](docs/03-ARTE-IA.md) | Como produzir a arte com IA: resolução, fatiamento, estilo, prompts |
| [docs/04-DADOS.md](docs/04-DADOS.md) | Formato dos arquivos de locais, regiões, camadas e textos |
| [docs/05-SUPABASE.md](docs/05-SUPABASE.md) | Parte ao vivo: revelar, posição do grupo, notas, segredos |
| [docs/06-ROTEIRO.md](docs/06-ROTEIRO.md) | Etapas, da primeira versão à versão completa |
| [docs/07-PENDENCIAS.md](docs/07-PENDENCIAS.md) | O que o Fabrício precisa decidir ou entregar |
| [docs/08-MAPA-ATUAL.md](docs/08-MAPA-ATUAL.md) | Análise do PNG atual: tamanho, qualidade, o que corrigir |
| [docs/09-PROTOTIPO.md](docs/09-PROTOTIPO.md) | O que o protótipo faz, como foi feito e seus limites |

## Pastas

```
mapa-de-galtherdara/
├── index.html            (futuro) o mapa para os jogadores
├── mestre.html           (futuro) o mesmo mapa com os controles do Mestre
├── editor.html           (futuro) clicar no mapa para criar e posicionar locais
├── css/  js/             (futuro) estilo e código
├── vendor/               bibliotecas locais (Leaflet), sem depender de CDN
├── dados/                locais, regiões, camadas e textos em JSON (ver 04-DADOS)
├── tiles/                o mapa fatiado em pedaços por nível de zoom (gerado, não editar)
├── arte/                 artes que entram no site: insets, ícones, ilustrações dos locais
├── tools/                scripts: fatiar o mapa, conferir os dados
└── docs/                 esta documentação
```

O **PNG original em alta** não fica no repositório (o GitHub recusa arquivos acima de 100 MB). Ele fica no Drive; o repositório guarda só os tiles gerados e uma prévia reduzida.
