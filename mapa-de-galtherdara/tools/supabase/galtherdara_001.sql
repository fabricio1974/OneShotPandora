-- Aplicada em 28/11/2026 no projeto oneshot-cartas (bfommmrznwqhxnkpfjla).
-- Protótipo: notas e trilhas dos personagens. Leitura pública; escrita só pelas funções.
-- Quem cria guarda um token no navegador; só esse token edita ou apaga (o banco guarda o hash).
create extension if not exists pgcrypto with schema extensions;

create table public.galtherdara_notas (
  id uuid primary key default gen_random_uuid(),
  personagem text not null check (char_length(personagem) between 1 and 40),
  cor text not null check (cor ~ '^#[0-9a-fA-F]{6}$'),
  y real not null check (y between 0 and 6144),
  x real not null check (x between 0 and 8192),
  titulo text not null check (char_length(titulo) between 1 and 80),
  texto text not null default '' check (char_length(texto) <= 2000),
  criado timestamptz not null default now(),
  dono text not null
);

create table public.galtherdara_trilhas (
  id uuid primary key default gen_random_uuid(),
  personagem text not null check (char_length(personagem) between 1 and 40),
  cor text not null check (cor ~ '^#[0-9a-fA-F]{6}$'),
  nome text not null check (char_length(nome) between 1 and 80),
  pontos jsonb not null check (jsonb_typeof(pontos) = 'array' and jsonb_array_length(pontos) between 2 and 300),
  criado timestamptz not null default now(),
  dono text not null
);

alter table public.galtherdara_notas enable row level security;
alter table public.galtherdara_trilhas enable row level security;
create policy "leitura publica" on public.galtherdara_notas for select to anon, authenticated using (true);
create policy "leitura publica" on public.galtherdara_trilhas for select to anon, authenticated using (true);

-- Funções: galtherdara_hash, galtherdara_nota_criar, galtherdara_nota_editar,
-- galtherdara_trilha_criar, galtherdara_apagar(tabela 'notas'|'trilhas', id, token).
-- (texto completo no histórico de migrações do Supabase: galtherdara_prototipo)

alter publication supabase_realtime add table public.galtherdara_notas, public.galtherdara_trilhas;
