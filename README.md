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

Painel de referência dos Bellacord (Esaú, Jael, Ezequiel, Hildegarda, Raquel, Ozymandias e o Anjo) com as **fichas originais** do bestiário "O Cordeiro e o Lobo" (texto, bônus de ataque, alcances, dados e médias, CDs, recargas e custos copiados sem alteração; as cartas dos jogadores deixaram de ser a fonte). Cada inimigo tem:

- **Ficha** recolhível (CA, PV com os dados, deslocamento, atributos, salvaguardas, perícias, resistências e imunidades, sentidos, idiomas, ND). O PV da ficha é o padrão em "Pôr na iniciativa" e em "Iniciar luta" (Esaú 420, Jael 513, Ezequiel 375, Hildegarda 427, Raquel 460, Ozymandias 625, Anjo 500) e pode ser editado.
- **Ações por categoria, na ordem da ficha**: Ação, Ação bônus, Recarga, Reação (sempre visíveis), Passivas, Ações lendárias e Ações de ambiente (seções recolhidas com contagem). Filtros por tipo (inclui Lendária, Ambiente e Recarga), por efeito (tags) e **◆ sem salvaguarda** (selo "◆ sem salvaguarda" nas ações marcadas na ficha, as que anulam a Resistência Lendária dos jogadores).
- **Rolagens**: "Ataque +13" rola d20 + bônus e avisa 20 e 1 naturais; 🎲 rola cada expressão de dano (Aplicar, Metade e Curar continuam); as CDs das salvaguardas aparecem em destaque ("Des CD 21"). "Ataques Múltiplos" tem botões que rolam a sequência da ficha (3 × Facão, 2 × Lança + Golpe de Escudo etc.). Ações lendárias que dizem "faz um ataque de X" usam os números de X.
- **Usos**: recarga 5–6 e 6 (só com 6), Resistência Lendária 3/dia (Ozymandias 4, e 5 a partir da 4ª volta, com "Avareza: recuperar 1"), Quebra-Coroa 3/dia, Milagre 1/dia, magias do Ezequiel (3/dia e 1/dia) em bolinhas. **Ações lendárias**: bolinhas por inimigo (3; Raquel 2; Ozymandias 3 ou 4 na Fase 2); "Usar (−N)" gasta o custo e elas voltam no início do turno do inimigo ao tocar em ▶ (ou em "Zerar usos").
- **Regras do Mestre**: faixa "Regras da luta" no topo. **Não Hoje**: contador de dano na rodada em cada inimigo na iniciativa (150; 200 o Ozymandias), alimentado por Aplicar e pelos botões −PV, com aviso "o dano a mais é pela metade"; o campo "Aplicar dano com Não Hoje" já reduz a metade o que passa do limite; zera a cada rodada. **Ações de ambiente**: botão "Usar nesta rodada", uma por rodada (duas para o Ozymandias na Fase 2), a usada na rodada anterior fica bloqueada. **Ozymandias**: Fase 2 automática quando o PV na iniciativa cruza abaixo de 312 (aviso; 2 ambientes, 4 lendárias; dá para ligar/desligar à mão), CA 23 enquanto a Raquel estiver viva e perto. **Ezequiel**: Presságio da volta (3, 4, 4 e 5 dados de d20 conforme a volta atual) com botão que rola, marcar cada dado como usado, ↻ para Girar a Roda e +1d20 para Ler a Roda; "Já Vi Isso" lembrado da volta 2 em diante. **Ozymandias**: "Memória das Voltas" da volta 4 em diante (vantagem na iniciativa em "Iniciar luta"). **Hildegarda**: "O vos angeli" só aparece como disponível a partir da rodada 3. **Anjo**: conta como demônio, "descreva o que eles veem". **Raquel**: só luta com o Ozymandias.

Escolha o inimigo ou "Todos". "Zerar usos" (duplo toque), "Pétala arrancada" (zera usos por volta e por dia) e "Nova rodada" (zera 1/rodada, Não Hoje e passa o ambiente para "rodada anterior"). Tudo fica salvo no navegador, só na aba Mestre (a tela dos jogadores não muda) e nenhuma ficha é alterada. O estado salvo antigo das cartas é descartado ao abrir esta versão (os ids das ações mudaram).

