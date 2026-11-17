# Trilha do Cordeiro

Mesa de som do one-shot **O Cordeiro e o Lobo**: toca as músicas de cada personagem pelo YouTube, com transição suave entre elas.

- **Seleção:** escolha as músicas, ajuste início, volume e repetição, adicione ou remova músicas e personagens, e coloque imagens.
- **Triagem:** toca um trecho do meio de cada música, uma depois da outra, para decidir quais ficam (`F` fica, `S` sai).
- **Sessão:** só as músicas escolhidas, em botões grandes. Teclas: `1`–`9` tocam, espaço pausa, setas avançam ou voltam 10 s, `N` e `P` trocam de faixa, `B` baixa aos poucos, `Esc` silencia.

- **Mestre:** palco com a arte do personagem, roteiro da noite (`]` e `[` mudam de cena), gatilhos de momentos, volta, pétalas, rodada, abates e notas. Botão **Voz** (tecla `V`) abaixa a música enquanto você fala; `R` volta à música anterior; `T` repete; `-` e `+` ajustam o volume da faixa. **Abrir tela dos jogadores** abre uma janela só com a arte (para o projetor; duplo clique = tela cheia, sem nome nem título). **Folha do Mestre** abre uma página de consulta pronta para imprimir.

- **Mesa (aba Mestre):** cena especial da Akari e do Thorian, iniciativa e PV, estado do Tobias e da Rafaela, fim da noite (vitória ou derrota), oferta da anja, registro das voltas, jogadores e votação, falas, ritmo da noite, dados, intensidade da trilha, silêncio dramático, pausa da mesa, ambientes (mar, vento, chuva, fogueira, mercado) e teste de som, que troca sozinho para uma gravação reserva quando uma música falha. `Esc` também para o ambiente.

As imagens ficam na pasta `img/`, que precisa estar **ao lado do `index.html`**.

As escolhas ficam salvas no navegador. Para levar a outro aparelho, use "Baixar arquivo" e "Carregar arquivo" em *Ajustes e cópia das escolhas*.

Para usar sem internet de hospedagem, rode `abrir_trilha.bat` (precisa de Python) em vez de abrir o `index.html` direto.


## Inimigos e ações (aba Mestre)

Painel de referência dos Bellacord (Esaú, Jael, Ezequiel, Hildegarda, Élodie, Ozymandias e o Anjo) com as **fichas originais** do bestiário "O Cordeiro e o Lobo" (texto, bônus de ataque, alcances, dados e médias, CDs, recargas e custos copiados sem alteração; as cartas dos jogadores deixaram de ser a fonte). Cada inimigo tem:

