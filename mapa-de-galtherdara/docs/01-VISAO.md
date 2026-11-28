# 01 · Visão

## Em uma frase

Um atlas pintado de Galtherdara que os jogadores exploram no celular, no tablet ou no computador, e que o Mestre usa na mesa para mostrar e revelar o mundo.

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

1. **Névoa do desconhecido** (cenário B): lugares que o grupo ainda não conhece ficam escondidos. O Mestre revela, e aparece para todos.
2. **Marcador do grupo** (cenário B): onde o grupo está agora. O Mestre move; todos veem.
3. **Segredos protegidos**: o que não foi revelado não está no código público (ver 05-SUPABASE).
4. **Notas dos jogadores** (fase posterior): cada jogador marca suspeitas e lembranças num local.
5. **Diário da Akari**: missões e viagens marcadas no mapa, com o resumo de cada log.

## Contexto

Galtherdara é o mundo da guilda **Plano Logos** (servidor de Discord com vários mestres e jogadores), onde o Fabrício joga com a **Akari Bellacord Sasaya**. O Fabrício é **jogador**, não mestre deste mundo. Por isso:

- o mapa mostra o que é conhecido do mundo, não segredos de mestre;
- os recursos "de mesa" (névoa, marcador do grupo, revelar) só fazem sentido se os mestres da guilda forem usar; senão, viram recursos pessoais (ver abaixo);
- um recurso próprio cabe bem aqui: o **diário de viagem da Akari**, com as missões marcadas no mapa (nome, data, mestre, patente), ligado aos logs de personagem que já são feitos depois de cada missão.

## Quem usa

Depende da decisão em 07-PENDENCIAS ("Para quem é o mapa"):

| Cenário | Quem | O que faz |
|---|---|---|
| A. Pessoal | Fabrício | explora o mundo, anota lugares, registra as missões da Akari |
| B. Da guilda | jogadores e mestres da Plano Logos | consultam o atlas pelo link; os mestres podem revelar lugares e marcar missões |

## Fora do escopo

- Mapas de batalha com grade.
- Contas e senhas por jogador. A entrada é pelo link; o Mestre tem uma chave.
- Edição do mapa pintado pelo site. A pintura muda fora do site, e os tiles são gerados de novo.
