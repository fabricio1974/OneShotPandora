-- Aplicada em 28/11/2026. Cópia do conteúdo público da wiki do Kanka (https://app.kanka.io/w/plano-logos).
-- Importação feita uma vez pelo navegador; a função de importação foi apagada logo depois (tabela só leitura).
create table public.galtherdara_kanka (
  id bigint primary key,          -- id da entidade no Kanka
  cat text not null,              -- location, organisation, event, note, race, character, item, map
  nome text not null,
  tipo text,
  pai bigint,                     -- entidade-pai no Kanka (ex.: Boteco do Mag e Malorne < Amox)
  img text, thumb text,           -- imagens no CDN do Kanka
  tags text[] not null default '{}',
  entrada text not null default '',  -- texto principal
  posts jsonb not null default '[]', -- seções: [{t: título, c: texto}]
  atualizado timestamptz not null default now()
);
alter table public.galtherdara_kanka enable row level security;
create policy "leitura publica" on public.galtherdara_kanka for select to anon, authenticated using (true);
-- Para atualizar no futuro: recriar uma função de importação temporária (ver histórico de migrações
-- "galtherdara_kanka" no Supabase), rodar o script de coleta no navegador e apagar a função de novo.