- **Ficha** recolhível (CA, PV com os dados, deslocamento, atributos, salvaguardas, perícias, resistências e imunidades, sentidos, idiomas, ND). A ficha original não muda (Esaú 420, Jael 513, Ezequiel 375, Hildegarda 427, Élodie 462, Ozymandias 625, Anjo 500), mas o PV sugerido em "Pôr na iniciativa" e em "Iniciar luta" segue a **tabela da simulação v7** (regra: 2 cartas por jogador por volta): % da ficha por luta, volta (1 a 6) e número de jogadores (3 ou 4). Ex.: com 4 jogadores na volta 3, Esaú 546, Jael 539, Ezequiel 525, Hildegarda 448, Élodie 277, Ozymandias 375. Fica na caixa "PV dos inimigos" (botões 3 jogadores / 4 jogadores / Automático / Manual; o modo Manual usa uma porcentagem única editável) e fica salvo no navegador e, quando diferente de 100%, aparece marcado como ATIVO na caixa, nos cabeçalhos e na ficha de cada inimigo. O PV de cada linha pode ser editado à mão.
- **Ações por categoria, na ordem da ficha**: Ação, Ação bônus, Recarga, Reação (sempre visíveis), Passivas, Ações lendárias e Ações de ambiente (seções recolhidas com contagem). Filtros por tipo (inclui Lendária, Ambiente e Recarga), por efeito (tags) e **◆ sem salvaguarda** (selo "◆ sem salvaguarda" nas ações marcadas na ficha, as que anulam a Resistência Lendária dos jogadores).
- **Rolagens**: "Ataque +13" rola d20 + bônus e avisa 20 e 1 naturais; 🎲 rola cada expressão de dano (Aplicar, Metade e Curar continuam); as CDs das salvaguardas aparecem em destaque ("Des CD 21"). "Ataques Múltiplos" tem botões que rolam a sequência da ficha (3 × Facão, 2 × Lança + Golpe de Escudo etc.). Ações lendárias que dizem "faz um ataque de X" usam os números de X.
- **Usos**: recarga 5–6 e 6 (só com 6), Resistência Lendária 3/dia (Ozymandias 4, e 5 a partir da 4ª volta, com "Avareza: recuperar 1"), Quebra-Coroa 3/dia, Milagre 1/dia, magias do Ezequiel (3/dia e 1/dia) em bolinhas. **Ações lendárias**: bolinhas por inimigo (3; Élodie 2; Ozymandias 3 ou 4 na Fase 2); "Usar (−N)" gasta o custo e elas voltam no início do turno do inimigo ao tocar em ▶ (ou em "Zerar usos").
- **Regras do Mestre**: faixa "Regras da luta" no topo. **Não Hoje**: contador de dano na rodada em cada inimigo na iniciativa (150; 200 o Ozymandias), alimentado por Aplicar e pelos botões −PV, com aviso "o dano a mais é pela metade"; o campo "Aplicar dano com Não Hoje" já reduz a metade o que passa do limite; zera a cada rodada. **Ações de ambiente**: botão "Usar nesta rodada", uma por rodada (duas para o Ozymandias na Fase 2), a usada na rodada anterior fica bloqueada. **Ozymandias**: Fase 2 automática quando o PV na iniciativa cruza abaixo de 50% do PV usado (312 com a ficha cheia, 203 no Formato A; aviso; 2 ambientes, 4 lendárias; dá para ligar/desligar à mão), CA 23 enquanto Élodie estiver viva e perto. **Élodie**: aviso automático da Virada da Tela a 50% dos PV usados (uma vez), 2 lendárias, ações de ambiente "O Cavalete Gira" (Esboçar, Antecipar, Virar a Página), sem invocações; usa a vinheta dos criados como arte provisória. **Ezequiel**: Presságio da volta (3, 4, 4 e 5 dados de d20 conforme a volta atual) com botão que rola, marcar cada dado como usado, ↻ para Girar a Roda e +1d20 para Ler a Roda; "Já Vi Isso" lembrado da volta 2 em diante. **Ozymandias**: "Memória das Voltas" da volta 4 em diante (vantagem na iniciativa em "Iniciar luta"). **Hildegarda**: "O vos angeli" só aparece como disponível a partir da rodada 3. **Anjo**: conta como demônio, "descreva o que eles veem". **Raquel**: só luta com o Ozymandias.

Escolha o inimigo ou "Todos". "Zerar usos" (duplo toque), e "Zerar rodada" (zera 1/rodada, Não Hoje e passa o ambiente para "rodada anterior"). Tudo fica salvo no navegador, só na aba Mestre (a tela dos jogadores não muda) e nenhuma ficha é alterada. O estado salvo antigo das cartas é descartado ao abrir esta versão (os ids das ações mudaram).

Os dados do app foram gerados a partir do `.md` do bestiário; para conferir depois de mudar a ficha, extraia de novo e compare (o teste de conferência compara PV, CA, atributos, ◆, dados e médias, bônus de ataque, CDs, recargas, custos e usos).

### Luta no celular (iniciativa integrada)

- **Pôr na iniciativa**: no cabeçalho de cada inimigo, digite o PV (e a iniciativa, ou toque em 🎲 para um d20) e toque no botão. Depois aparece "Na iniciativa ✓" com os botões −10 −5 −1 +1 +5, que mexem na mesma linha de *Iniciativa e PV*. O vínculo é por marca na linha (não pelo nome): um jogador chamado "Élodie" não vira a inimiga.
- **Próximo turno** (também na faixa fixa no canto, visível na aba Mestre e na Sessão quando há iniciativa): se a vez cair num inimigo, o painel mostra esse inimigo ("Vez de Jael"), recupera as ações lendárias dele, zera os usos 1/turno, rola as recargas gastas dele (faixa de aviso: "Jael: Pino na Testa recarregou (6)") e, ao virar a rodada, zera Não Hoje e usos 1/rodada.
- **Disponíveis agora**: esconde ações esgotadas, lendárias sem custo disponível, ambientes bloqueados e "O vos angeli" antes da rodada 3. **⭐** fixa ações favoritas no topo (continuam visíveis mesmo esgotadas).
- **Aplicar**: depois de um 🎲 de dano, escolha o alvo (linhas da iniciativa) e toque em "Aplicar −N" ou "Metade −N"; cura vira "Curar +N". Fica registrado em *Últimas ações*. As fichas originais não mudam.
- **Recolher player**: o player fixo do rodapé ocupa quase metade da tela no celular; o botão o reduz, e o conteúdo ganha margem conforme a altura real dele.

