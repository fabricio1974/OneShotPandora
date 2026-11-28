-- Aplicada em 28/11/2026: imagens nas anotações, edição de trilhas, armazenamento de imagens.
alter table public.galtherdara_notas add column imagens text[] not null default '{}' check (cardinality(imagens) <= 4);
-- galtherdara_imagens_ok(text[]): só aceita URLs do armazenamento do projeto ou do CDN do Kanka.
-- galtherdara_nota_criar(..., p_imagens text[]) e galtherdara_nota_editar(..., p_imagens text[]) substituem as versões antigas.
-- galtherdara_trilha_editar(p_id, p_token, p_nome, p_pontos): só quem criou (mesmo token) edita.
-- Bucket público "galtherdara" (2 MB por arquivo; jpeg, webp, png); qualquer visitante pode ENVIAR para notas/, ninguém apaga pelo site.
-- Texto completo no histórico de migrações do Supabase: galtherdara_imagens_e_edicao.
