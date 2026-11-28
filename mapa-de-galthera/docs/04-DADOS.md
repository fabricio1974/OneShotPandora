# 04 · Dados

Tudo o que é **público e fixo** fica em `dados/` (JSON, no Git). Tudo o que é **segredo ou muda durante a sessão** fica no Supabase (ver 05-SUPABASE).

Coordenadas: `[y, x]` em pixels do PNG original.

## `dados/mundo.json`

```json
{
  "nome": "Galthera",
  "imagem": { "largura": 16384, "altura": 12288, "tiles": "tiles/{z}/{y}/{x}.webp", "zoomMax": 6 },
  "inicio": { "centro": [6144, 8192], "zoom": 2 },
  "versao": 1
}
```

## `dados/regioes.json`

```json
[
  {
    "id": "reino-de-exemplo",
    "nome": "Reino de Exemplo",
    "tipo": "reino",
    "cor": "#b08a3e",
    "contorno": [[1200, 3400], [1180, 3900], [1650, 4100], [1700, 3500]],
    "resumo": "Uma linha que aparece ao tocar.",
    "texto": "textos/reino-de-exemplo.md",
    "visivel": "sempre"
  }
]
```

## `dados/locais.json`

```json
[
  {
    "id": "mare-alta",
    "nome": "Maré-Alta",
    "tipo": "cidade",
    "pos": [5210, 7330],
    "regiao": "reino-de-exemplo",
    "zoomMin": 3,
    "importancia": 2,
    "resumo": "Cidade portuária onde a Clara vai se casar.",
    "texto": "textos/mare-alta.md",
    "ilustracao": true,
    "inset": { "canto1": [5000, 7100], "canto2": [5420, 7560], "zoomMin": 5 },
    "ligacoes": ["vila-dos-herois"],
    "visivel": "revelavel"
  }
]
```

| Campo | Para quê |
|---|---|
| `tipo` | escolhe o ícone (`cidade`, `vila`, `ruina`, `masmorra`, `templo`, `porto`, `marco`, `outro`) |
| `zoomMin` | a partir de que zoom o rótulo aparece |
| `importancia` | 1 = capital (rótulo grande), 2 = cidade, 3 = lugar pequeno |
| `inset` | retângulo onde a pintura detalhada encaixa |
| `visivel` | `sempre` (todos veem), `revelavel` (aparece quando o Mestre revela) |

Locais **secretos** (que nem o nome pode aparecer) **não entram aqui**: ficam no Supabase.

## `dados/rotas.json`

```json
[
  { "id": "estrada-mare-alta", "nome": "A Estrada para Maré-Alta", "tipo": "estrada",
    "pontos": [[5600, 6900], [5420, 7100], [5210, 7330]], "visivel": "revelavel" }
]
```

Tipos: `estrada`, `trilha`, `rio-navegavel`, `rota-maritima`, `viagem` (o caminho que o grupo já fez, desenhado pelo Supabase).

## `dados/camadas.json`

Lista do que aparece no botão de camadas, com nome, ícone e se começa ligada: Regiões, Cidades, Lugares, Rotas, Facções, Viagem do grupo.

## `dados/textos/{id}.md`

O texto longo de cada local ou região, em Markdown simples. Separado do JSON para ser fácil de escrever (pode vir direto do vault do Obsidian).

```markdown
# Maré-Alta

Primeiro parágrafo, o que todos sabem.

## Rumores
- ...
```

## Validação

`tools/conferir_dados` (futuro) verifica: ids repetidos, coordenadas fora do mapa, ligações para ids que não existem, textos e artes que faltam.