### Rodada 3: luta rápida, desfazer e condições

- **⚔ Iniciar luta** (topo de *Inimigos e ações*): marque os inimigos, confira o PV de cada um (vem da ficha; o que você editar fica lembrado) e toque em "Rolar iniciativa e começar". Cada um rola 1d20, a ordem é refeita, a rodada volta a 1 e os usos por luta, por dia, por turno e por rodada, as recargas, as ações lendárias e o Não Hoje são zerados. Jogadores já na lista são mantidos. O antigo botão "Nova luta" virou "Zerar usos".
- **Desfazer**: Aplicar dano/cura, ajustes de PV (−10…+5), Usar, turnos, condições e Iniciar luta mostram um aviso "Desfazer" por 6 s; guarda até 5 passos (só em memória, não entra no que fica salvo).
- **Turnos**: ◀ e ▶ (na faixa fixa, em *Inimigos e ações* e em *Iniciativa e PV*). ▶ pula só inimigo caído; jogador com PV 0 continua na ordem (marcado "caído · salvaguarda contra a morte"); ◀ não reroda recargas. Há vibração curta e um aviso de leitor de tela ("Vez de X").
- **Condições**: em cada linha da iniciativa, "＋ Condição" abre chips de um toque (Derrubado, Impedido, Cravado, Atordoado, Amedrontado, Cego, Sem reações, Deslocamento 0, Marcado) e a duração (∞, 1–3 turnos). A contagem diminui quando termina o turno da criatura e a condição some ao zerar. O campo de texto antigo continua valendo e aparece como etiqueta. Depois de Usar Estaca, Laço, Arpão, Cão de Corrente, Golpe de Escudo, Pedra Orbital, Peso da Conta, Pino na Testa, Julgamento e outras com condição na ficha, aparece "Aplicar condição a…".
- **Acessibilidade**: abas de inimigos fixas ao rolar, cartas esgotadas com contraste mínimo de 4,5:1, "Letra grande" (lembrado), rótulos nos botões de ícone, foco visível e respeito a *prefers-reduced-motion*. No celular o player começa recolhido (a escolha anterior é respeitada); recolhido, ainda mostra Pausar, Voz, Baixar, Silêncio e o volume.

### Rodada 4: fluidez e correções

- **Mais rápido**: cada toque refaz só o painel, a linha ou o cartão tocado (não a aba inteira); painéis recolhidos só desenham o conteúdo ao abrir; foco, cursor, texto digitado e rolagem são preservados. Com CPU 4× mais lenta: +1 PV 77→2 ms, Usar 92→3 ms, Ataque 66→4 ms, bolinha 80→2 ms, Próximo turno 96→30 ms. A gravação no navegador é agrupada (300 ms) e feita também ao sair.
- **Volta**: o botão **Arrancar pétala e ir para a volta N** (painel A noite) arranca a pétala, avança a volta e zera rodada, usos, Não Hoje, condições e os inimigos da iniciativa (os jogadores ficam). Tem Desfazer, assim como Próxima cena e Cena anterior. O roteiro rola sozinho até a cena atual.
- **Luta**: Iniciar luta e cada ▶ rolam até o bloco do inimigo da vez; o resultado das rolagens some ao trocar de turno. Cada linha da iniciativa tem 2 linhas e um campo **−N / +N** (`30` ou `-30` tira, `+15` cura, Enter aplica). O alvo padrão do dano é um jogador; ações em área têm **Aplicar a todos os jogadores**. 20 natural oferece **Dano crítico (dados dobrados)**. Nomes repetidos ganham 2, 3…; PV vazio não entra.
- **Jogadores**: a lista de *Jogadores e votação* (nome e PV) alimenta a iniciativa (＋ Nome, ＋ Todos).
- **Condições**: o seletor rola para a vista e o aviso é compacto, fica acima da pílula e some ao rolar.
- **Ao recarregar**, o app volta à aba, aos painéis abertos e à posição de rolagem.
- **Cartas**: mão recebida com nome repetido entra como "Nome 2" (ou você escolhe Substituir); mão sua e recebida têm etiquetas; Guardar e Zoom ficam fixos acima da barra, Guardar mantém você em Puxar com o contador e o foco no código. Cartas de Abate (AB1–AB7) só aparecem para quem as recebeu: o Mestre copia o link de entrega em `cartas.html#mestre`.

