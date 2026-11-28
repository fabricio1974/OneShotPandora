# 05 · Supabase (parte ao vivo)

Projeto: **oneshot-cartas** (`bfommmrznwqhxnkpfjla`, região São Paulo). Já existe a tabela `mesas`, do site de cartas. **O mapa não mexe nela**: terá tabelas próprias, com prefixo `galthera_`.

## O problema dos segredos

O repositório é público. Qualquer jogador pode abrir `dados/locais.json` no GitHub. Então:

- O que pode ser lido por todos (nomes de reinos conhecidos, a pintura) fica no Git.
- O que é **segredo** fica no Supabase, protegido por regra de acesso (RLS): **só aparece para os jogadores quando foi revelado**.
- A pintura em si não tem como esconder. Se um lugar secreto estiver pintado, a névoa cobre, mas alguém curioso consegue baixar o tile. Para segredos fortes: não pintar no mapa-mundo; usar inset que só é publicado depois.

## Tabelas (planejadas)

### `galthera_estado` — uma linha por campanha

| coluna | tipo | exemplo |
|---|---|---|
| `id` | text (chave) | `pandora` |
| `grupo` | jsonb | `{ "pos": [5600, 6900], "nome": "O grupo", "visivel": true }` |
| `camera` | jsonb | `{ "centro": [...], "zoom": 4, "seguir": true }` (para o tablet e o "seguir o Mestre") |
| `revelados` | text[] | ids de `dados/` que já foram revelados |
| `nevoa` | jsonb | áreas descobertas (círculos/polígonos) |
| `viagem` | jsonb | pontos do caminho já percorrido |
| `atualizado` | timestamptz | |

### `galthera_segredos` — locais e textos que não podem estar no Git

| coluna | tipo |
|---|---|
| `id` | text (chave) |
| `campanha` | text |
| `dados` | jsonb (mesmo formato de um local de `locais.json`) |
| `revelado` | boolean |

Regra de leitura: `revelado = true`. Os não revelados não chegam ao navegador do jogador.

### `galthera_notas` — fase posterior

Notas de jogadores por local: `id`, `campanha`, `local`, `autor` (nome digitado), `texto`, `criado`.

## Quem pode escrever

Não há contas. Segue o padrão do site de cartas (função `mesa_aplicar`):

- Leitura: pública (com as regras acima).
- Escrita do Mestre: só por **funções no banco** (RPC) que exigem a **chave do Mestre**. A chave fica guardada no banco como hash; o `mestre.html` pede a chave uma vez e lembra no navegador.
- Jogadores: só podem criar notas (fase posterior), com limite de tamanho.

Funções planejadas: `galthera_revelar(chave, ids[])`, `galthera_esconder(chave, ids[])`, `galthera_mover_grupo(chave, pos)`, `galthera_camera(chave, camera)`, `galthera_nevoa(chave, area)`.

## Tempo real

O site assina as mudanças de `galthera_estado` (Supabase Realtime). Quando o Mestre revela algo, os jogadores veem em 1 segundo. Se a conexão cair, o site mostra o último estado e tenta reconectar.

## Limites do plano grátis

Sobra muito: o mapa troca poucos dados (alguns KB por sessão). Observação: projetos grátis **pausam após 7 dias sem uso**; antes de uma sessão depois de uma pausa longa, abrir o site uma vez (ou eu reativo pelo painel).

## Migração

Nada será criado no banco antes da Fase 2 do roteiro. Quando chegar a hora, a migração fica em `tools/supabase/galthera_001.sql` e é aplicada uma vez.
