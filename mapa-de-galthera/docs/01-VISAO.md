# 01 · Visão

## Em uma frase

Um atlas pintado de Galthera que os jogadores exploram no celular, no tablet ou no computador, e que o Mestre usa na mesa para mostrar e revelar o mundo.

## Referência: mapa de Runeterra

O que copiar:

- **Zoom contínuo** sobre uma pintura única: de longe, continentes; de perto, cidades e estradas.
- **Rótulos que mudam com o zoom**: longe, só nomes de regiões; perto, cidades; mais perto, lugares menores.
- **Regiões com contorno** que acendem ao passar o dedo e abrem um painel.
- **Painel lateral** com ilustração, texto e ligações para outros locais.
- **Camadas**: regiões, locais, rotas, facções.
- **Voo de câmera** ao escolher um local (a câmera desliza até ele).

O que **não** copiar no início: animações caras, vídeo, 3D, trilha por região (pode vir depois, reaproveitando `mesa.js`).

## O que este mapa tem a mais

1. **Névoa do desconhecido**: lugares que o grupo ainda não conhece ficam escondidos. O Mestre revela, e aparece para todos.
2. **Marcador do grupo**: onde o grupo está agora. O Mestre move; todos veem.
3. **Segredos protegidos**: o que não foi revelado não está no código público (ver 05-SUPABASE).
4. **Notas dos jogadores** (fase posterior): cada jogador marca suspeitas e lembranças num local.
5. **Tela da mesa**: abre no tablet da mesa presencial (como o `tela.html`), sem precisar mexer nele.

## Quem usa

| Pessoa | Onde | O que faz |
|---|---|---|
| Jogador | celular, em casa ou na mesa | explora, lê, vê o que foi revelado |
| Mestre | notebook | revela, move o grupo, edita textos |
| Mesa | tablet | mostra o mapa grande; segue o Mestre |

## Fora do escopo

- Mapas de batalha com grade (continuam no Roll20 e no `cenarios.html`).
- Contas e senhas por jogador. A entrada é pelo link; o Mestre tem uma chave.
- Edição do mapa pintado pelo site. A pintura muda fora do site, e os tiles são gerados de novo.