### Rodada 5: fluidez e bordas

- **Mais rápido** (CPU 4× mais lenta): Próximo turno 21 → 9 ms quando a vez passa a um jogador e 21 → 15 ms quando passa a um inimigo; cartas fora da tela não entram no layout (`content-visibility`); imagens dos painéis são preguiçosas; a folha de fontes não bloqueia mais a primeira pintura (com rede lenta a página aparecia só após 3,1 s, agora em 0,08 s); o fade de áudio segue o relógio e não repete volume igual.
- **Toque**: sem atraso nem zoom por duplo toque (`touch-action: manipulation`), realce imediato ao tocar, campos com 16 px no celular (o iOS não dá zoom ao focar), o campo focado rola para a vista quando o teclado abre. O campo **−N/+N** usa teclado de texto (tem o sinal de menos).
- **Desfazer**: botão ↶ na pílula do turno por 15 s; o aviso com Desfazer fica 6 s e não some ao rolar. Dano e turno gravam na hora; o resto continua agrupado (300 ms).
- **Bordas**: estados salvos antigos ou corrompidos abrem sem erro; `localStorage` bloqueado ou cheio avisa e o app segue; **duas abas**: a que ficou velha pára de gravar e pergunta se recarrega ou grava por cima (em `cartas.html` a aba adota o que a outra gravou). Cartas: service worker (cache `cartas-v10`) pega a página pela rede primeiro (atualização já no 1º recarregamento) e abre offline pelo cache.
- **Testes**: `rodar_todos.sh` na pasta de trabalho roda a suíte (t1–t27) e imprime o resumo.

## Cartas de Poder (para os jogadores)

`cartas.html` tem só duas abas. **Mesa**: as 57 cartas de costas; toca na carta, ela vira, e escolhe-se o dono entre Pedro, Wesley, Victor, Xande, Bruno e Higor (uma bolinha com a cor do dono fica na carta; um balão flutuante mostra a legenda das cores). **Minha mão**: o jogador escolhe quem é (ou "Todas", que mostra todas as cartas viradas com a bolinha de cada dono) e vê só as suas cartas, com controle de tamanho da grade e uma janela de ampliação com zoom (− / barra / +) e navegação entre as cartas. Filtros por baralho na Mesa. **Cavaleiros** (3ª aba): o jogador escolhe quem é e, numa oferta de quatro virtudes de costas (Libertação, Paz, Fartura, Vida), fica com uma (cada virtude só uma vez; uma bolinha mostra de quem é a que já foi tomada). Depois ele vê só as três formas (Combatente, Conjurador, Suporte) da virtude que escolheu, com zoom, escolhe uma e recebe o pacote: a carta da forma, a Coroa Arcana (Conjurador) ou a Aura da Coroa (Suporte) e a Auréola. As cartas das outras virtudes não são desenhadas na tela dele (as imagens ficam em `img/cav/`). Tudo fica salvo no navegador do aparelho. Endereço: https://fabricio1974.github.io/OneShotPandora/cartas.html

### Formato A (sessão de 270 min, 5 lutas)
Sessão das 14:30 às 19:00 (270 min; a duração padrão do ritmo da noite agora é 270). São 5 lutas: Esaú; Ezequiel; Jael; Hildegarda com o anjo dentro da mesma luta (ele desce na 3ª rodada); Ozymandias com Élodie, juntos. PV dos chefes pela tabela v7 (por volta e por 3 ou 4 jogadores), **teto de rodadas por volta** (V1 1, V2 2, V3 e V4 3, V5 e V6 4; depois a tinta fecha a cena e os jogadores voltam, sem vitória; há aviso na rodada anterior ao teto) e pausa de 10 min depois da luta de Jael. Cada jogador puxa 2 cartas por volta (6 com 3 jogadores, 8 com 4); sem aliado do Mestre em combate. O roteiro sugerido tem essas cenas (a entrada e as trilhas foram mantidas; a cena "Os demônios · combate" e a cena separada da Raquel saíram). Quem já tinha dados salvos: a duração 240 passa a 270, os dados da Raquel viram os de Élodie e, se o roteiro salvo era o sugerido antigo e a noite não tinha começado, ele é trocado pelo novo; um roteiro editado não é mexido (use "Voltar ao roteiro sugerido" em Editar roteiro).

