# 10 · O que a wiki do Kanka tem para o site

Fonte: https://app.kanka.io/w/plano-logos (campanha "Plano Logos"; conteúdo visível sem login, verificado em 28/11/2026). Parte do conteúdo pode ser restrita por patente; aqui está só o que um visitante vê.

## Inventário

| Categoria | Qtde | Serve para o site? |
|---|---|---|
| **Locais** | 47 (29 no topo, o resto dentro de outros) | **Sim, é o principal.** Texto de cada lugar + seções (bairros, economia, história) + imagem |
| **Mapa** "Galtherdara" | 1, com **21 pinos** em 3 grupos (Cidades, Domínio de Dragão Primordial, Organização) | **Sim:** posições dos lugares que ainda não estão no site |
| Organizações | 14 (Libraris, Ignos, Domus, Axioma, Mirabella, Paradis, Solenne, Instituto Colt, Tribo Ba'Shin, Companhia Marítima de Sea Town, Conselho de Artesãos de Bradória…) | Sim: aba "Mundo" ou marcador onde têm sede |
| Eventos | 5 (A Guerra dos Dragões Primordiais e a Ascensão Divina, Guerra da Trindade, O Retorno de Memorium, O Lamento dos Mortos, Expedição à Umbreterna) | Sim: linha do tempo |
| Notas | 3 (Divindades, Especializações, Faerzress) | Sim: aba "Mundo" |
| Raças | 45 | Talvez: referência, não vai no mapa |
| Personagens | 95 (80 NPC, 13 PJ, 2 aposentados) | PJs: lista pronta para "Quem é você?" com retrato; NPCs: ligados aos lugares |
| Objetos | 30 | Não agora |
| Etiquetas | Canônico, Legado, Particular | Sim: filtrar só o **Canônico** |

PJs visíveis: Cura D'Angelo, Heskan, Mael, Khamri Stemaguarda, Mistral, Navarra Silvergraft, Ubel Abuto, Eris Abuto, Ori, Dr. Flickvanstalpersburg, A Ólga 53, Orion Slowdown, Silas Stratos; aposentados: Rendrick, Throdenkaar. (A Akari não aparece entre os públicos.)

## Os lugares, comparados com o mapa do site

**Já estão no site** (15, agora com texto na wiki): Amox, Valantir, Bradória, Dolrath, Bloompog, Pebak Tor'Dasak (no site: "Pebaktor'dasak"), Feltônia, Pedânia, Artênia, Lassi-Norien, Wyverstone, Desfiladeiro Gélido, Floresta sem Retorno, Pântano dos Enforcados, Cidade dos Ossos / Deserto Cidade dos Ossos.

Correções que a wiki traz:
- Grafia oficial: **Pebak Tor'Dasak**.
- Tipos: Feltônia, Pedânia e Artênia são **Reinos**; os cinco domínios (Wyverstone, Desfiladeiro, Floresta, Pântano, Deserto) são **Domínios de Dragão Primordial** (IronBlaze, BlizzardBane, VenoMeister, RottenJaw…).
- Hafalarenn é o **continente élfico**, e Lassi-Norien fica nele.

**Novos, com posição no mapa do Kanka** (convertida para o PNG do site, erro ~75 px; ver `dados/kanka_pinos.json`): Porto Murado, Arthrolatt ("a cidade das aranhas"), Costa Funda, Lake City, Instituto Colt, Fábrica do Papai Noel.

**Novos, sem posição** (precisam ser marcados à mão ou ficam fora do mapa):
- Dentro de cidades: Boteco do Mag e Malorne, Doce Deleite, Antiquário do Josivaldo (Amox); Banco Central de Valantir; Templo da Cidade, Mansão do Gorvan (Lake City); Arena de Ossos; Drakthar'nal (Wyverstone); Skjoldheim (Desfiladeiro).
- Soltos: Aramantis (cidade flutuante), Undermine (perto de Valantir), Memorium (ilha-estado), Templo de Torm, 6 Colônias Golias + Ducado da Tempestade, O Bico da Gaivota (mar nordeste), Umbreterna.
- Fora do mapa da superfície: **Underdark** (Menzoberranzan, Lago Negro, Bosque Nunca-Claro, Sloobludop), **Ilha dos Replicantes de Tinta**, **Pendor das Sombras** (plano). Dariam um segundo mapa ou uma camada.

Sem texto na wiki ainda: Fábrica do Papai Noel, Ducado da Tempestade, Umbreterna, Instituto Colt.

## O mapa do Kanka × o PNG do site

O mapa do Kanka usa outra versão da imagem (5 815 × 3 986). As posições dos 21 pinos foram convertidas para o PNG do site (8 192 × 6 144) por ajuste com os 15 lugares em comum. Fórmula em `dados/kanka_pinos.json`.

## Como trazer o conteúdo para o site

O Kanka monta as páginas com JavaScript e não libera acesso de outros sites. Por isso, o texto precisa ser **copiado uma vez** e guardado junto do site (com link de volta para a wiki em cada lugar). Opções:

1. **Copiar para o Supabase** (tabela `galtherdara_kanka`), e o site lê de lá. Rápido e fácil de atualizar depois. Precisa da aprovação do Fabrício.
2. **Gerar `dados/kanka.json` no repositório.** Tudo fica no GitHub; atualizar exige repetir a cópia.
3. **API oficial do Kanka**, com um token pessoal de alguém da guilda. É o caminho para um site definitivo, com sincronização automática.

Tamanho aproximado do texto público: locais ~100 KB, raças ~46 KB, organizações ~15 KB, notas ~11 KB, eventos ~7 KB.
