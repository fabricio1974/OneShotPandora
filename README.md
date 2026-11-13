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

Painel de referência dos Bellacord (Esaú, Jael, Ezequiel, Hildegarda, Raquel, Ozymandias e o Anjo) com as ações das cartas v4: tipo de ação, tags (dano, área, cura, movimentação, controle, defesa, buff, debuff, informação, invocação), texto e uso. Escolha o inimigo ou "Todos", filtre por tipo e efeito, marque os usos (N/luta, N/volta, 1/turno, 1/rodada) tocando nas bolinhas, role a Recarga 5–6, use "Usar" para registrar em "Últimas ações" e toque em 🎲 para rolar os dados do texto. "Nova luta" (duplo toque), "Pétala arrancada" e "Nova rodada" zeram os usos. Tudo fica salvo no navegador e nenhuma ficha é alterada.

### Luta no celular (iniciativa integrada)

- **Pôr na iniciativa**: no cabeçalho de cada inimigo, digite o PV (e a iniciativa, ou toque em 🎲 para um d20) e toque no botão. Depois aparece "Na iniciativa ✓" com os botões −10 −5 −1 +1 +5, que mexem na mesma linha de *Iniciativa e PV*. O vínculo é pelo nome da linha ("Jael", "Jael 2").
- **Próximo turno** (também na faixa fixa no canto, visível na aba Mestre e na Sessão quando há iniciativa): se a vez cair num inimigo, o painel mostra esse inimigo ("Vez de Jael"), zera os usos 1/turno dele, rola as recargas gastas dele (faixa de aviso: "Jael: Pino na Testa recarregou (5)") e, ao virar a rodada, zera os usos 1/rodada.
- **Disponíveis agora**: esconde ações esgotadas e recolhe as passivas sem contador numa linha. **⭐** fixa ações favoritas no topo (continuam visíveis mesmo esgotadas).
- **Aplicar**: depois de um 🎲 de dano, escolha o alvo (linhas da iniciativa) e toque em "Aplicar −N" ou "Metade −N"; cura vira "Curar +N". Fica registrado em *Últimas ações*. As fichas originais não mudam.
- **Recolher player**: o player fixo do rodapé ocupa quase metade da tela no celular; o botão o reduz, e o conteúdo ganha margem conforme a altura real dele.

## Cartas de Poder (para os jogadores)

`cartas.html` é a página que os jogadores abrem no celular: eles rolam 1d4 (baralho: S, A, M, H) e 1d12 (carta), digitam o código (por exemplo M07) e veem a carta, com a mão guardada no próprio celular, o Eco da Fome somado e marcadores de uso por luta, por volta e recarga. Endereço depois de ativar o Pages: https://fabricio1974.github.io/OneShotPandora/cartas.html

`cartas.html#mestre` mostra todas as cartas e as frases completas. Não passe esse endereço aos jogadores.