### Élodie Vermeil (no lugar da Raquel)
A pintora da corte do Ozymandias (ND 20, CA 20, PV 462; 65% no Formato A). Só luta junto com ele; dá +2 de CA ao rei a até 9 m e usa Interpor. Pigmentos, Esboço e Tinta, Molduras e as Telas estão nas passivas da ficha. Cartas dela: S04 Verniz, A06 Pincel de Cerdas Brancas, M13 Esboço, M14 Maré de Azul, H07 Retrato, H13 Natureza-Morta e a de Abate AB5 Paleta de Élodie (a frase de Degas, em 6 fragmentos). O baralho tem 57 cartas: Sobrevivência 12, Armas 11, Magia 14, Habilidades 13 e Abate 7 (a AB7 passou a se chamar Espada do Anjo). A mãe da Rafaela agora é **Aurélia**: nasceu, cresceu e morreu em Maré-Alta, na batalha com o demônio (há uma estátua dela no centro); a irmã dela, Clara, é quem se casa; o pai nunca voltou lá.

**Artes que faltam**: retrato de Élodie e vinheta da carta (hoje `img/cartas/vin_criados.jpg`), e os mapas das Telas I (Jardim ao Entardecer) e III (Marinha ao Luar). `img/cartas/vin_raquel.jpg` ficou na pasta, sem uso.

## Visual (design Arco)

A aba Mestre usa o desenho "Arco": terracota sobre preto (a paleta dos vasos gregos das artes), Inter Tight nos títulos, retrato do inimigo dentro de um arco de vaso, fileira de medalhões com a ordem da iniciativa e a barra de PV de cada um (toque num inimigo para abrir as ações dele), greca como divisória e ícones de traço no lugar dos emojis. As cores e fontes ficam em `:root` no início de `index.html`; os ícones, no objeto `ICO`.

## Página experimental do Esaú (`esau.html`)
Página de rolagem estilo "tela de personagem de jogo gacha" (GSAP + ScrollTrigger): uma cena por habilidade, parallax em camadas, dados clicáveis com os números da ficha. É um link à parte — não altera a Mesa do Mestre.
As artes entram em `img/esau/` com os nomes `esau_01_hero.png` … `esau_30_textura_papel.png`; o que ainda não existir aparece com a arte oficial como provisória.

## Combate condensado (`combate.html`, experimental)
Cópia da Mesa do Mestre com a seção "Inimigos e ações" redesenhada para notebook: coluna fixa à esquerda (vez, iniciativa com PV, filtros) e ações em grade de 2–3 colunas à direita, com miniatura da arte da ação, números do ataque em destaque, botão "Dano total" e "Regra" recolhida. O `index.html` não foi alterado. Artes por ação: `img/esau/` (Esaú) e `img/acoes/<inimigo>_<acao>.jpg` (demais); sem arte, o cartão fica sem miniatura.

### Créditos dos ícones (combate.html)
Miniaturas das ações: [game-icons.net](https://game-icons.net) (CC BY 3.0, vários autores, via Iconify). Ícones de interface: [Lucide](https://lucide.dev) (ISC).

### Sons dos cliques (combate.html)
Efeitos sintetizados no navegador (Web Audio, sem arquivos): dado, ataque, dano, cura, próximo turno (gongo), favoritar, desfazer e crítico. Botão "Sons" na coluna lateral liga/desliga (fica salvo no navegador).

### cenarios.html (experimental)
Gerador de mapas de combate por código (Canvas): Floresta, Taverna e Masmorra, 30 × 20 quadrados, com semente (mesma semente = mesmo mapa), grade opcional e botão "Baixar PNG". Link: `/cenarios.html` (ou `#taverna`, `#masmorra`).

## Aparência (aba Ajustes)
Aba **Ajustes** no app (e no combate): 3 layouts e 5 paletas por layout, com troca na hora e escolha salva no navegador (chave `otl_visual`).
- **Palco** (o visual de antes): Brasa, Meia-noite, Floresta, Ametista, Pergaminho (clara).
- **Painel** (menu lateral em telas largas; botões no celular): Grafite, Meia-noite, Carmim, Brasa, Floresta.
- **Cartaz** (cartões arredondados, abas em cápsula, barra de música flutuante): Ametista, Brasa, Carmim, Pergaminho, Grafite.
`visual.js` guarda as paletas e monta a aba; `visual.css` tem os layouts. As cartas (`cartas.html`) seguem só as paletas escuras. O padrão continua sendo Palco + Brasa. Se `visual.js` não carregar, o site abre com o visual de antes.
