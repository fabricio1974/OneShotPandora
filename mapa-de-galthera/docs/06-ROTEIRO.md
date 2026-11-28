# 06 · Roteiro

Cada fase termina com algo **usável** publicado. Nenhuma depende de toda a arte estar pronta.

## Fase 0 · Estrutura ✅
Esta documentação.

## Fase 1 · O mapa abre (protótipo)
- [ ] Receber o PNG; medir; gerar os tiles (mesmo que ainda sem upscale)
- [ ] `index.html` com Leaflet: zoom, arrasto, limites, bom no celular
- [ ] 5–10 locais de teste em `dados/locais.json` com marcador e popup
- [ ] Publicar no GitHub Pages

**Pronto quando:** abre no celular e no tablet, com zoom suave e sem tela branca.

## Fase 2 · O atlas
- [ ] Rótulos que mudam com o zoom (regiões → cidades → lugares)
- [ ] Regiões com contorno ao toque
- [ ] Painel lateral com texto (Markdown), ilustração e ligações
- [ ] Busca e voo de câmera
- [ ] Camadas
- [ ] `editor.html`: clicar para criar local, desenhar região, exportar JSON
- [ ] Ícones dos tipos de local

**Pronto quando:** dá para explorar Galthera e ler sobre os lugares sem ajuda.

## Fase 3 · A mesa ao vivo
- [ ] Tabelas e funções no Supabase (05-SUPABASE)
- [ ] `mestre.html`: revelar/esconder, mover o grupo, desenhar a viagem
- [ ] Névoa do desconhecido
- [ ] Modo `?mesa` para o tablet, seguindo a câmera do Mestre
- [ ] Link no `combate.html` e no `tela.html`

**Pronto quando:** numa sessão, o Mestre revela um lugar e todos veem.

## Fase 4 · A arte em profundidade
- [ ] Upscale e passes de detalhe (03-ARTE-IA), região por região
- [ ] Insets das cidades principais
- [ ] Ilustrações dos locais

## Fase 5 · Acabamento (opcional)
- [ ] Música/ambiente por região (reaproveitar `mesa.js`)
- [ ] Animações de entrada, nuvens passando, ondas
- [ ] Notas dos jogadores
- [ ] Funcionar sem internet (service worker, como o `sw-cartas.js`)
- [ ] Linha do tempo: ver o mapa em datas diferentes