Os dados do app foram gerados a partir do `.md` do bestiário; para conferir depois de mudar a ficha, extraia de novo e compare (o teste de conferência compara PV, CA, atributos, ◆, dados e médias, bônus de ataque, CDs, recargas, custos e usos).

### Luta no celular (iniciativa integrada)

- **Pôr na iniciativa**: no cabeçalho de cada inimigo, digite o PV (e a iniciativa, ou toque em 🎲 para um d20) e toque no botão. Depois aparece "Na iniciativa ✓" com os botões −10 −5 −1 +1 +5, que mexem na mesma linha de *Iniciativa e PV*. O vínculo é pelo nome da linha ("Jael", "Jael 2").
- **Próximo turno** (também na faixa fixa no canto, visível na aba Mestre e na Sessão quando há iniciativa): se a vez cair num inimigo, o painel mostra esse inimigo ("Vez de Jael"), recupera as ações lendárias dele, zera os usos 1/turno, rola as recargas gastas dele (faixa de aviso: "Jael: Pino na Testa recarregou (6)") e, ao virar a rodada, zera Não Hoje e usos 1/rodada.
- **Disponíveis agora**: esconde ações esgotadas, lendárias sem custo disponível, ambientes bloqueados e "O vos angeli" antes da rodada 3. **⭐** fixa ações favoritas no topo (continuam visíveis mesmo esgotadas).
- **Aplicar**: depois de um 🎲 de dano, escolha o alvo (linhas da iniciativa) e toque em "Aplicar −N" ou "Metade −N"; cura vira "Curar +N". Fica registrado em *Últimas ações*. As fichas originais não mudam.
- **Recolher player**: o player fixo do rodapé ocupa quase metade da tela no celular; o botão o reduz, e o conteúdo ganha margem conforme a altura real dele.

### Rodada 3: luta rápida, desfazer e condições

- **⚔ Iniciar luta** (topo de *Inimigos e ações*): marque os inimigos, confira o PV de cada um (vem da ficha; o que você editar fica lembrado) e toque em "Rolar iniciativa e começar". Cada um rola 1d20, a ordem é refeita, a rodada volta a 1 e os usos por luta, por dia, por turno e por rodada, as recargas, as ações lendárias e o Não Hoje são zerados. Jogadores já na lista são mantidos. O antigo botão "Nova luta" virou "Zerar usos".
- **Desfazer**: Aplicar dano/cura, ajustes de PV (−10…+5), Usar, turnos, condições e Iniciar luta mostram um aviso "Desfazer" por 6 s; guarda até 5 passos (só em memória, não entra no que fica salvo).
- **Turnos**: ◀ e ▶ (na faixa fixa, em *Inimigos e ações* e em *Iniciativa e PV*). ▶ pula quem está com PV 0, exceto se todos estiverem; ◀ não reroda recargas. Há vibração curta e um aviso de leitor de tela ("Vez de X").
- **Condições**: em cada linha da iniciativa, "＋ Condição" abre chips de um toque (Derrubado, Impedido, Cravado, Atordoado, Amedrontado, Cego, Sem reações, Deslocamento 0, Marcado) e a duração (∞, 1–3 turnos). A contagem diminui quando termina o turno da criatura e a condição some ao zerar. O campo de texto antigo continua valendo e aparece como etiqueta. Depois de Usar Estaca, Laço, Arpão, Cão de Corrente, Golpe de Escudo, Pedra Orbital, Peso da Conta, Pino na Testa, Julgamento e outras com condição na ficha, aparece "Aplicar condição a…".
- **Acessibilidade**: abas de inimigos fixas ao rolar, cartas esgotadas com contraste mínimo de 4,5:1, "Letra grande" (lembrado), rótulos nos botões de ícone, foco visível e respeito a *prefers-reduced-motion*. No celular o player começa recolhido (a escolha anterior é respeitada).

## Cartas de Poder (para os jogadores)

`cartas.html` é a página que os jogadores abrem no celular: eles rolam 1d4 (baralho: S, A, M, H) e 1d12 (carta), digitam o código (por exemplo M07) e veem a carta, com a mão guardada no próprio celular, o Eco da Fome somado e marcadores de uso por luta, por volta e recarga. Endereço depois de ativar o Pages: https://fabricio1974.github.io/OneShotPandora/cartas.html

`cartas.html#mestre` mostra todas as cartas e as frases completas. Não passe esse endereço aos jogadores.
