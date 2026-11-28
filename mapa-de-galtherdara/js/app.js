/* Galtherdara · protótipo do atlas da Plano Logos */
(() => {
'use strict';

const SB_URL = 'https://bfommmrznwqhxnkpfjla.supabase.co';
const SB_KEY = 'sb_publishable_U3KwXKnyb92OQyEjYwSBHA_qs9nfImW';
const W = 8192, H = 6144, ZMAX = 5;
const CORES = ['#e0564f','#e89a3c','#e8cf5a','#6cc56a','#4fc3c9','#5a8ee8','#9b6ee8','#e06fb8','#d9d2c0','#8b6b4a'];
const TIPOS = {cidade:'Cidade', vila:'Vila', regiao:'Região', ruina:'Ruínas', marco:'Marco', masmorra:'Masmorra', templo:'Templo', porto:'Porto', reino:'Reino', dominio:'Domínio de Dragão', continente:'Continente', organizacao:'Organização'};
const CATS = {location:'Lugar', organisation:'Organização', event:'Evento', note:'Nota', race:'Raça', character:'Personagem'};
const WIKI = 'https://app.kanka.io/w/plano-logos/entities/';
const RAIO_PERTO = 420; // px do mapa original
const VERSAO = 5;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const guardar = (k, v) => { try { localStorage.setItem('galtherdara.' + k, JSON.stringify(v)); } catch (e) {} };
const ler = (k, padrao) => { try { const v = localStorage.getItem('galtherdara.' + k); return v == null ? padrao : JSON.parse(v); } catch (e) { return padrao; } };

function aviso(txt, ms = 2600) {
  const a = $('#aviso'); a.textContent = txt; a.classList.add('mostra');
  clearTimeout(aviso.t); aviso.t = setTimeout(() => a.classList.remove('mostra'), ms);
}

// ---------- Identidade local ----------
let eu = ler('eu', null);              // {nome, cor}
let token = ler('token', null);
if (!token) {
  const b = new Uint8Array(24); crypto.getRandomValues(b);
  token = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  guardar('token', token);
}
let meus = new Set(ler('meus', []));   // ids criados neste navegador
const salvarMeus = () => guardar('meus', [...meus]);
let ocultos = new Set(ler('ocultos', []));

// ---------- Mapa ----------
const mapa = L.map('mapa', {
  crs: L.CRS.Simple, minZoom: 0, maxZoom: ZMAX + 2, zoomSnap: 1, zoomDelta: 1,
  wheelPxPerZoomLevel: 120, attributionControl: true, zoomControl: false, maxBoundsViscosity: 0.85
});
L.control.zoom({position: 'bottomright'}).addTo(mapa);
mapa.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');

const P = (y, x) => mapa.unproject([x, y], ZMAX);          // pixel do PNG -> latlng
const PX = ll => { const p = mapa.project(ll, ZMAX); return [p.y, p.x]; };
const limites = L.latLngBounds(P(H, 0), P(0, W));

// Fundo borrado: a imagem inteira em baixa resolução, por baixo dos tiles (nada de quadrados pretos)
mapa.createPane('base').style.zIndex = 150;   // abaixo dos tiles (200)
L.imageOverlay('tiles/base.webp', limites, {pane: 'base', className: 'base-borrada', interactive: false}).addTo(mapa);
L.tileLayer('tiles/{z}/{y}/{x}.webp', {
  minZoom: 0, maxNativeZoom: ZMAX, maxZoom: ZMAX + 2, noWrap: true, bounds: limites, tileSize: 256, keepBuffer: 4, className: 'tiles-nitidos',
  attribution: 'Arte: Galtherdara'
}).addTo(mapa);
mapa.setMaxBounds(limites.pad(0.15));

function ajustarInicio() {
  // zoom inteiro: evita linhas finas entre os tiles
  const z = Math.floor(mapa.getBoundsZoom(limites, false));
  mapa.setMinZoom(Math.max(0, z));
}
ajustarInicio();

// ---------- Lugares ----------
let locais = [];
const pinos = {};
const camadaLugares = L.layerGroup().addTo(mapa);
let selecionado = null;

function iconePino(sel) {
  return L.divIcon({className: '', html: `<div class="pino${sel ? ' sel' : ''}"><i></i></div>`, iconSize: [26, 26], iconAnchor: [13, 34]});
}

async function carregarLocais() {
  const r = await fetch('dados/locais.json?v=' + VERSAO, {cache: 'no-cache'});
  locais = await r.json();
  const ul = $('#listaLocais'); ul.innerHTML = '';
  [...locais].sort((a, b) => a.nome.localeCompare(b.nome, 'pt')).forEach(l => {
    const m = L.marker(P(l.pos[0], l.pos[1]), {icon: iconePino(false), riseOnHover: true, keyboard: true, title: l.nome})
      .bindTooltip(l.nome, {className: 'rot', direction: 'top', offset: [0, -30]})
      .on('click', () => abrirLugar(l))
      .addTo(camadaLugares);
    pinos[l.id] = m;
    const li = document.createElement('li');
    li.innerHTML = `<span>${esc(l.nome)}</span><span class="t">${esc(TIPOS[l.tipo] || l.tipo)}</span>`;
    li.onclick = () => { abrirLugar(l); if (innerWidth < 760) document.body.classList.add('lado-fechado'); };
    ul.appendChild(li);
  });
}

// ---------- Wiki (Kanka) ----------
const kanka = {};            // id -> entidade
const filhosDe = {};         // id -> [entidades]
const kankaParaLocal = {};   // id kanka -> local do mapa
const paragrafos = t => String(t || '').split(/\n+/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('');

function preencherPainel(ent, local) {
  diarioAberto = null;
  const p = $('#lugar');
  const img = p.querySelector('.capa');
  if (ent && (ent.img || ent.thumb)) { img.src = ent.img || ent.thumb; img.hidden = false; img.onerror = () => { img.hidden = true; }; } else { img.hidden = true; img.removeAttribute('src'); }
  p.querySelector('.tipo').textContent = (ent && ent.tipo) || (local && (TIPOS[local.tipo] || local.tipo)) || (ent && CATS[ent.cat]) || '';
  p.querySelector('h2').textContent = local ? local.nome : ent.nome;
  const resumo = p.querySelector('.resumo'), corpo = p.querySelector('.texto-guilda'), secoes = p.querySelector('.secoes');
  secoes.innerHTML = '';
  if (ent && (ent.entrada || (ent.posts || []).length)) {
    const ps = ent.entrada.split(/\n+/).filter(x => x.trim());
    resumo.textContent = ps[0] || (local ? local.resumo : '');
    corpo.className = 'texto-guilda wiki'; corpo.innerHTML = paragrafos(ps.slice(1).join('\n'));
    (ent.posts || []).filter(x => x.c && x.c.trim()).forEach(x => {
      const d = document.createElement('details');
      d.innerHTML = `<summary>${esc(x.t || 'Mais')}</summary><div>${paragrafos(x.c)}</div>`;
      secoes.appendChild(d);
    });
  } else {
    resumo.textContent = local ? (local.resumo || 'O que se vê no mapa.') : '';
    corpo.className = 'texto-guilda';
    corpo.textContent = ent ? 'Esta página ainda está vazia na wiki da guilda.' : 'Este lugar ainda não tem página na wiki da guilda.';
  }
  p.querySelectorAll('.aprox').forEach(x => x.remove());
  if (local && local.posAproximada) p.querySelector('h2').insertAdjacentHTML('afterend', '<p class="aprox">Posição aproximada, trazida do mapa da wiki.</p>');
  const filhos = ent ? (filhosDe[ent.id] || []) : [];
  const ulF = p.querySelector('.filhos'); ulF.innerHTML = '';
  p.querySelector('.filhos-box').hidden = !filhos.length;
  filhos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt')).forEach(f => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${esc(f.nome)}</span><span class="t">${esc(f.tipo || '')}</span>`;
    li.onclick = () => abrirEntidade(f);
    ulF.appendChild(li);
  });
  const fonte = p.querySelector('.fonte');
  fonte.hidden = !ent; if (ent) fonte.querySelector('a').href = WIKI + ent.id;
  p.querySelector('.no-mapa').hidden = !local;
  p.scrollTop = 0;
  p.hidden = false; document.body.classList.add('com-lugar');
}

// Abre uma entidade da wiki: se tiver lugar no mapa (ela ou um "pai"), voa até lá
function abrirEntidade(ent) {
  const l = kankaParaLocal[ent.id];
  if (l) { abrirLugar(l); return; }
  if (selecionado && pinos[selecionado.id]) pinos[selecionado.id].setIcon(iconePino(false));
  selecionado = null;
  preencherPainel(ent, null);
  let pai = ent.pai; while (pai && !kankaParaLocal[pai] && kanka[pai]) pai = kanka[pai].pai;
  const lp = pai && kankaParaLocal[pai];
  if (lp) mapa.flyTo(P(lp.pos[0], lp.pos[1]), Math.max(mapa.getZoom(), 4), {duration: 1.2});
  if (innerWidth < 760) document.body.classList.add('lado-fechado');
}

function abrirLugar(l, voar = true) {
  if (selecionado && pinos[selecionado.id]) pinos[selecionado.id].setIcon(iconePino(false));
  selecionado = l;
  pinos[l.id].setIcon(iconePino(true));
  preencherPainel(l.kanka ? kanka[l.kanka] : null, l);
  preencherNotasPerto();
  if (voar) {
    const alvo = Math.max(mapa.getZoom(), 4);
    const ll = P(l.pos[0], l.pos[1]);
    const dx = innerWidth >= 760 ? 170 : 0, dy = innerWidth < 760 ? innerHeight * 0.22 : 0;
    const pt = mapa.project(ll, alvo).add([dx, dy]);
    mapa.flyTo(mapa.unproject(pt, alvo), alvo, {duration: 1.2});
  }
}
function fecharLugar() {
  if (selecionado && pinos[selecionado.id]) pinos[selecionado.id].setIcon(iconePino(false));
  selecionado = null; diarioAberto = null; $('#lugar').hidden = true; document.body.classList.remove('com-lugar');
}
$('#lugar .fechar').onclick = fecharLugar;
$('#lugar .anotar-aqui').onclick = () => {
  if (!selecionado) return;
  const [y, x] = selecionado.pos;
  pedirNota([y + 60, x + 60]);
};

function preencherNotasPerto() {
  if (!selecionado) return;
  const [y0, x0] = selecionado.pos;
  const ul = $('#lugar .notas-perto'); ul.innerHTML = '';
  const perto = notas.filter(n => Math.hypot(n.y - y0, n.x - x0) < RAIO_PERTO && !ocultos.has(n.personagem));
  if (!perto.length) { ul.innerHTML = '<li class="dica" style="cursor:default">Nenhuma ainda.</li>'; return; }
  perto.forEach(n => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="bolinha" style="background:${esc(n.cor)}"></span><span><b>${esc(n.titulo)}</b> · ${esc(n.personagem)}</span>`;
    li.onclick = () => { const m = marcasNotas[n.id]; if (m) { mapa.flyTo(m.getLatLng(), Math.max(mapa.getZoom(), 4)); m.openPopup(); } };
    ul.appendChild(li);
  });
}

// ---------- Supabase ----------
let sb = null;
try { sb = supabase.createClient(SB_URL, SB_KEY, {auth: {persistSession: false}}); } catch (e) { console.error(e); }

async function carregarKanka() {
  if (!sb) return;
  const {data, error} = await sb.from('galtherdara_kanka').select('id,cat,nome,tipo,pai,img,thumb,tags,entrada,posts').neq('cat', 'item');
  if (error) { console.error(error); $('#listaMundo').innerHTML = '<p class="dica">Não foi possível carregar a wiki.</p>'; return; }
  data.forEach(e => { kanka[e.id] = e; });
  data.forEach(e => { if (e.pai) (filhosDe[e.pai] = filhosDe[e.pai] || []).push(e); });
  locais.forEach(l => { if (l.kanka) kankaParaLocal[l.kanka] = l; });
  montarMundo();
  montarPjs();
  if (selecionado) abrirLugar(selecionado, false);
}

function montarMundo() {
  const box = $('#listaMundo'); box.innerHTML = '';
  const grupos = [
    ['Lugares fora do mapa', e => e.cat === 'location' && !kankaParaLocal[e.id] && !(e.pai && kanka[e.pai] && kanka[e.pai].cat === 'location')],
    ['Organizações', e => e.cat === 'organisation'],
    ['História', e => e.cat === 'event'],
    ['Conhecimento', e => e.cat === 'note'],
    ['Raças', e => e.cat === 'race']
  ];
  grupos.forEach(([titulo, filtro]) => {
    const itens = Object.values(kanka).filter(filtro).filter(e => e.nome !== '???').sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
    if (!itens.length) return;
    box.insertAdjacentHTML('beforeend', `<h3>${esc(titulo)} · ${itens.length}</h3>`);
    const ul = document.createElement('ul'); ul.className = 'lista';
    itens.forEach(e => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${esc(e.nome)}</span><span class="t">${esc(e.tipo || '')}</span>`;
      li.onclick = () => abrirEntidade(e);
      ul.appendChild(li);
    });
    box.appendChild(ul);
  });
  box.insertAdjacentHTML('beforeend', '<p class="dica">Textos copiados da <a href="https://app.kanka.io/w/plano-logos" target="_blank" rel="noopener" style="color:var(--turquesa)">wiki da guilda</a> em 28/11/2026.</p>');
}

function montarPjs() {
  const pjs = Object.values(kanka).filter(e => e.cat === 'character' && e.tipo === 'PJ').sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
  if (!pjs.length) return;
  const box = $('#qPjs .pjs'); box.innerHTML = '';
  pjs.forEach(e => {
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = `${e.thumb ? `<img src="${esc(e.thumb)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : ''}${esc(e.nome)}`;
    b.onclick = () => { $('#qNome').value = e.nome; };
    box.appendChild(b);
  });
  $('#qPjs').hidden = false;
}
const cx = $('#conexao');
function estadoConexao(ok) { cx.className = ok ? 'ok' : 'erro'; cx.title = ok ? 'Conectado: as anotações aparecem para todos' : 'Sem conexão com o banco'; }

let notas = [], trilhas = [];
const marcasNotas = {}, marcasTrilhas = {};
const camadaNotas = L.layerGroup().addTo(mapa);
const camadaTrilhas = L.layerGroup().addTo(mapa);

// ---------- Camadas (ligar/desligar) ----------
const CAMADAS = [
  ['lugares', 'Lugares da wiki'],
  ['minhasNotas', 'Minhas anotações'],
  ['outrasNotas', 'Anotações dos outros'],
  ['minhasTrilhas', 'Minhas trilhas'],
  ['outrasTrilhas', 'Trilhas dos outros']
];
const camadas = Object.assign({lugares: true, minhasNotas: true, outrasNotas: true, minhasTrilhas: true, outrasTrilhas: true}, ler('camadas', {}));
const ehMeu = i => meus.has(i.id) || (eu && i.personagem.toLowerCase() === eu.nome.toLowerCase());
function montarCamadas() {
  const box = $('#camadasLista'); box.innerHTML = '';
  CAMADAS.forEach(([k, rot]) => {
    const l = document.createElement('label');
    l.innerHTML = `<input type="checkbox" ${camadas[k] ? 'checked' : ''}> ${esc(rot)}`;
    l.querySelector('input').onchange = e => { camadas[k] = e.target.checked; guardar('camadas', camadas); aplicarCamadas(); };
    box.appendChild(l);
  });
}
function aplicarCamadas() {
  camadas.lugares ? camadaLugares.addTo(mapa) : camadaLugares.remove();
  desenhar();
}
$('#btCamadas').onclick = e => { e.stopPropagation(); $('#camadasPainel').hidden = !$('#camadasPainel').hidden; };
document.addEventListener('click', e => { if (!e.target.closest('#camadasPainel,#btCamadas')) $('#camadasPainel').hidden = true; });

async function carregarTudo() {
  if (!sb) { estadoConexao(false); return; }
  const [a, b] = await Promise.all([
    sb.from('galtherdara_notas').select('id,personagem,cor,y,x,titulo,texto,imagens,criado').order('criado'),
    sb.from('galtherdara_trilhas').select('id,personagem,cor,nome,pontos,criado').order('criado')
  ]);
  if (a.error || b.error) { console.error(a.error || b.error); estadoConexao(false); return; }
  estadoConexao(true);
  notas = a.data; trilhas = b.data;
  desenhar();
  if (diarioAberto) abrirDiario(diarioAberto, false);
}

const quando = s => new Date(s).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'});

function iconeNota(n) {
  const img = (n.imagens || []).length ? '<i class="tem-img"></i>' : '';
  return L.divIcon({className: '', html: `<div class="nota-pin" style="background:${esc(n.cor)}"><b>${esc((n.personagem[0] || '?').toUpperCase())}</b>${img}</div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30]});
}

function htmlImagens(lista) {
  if (!lista || !lista.length) return '';
  return `<div class="pop-imgs">${lista.map(u => `<img src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-ver="${esc(u)}">`).join('')}</div>`;
}
function popNota(n) {
  const meu = meus.has(n.id);
  return `<div class="pop-autor"><span class="bolinha" style="background:${esc(n.cor)}"></span><a href="#" data-diario="${esc(n.personagem)}">${esc(n.personagem)}</a> · ${quando(n.criado)}</div>
    <div class="pop-tit">${esc(n.titulo)}</div>${htmlImagens(n.imagens)}<p class="pop-txt">${esc(n.texto)}</p>
    <div class="pop-acoes"><button class="bt" data-diario="${esc(n.personagem)}">Diário</button>${meu ? `<button class="bt" data-editar="${n.id}">Editar</button><button class="bt" data-apagar-nota="${n.id}">Apagar</button>` : ''}</div>`;
}
function popTrilha(t) {
  const meu = meus.has(t.id);
  return `<div class="pop-autor"><span class="bolinha" style="background:${esc(t.cor)}"></span><a href="#" data-diario="${esc(t.personagem)}">${esc(t.personagem)}</a> · ${quando(t.criado)}</div>
    <div class="pop-tit">${esc(t.nome)}</div><p class="pop-txt">Trilha · ${distancia(t.pontos)}</p>
    <div class="pop-acoes"><button class="bt" data-diario="${esc(t.personagem)}">Diário</button>${meu ? `<button class="bt" data-editar-trilha="${t.id}">Editar</button><button class="bt" data-apagar-trilha="${t.id}">Apagar</button>` : ''}</div>`;
}
function distancia(pts) {
  let d = 0; for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return d < 1000 ? 'trecho curto' : `${(d / 1000).toFixed(1).replace('.', ',')} mil px de mapa`;
}

function visivel(i, tipo) {
  if (ocultos.has(i.personagem)) return false;
  const meu = ehMeu(i);
  return tipo === 'nota' ? camadas[meu ? 'minhasNotas' : 'outrasNotas'] : camadas[meu ? 'minhasTrilhas' : 'outrasTrilhas'];
}

function desenhar() {
  camadaNotas.clearLayers(); camadaTrilhas.clearLayers();
  for (const k in marcasNotas) delete marcasNotas[k];
  for (const k in marcasTrilhas) delete marcasTrilhas[k];
  trilhas.forEach(t => {
    if (!visivel(t, 'trilha') || (edicao && edicao.id === t.id)) return;
    const lls = t.pontos.map(p => P(p[0], p[1]));
    const g = L.featureGroup([
      L.polyline(lls, {color: '#000', weight: 7, opacity: .35, lineJoin: 'round'}),
      L.polyline(lls, {color: t.cor, weight: 4, opacity: .95, dashArray: '10 8', lineJoin: 'round'}),
      L.circleMarker(lls[0], {radius: 6, color: '#fff', weight: 2, fillColor: t.cor, fillOpacity: 1}),
      L.circleMarker(lls[lls.length - 1], {radius: 8, color: '#fff', weight: 2, fillColor: t.cor, fillOpacity: 1})
    ]).bindPopup(() => popTrilha(t)).bindTooltip(`${t.nome} · ${t.personagem}`, {className: 'rot', sticky: true});
    g.addTo(camadaTrilhas); marcasTrilhas[t.id] = g;
  });
  notas.forEach(n => {
    if (!visivel(n, 'nota')) return;
    const m = L.marker(P(n.y, n.x), {icon: iconeNota(n), riseOnHover: true})
      .bindPopup(() => popNota(n), {maxWidth: 320, minWidth: 240})
      .bindTooltip(`${n.titulo} · ${n.personagem}`, {className: 'rot', direction: 'top', offset: [0, -30]});
    m.addTo(camadaNotas); marcasNotas[n.id] = m;
  });
  listarPersonagens(); preencherNotasPerto();
}

function irParaNota(n) {
  ocultos.delete(n.personagem); camadas[ehMeu(n) ? 'minhasNotas' : 'outrasNotas'] = true; montarCamadas(); desenhar();
  const m = marcasNotas[n.id]; if (!m) return;
  mapa.flyTo(m.getLatLng(), Math.max(mapa.getZoom(), 4), {duration: 1});
  setTimeout(() => m.openPopup(), 1050);
}
function irParaTrilha(t) {
  ocultos.delete(t.personagem); camadas[ehMeu(t) ? 'minhasTrilhas' : 'outrasTrilhas'] = true; montarCamadas(); desenhar();
  const g = marcasTrilhas[t.id]; if (g) mapa.flyToBounds(g.getBounds().pad(0.3), {maxZoom: 4, duration: 1});
}

function listarPersonagens() {
  const grupos = new Map();
  [...notas, ...trilhas].forEach(i => {
    const g = grupos.get(i.personagem) || {nome: i.personagem, cor: i.cor, n: 0, t: 0};
    if ('titulo' in i) g.n++; else g.t++;
    g.cor = i.cor; grupos.set(i.personagem, g);
  });
  const ul = $('#listaPers'); ul.innerHTML = '';
  $('#persVazio').hidden = grupos.size > 0;
  [...grupos.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt')).forEach(g => {
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" ${ocultos.has(g.nome) ? '' : 'checked'} aria-label="Mostrar ${esc(g.nome)} no mapa">
      <span class="bolinha" style="background:${esc(g.cor)}"></span>
      <span class="pers-nome">${esc(g.nome)}<br><span class="cont">${g.n} nota${g.n === 1 ? '' : 's'} · ${g.t} trilha${g.t === 1 ? '' : 's'}</span></span>
      <button class="focar">Diário</button>`;
    li.querySelector('input').onclick = e => e.stopPropagation();
    li.querySelector('input').onchange = e => {
      e.target.checked ? ocultos.delete(g.nome) : ocultos.add(g.nome);
      guardar('ocultos', [...ocultos]); desenhar();
    };
    li.onclick = () => abrirDiario(g.nome);
    ul.appendChild(li);
  });
}

// ---------- Diário de um personagem ----------
let diarioAberto = null;
function abrirDiario(nome, voar = true) {
  const ns = notas.filter(n => n.personagem === nome), ts = trilhas.filter(t => t.personagem === nome);
  const itens = [...ns.map(n => ({tipo: 'nota', d: n.criado, o: n})), ...ts.map(t => ({tipo: 'trilha', d: t.criado, o: t}))].sort((a, b) => a.d.localeCompare(b.d));
  if (!itens.length) return;
  diarioAberto = nome;
  if (selecionado && pinos[selecionado.id]) pinos[selecionado.id].setIcon(iconePino(false));
  selecionado = null;
  const p = $('#lugar'), cor = (ns[0] || ts[0]).cor;
  p.querySelector('.capa').hidden = true;
  p.querySelectorAll('.aprox').forEach(x => x.remove());
  p.querySelector('.tipo').textContent = 'Diário de viagem';
  p.querySelector('h2').innerHTML = `<span class="bolinha grande" style="background:${esc(cor)}"></span>${esc(nome)}`;
  p.querySelector('.resumo').textContent = `${ns.length} anotaç${ns.length === 1 ? 'ão' : 'ões'} e ${ts.length} trilha${ts.length === 1 ? '' : 's'}, de ${quando(itens[0].d)} a ${quando(itens[itens.length - 1].d)}.`;
  const corpo = p.querySelector('.texto-guilda'); corpo.className = 'texto-guilda wiki';
  corpo.innerHTML = `<ol class="linha-tempo">${itens.map((it, i) => {
    const o = it.o;
    const mini = it.tipo === 'nota' && (o.imagens || []).length ? `<img src="${esc(o.imagens[0])}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '';
    return `<li data-i="${i}" style="--cor:${esc(o.cor)}"><span class="lt-data">${quando(it.d)} · ${it.tipo === 'nota' ? 'anotação' : 'trilha'}</span>
      <span class="lt-tit">${it.tipo === 'trilha' ? '✎ ' : ''}${esc(it.tipo === 'nota' ? o.titulo : o.nome)}</span>${mini}
      ${it.tipo === 'nota' && o.texto ? `<span class="lt-txt">${esc(o.texto.slice(0, 140))}${o.texto.length > 140 ? '…' : ''}</span>` : ''}</li>`;
  }).join('')}</ol>`;
  corpo.querySelectorAll('li').forEach(li => li.onclick = () => {
    const it = itens[+li.dataset.i];
    if (innerWidth < 760) fecharLugar();
    it.tipo === 'nota' ? irParaNota(it.o) : irParaTrilha(it.o);
  });
  p.querySelector('.secoes').innerHTML = '';
  p.querySelector('.filhos-box').hidden = true;
  p.querySelector('.fonte').hidden = true;
  p.querySelector('.no-mapa').hidden = true;
  p.scrollTop = 0; p.hidden = false; document.body.classList.add('com-lugar');
  if (voar) {
    ocultos.delete(nome); guardar('ocultos', [...ocultos]); desenhar();
    const pts = [...ns.map(n => P(n.y, n.x)), ...ts.flatMap(t => t.pontos.map(q => P(q[0], q[1])))];
    if (pts.length) {
      const b = L.latLngBounds(pts).pad(0.25), pad = innerWidth >= 760 ? L.point(360, 0) : L.point(0, innerHeight * 0.5);
      let z = mapa.getBoundsZoom(b, false, pad);
      z = Math.min(4, Math.max(mapa.getMinZoom() + 1, isFinite(z) ? Math.floor(z) : 2));
      const c = mapa.unproject(mapa.project(b.getCenter(), z).add(pad.divideBy(2)), z);
      mapa.flyTo(c, z, {duration: 1.1});
    }
    if (innerWidth < 760) document.body.classList.add('lado-fechado');
  }
}

function assinar() {
  if (!sb) return;
  let t;
  const recarregar = () => { clearTimeout(t); t = setTimeout(carregarTudo, 250); };
  sb.channel('galtherdara')
    .on('postgres_changes', {event: '*', schema: 'public', table: 'galtherdara_notas'}, recarregar)
    .on('postgres_changes', {event: '*', schema: 'public', table: 'galtherdara_trilhas'}, recarregar)
    .subscribe(s => { if (s === 'SUBSCRIBED') estadoConexao(true); if (s === 'CHANNEL_ERROR') estadoConexao(false); });
}

// Ações nos popups
mapa.on('popupopen', e => {
  const el = e.popup.getElement();
  el.querySelectorAll('[data-apagar-nota]').forEach(b => b.onclick = () => apagar('notas', b.dataset.apagarNota));
  el.querySelectorAll('[data-apagar-trilha]').forEach(b => b.onclick = () => apagar('trilhas', b.dataset.apagarTrilha));
  el.querySelectorAll('[data-editar]').forEach(b => b.onclick = () => editarNota(b.dataset.editar));
  el.querySelectorAll('[data-editar-trilha]').forEach(b => b.onclick = () => { const t = trilhas.find(x => x.id === b.dataset.editarTrilha); mapa.closePopup(); if (t) entrarModo('trilha', t); });
  el.querySelectorAll('[data-diario]').forEach(b => b.onclick = ev => { ev.preventDefault(); mapa.closePopup(); abrirDiario(b.dataset.diario); });
  el.querySelectorAll('[data-ver]').forEach(i => i.onclick = () => verImagem(i.dataset.ver));
});

function verImagem(u) {
  const v = $('#visor'); v.querySelector('img').src = u; v.hidden = false;
}
$('#visor').onclick = () => { $('#visor').hidden = true; };
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#visor').hidden = true; });

async function apagar(tabela, id) {
  if (!confirmarApagar()) return;
  mapa.closePopup();
  const {data, error} = await sb.rpc('galtherdara_apagar', {p_tabela: tabela, p_id: id, p_token: token});
  if (error || !data) { aviso('Não foi possível apagar.'); return; }
  meus.delete(id); salvarMeus(); aviso('Apagado.'); carregarTudo();
}
function confirmarApagar() { return window.confirm('Apagar de vez? Não dá para desfazer.'); }

// ---------- Quem sou eu ----------
function mostrarEu() {
  const b = $('#btQuem');
  b.querySelector('.bolinha').style.background = eu ? eu.cor : '#555';
  b.querySelector('.nome').textContent = eu ? eu.nome : 'Quem é você?';
}
let corEscolhida = null;
function abrirQuem() {
  return new Promise(res => {
    const d = $('#dQuem');
    $('#qNome').value = eu ? eu.nome : '';
    corEscolhida = eu ? eu.cor : CORES[Math.floor(Math.random() * CORES.length)];
    const box = $('#qCores'); box.innerHTML = '';
    CORES.forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Cor ' + c);
      if (c === corEscolhida) b.classList.add('sel');
      b.onclick = () => { corEscolhida = c; box.querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b)); };
      box.appendChild(b);
    });
    d.onclose = () => {
      if (d.returnValue === 'ok' && $('#qNome').value.trim()) {
        eu = {nome: $('#qNome').value.trim().slice(0, 40), cor: corEscolhida}; guardar('eu', eu); mostrarEu(); desenhar(); res(true);
      } else res(!!eu);
    };
    d.returnValue = ''; d.showModal(); setTimeout(() => $('#qNome').focus(), 50);
  });
}
$('#btQuem').onclick = abrirQuem;
async function garantirEu() { return eu ? true : abrirQuem(); }

// ---------- Imagens das anotações ----------
let imgsNota = [];   // [{url}] já enviadas ou {file, prev} novas
function mostrarImgsNota() {
  const box = $('#nImgs'); box.innerHTML = '';
  imgsNota.forEach((im, i) => {
    const d = document.createElement('div'); d.className = 'mini';
    d.innerHTML = `<img src="${esc(im.url || im.prev)}" alt="" referrerpolicy="no-referrer"><button type="button" aria-label="Tirar imagem">×</button>`;
    d.querySelector('button').onclick = () => { imgsNota.splice(i, 1); mostrarImgsNota(); };
    box.appendChild(d);
  });
  $('#nArquivoRot').hidden = imgsNota.length >= 4;
}
$('#nArquivo').onchange = e => {
  [...e.target.files].slice(0, 4 - imgsNota.length).forEach(f => {
    if (!f.type.startsWith('image/')) return;
    imgsNota.push({file: f, prev: URL.createObjectURL(f)});
  });
  e.target.value = ''; mostrarImgsNota();
};
function reduzir(file, max = 1600) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => b ? res(b) : rej(new Error('imagem')), 'image/webp', 0.82);
    };
    img.onerror = rej; img.src = URL.createObjectURL(file);
  });
}
async function enviarImagens() {
  const urls = [];
  for (const im of imgsNota) {
    if (im.url) { urls.push(im.url); continue; }
    const blob = await reduzir(im.file);
    if (blob.size > 2 * 1024 * 1024) throw new Error('grande');
    const nome = `notas/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`;
    const {error} = await sb.storage.from('galtherdara').upload(nome, blob, {contentType: 'image/webp', upsert: false});
    if (error) throw error;
    urls.push(sb.storage.from('galtherdara').getPublicUrl(nome).data.publicUrl);
  }
  return urls;
}

// ---------- Notas ----------
function abrirDialogo(id) {
  return new Promise(res => { const d = $(id); d.returnValue = ''; d.onclose = () => res(d.returnValue === 'ok'); d.showModal(); });
}
async function pedirNota(pos) {
  if (!(await garantirEu())) return;
  if (!sb) { aviso('Sem conexão com o banco.'); return; }
  $('#dNota .tit').textContent = 'Nova anotação';
  $('#nTitulo').value = ''; $('#nTexto').value = ''; imgsNota = []; mostrarImgsNota();
  if (!(await abrirDialogo('#dNota'))) return;
  const titulo = $('#nTitulo').value.trim(); if (!titulo) return;
  const y = Math.min(H, Math.max(0, pos[0])), x = Math.min(W, Math.max(0, pos[1]));
  let imagens = [];
  try { if (imgsNota.length) { aviso('Enviando imagens…', 8000); imagens = await enviarImagens(); } }
  catch (e) { console.error(e); aviso('Não foi possível enviar as imagens. A anotação foi salva sem elas.', 4000); imagens = []; }
  const {data, error} = await sb.rpc('galtherdara_nota_criar', {p_personagem: eu.nome, p_cor: eu.cor, p_y: y, p_x: x, p_titulo: titulo, p_texto: $('#nTexto').value, p_token: token, p_imagens: imagens});
  if (error) { console.error(error); aviso('Não foi possível salvar.'); return; }
  meus.add(data); salvarMeus(); aviso('Anotação salva. Todos já podem ver.');
  await carregarTudo();
  const m = marcasNotas[data]; if (m) m.openPopup();
}
async function editarNota(id) {
  const n = notas.find(x => x.id === id); if (!n) return;
  mapa.closePopup();
  $('#dNota .tit').textContent = 'Editar anotação';
  $('#nTitulo').value = n.titulo; $('#nTexto').value = n.texto;
  imgsNota = (n.imagens || []).map(u => ({url: u})); mostrarImgsNota();
  if (!(await abrirDialogo('#dNota'))) return;
  let imagens;
  try { aviso('Salvando…', 8000); imagens = await enviarImagens(); } catch (e) { console.error(e); aviso('Não foi possível enviar as imagens.'); return; }
  const {data, error} = await sb.rpc('galtherdara_nota_editar', {p_id: id, p_token: token, p_titulo: $('#nTitulo').value.trim() || n.titulo, p_texto: $('#nTexto').value, p_imagens: imagens});
  if (error || !data) { aviso('Não foi possível editar.'); return; }
  aviso('Anotação atualizada.'); carregarTudo();
}

// ---------- Modos (nota e trilha) ----------
// Trilha: desenhar à mão livre (arrastar), ponto a ponto (tocar) ou mover o mapa; pontos podem ser arrastados.
let modo = null, pontos = [], linhaTemp = null, alcas = null, edicao = null, ferramenta = ler('ferramenta', 'livre');
const cont = mapa.getContainer();

function entrarModo(m, trilha = null) {
  modo = m; edicao = trilha; document.body.classList.add('em-modo');
  $('#modo').hidden = false;
  const tr = m === 'trilha';
  $('#btConcluir').hidden = $('#btDesfazer').hidden = !tr;
  $('#ferrTrilha').hidden = !tr;
  fecharLugar();
  if (m === 'nota') { $('#modo .txt').textContent = 'Toque no mapa onde quer anotar.'; cont.style.cursor = 'crosshair'; }
  else {
    pontos = trilha ? trilha.pontos.map(p => [...p]) : [];
    historico = [];
    if (trilha) desenhar();
    escolherFerramenta(ferramenta);
    atualizarTrilhaTemp();
  }
}
function sairModo() {
  modo = null; document.body.classList.remove('em-modo');
  cont.style.cursor = ''; cont.style.touchAction = '';
  mapa.dragging.enable();
  $('#modo').hidden = true;
  if (linhaTemp) { linhaTemp.remove(); linhaTemp = null; }
  if (alcas) { alcas.remove(); alcas = null; }
  pontos = [];
  if (edicao) { edicao = null; desenhar(); }
}
function escolherFerramenta(f) {
  ferramenta = f; guardar('ferramenta', f);
  document.querySelectorAll('#ferrTrilha button').forEach(b => b.classList.toggle('ativo', b.dataset.f === f));
  if (f === 'livre') { mapa.dragging.disable(); cont.style.cursor = 'crosshair'; cont.style.touchAction = 'none'; }
  else if (f === 'pontos') { mapa.dragging.enable(); cont.style.cursor = 'crosshair'; cont.style.touchAction = ''; }
  else { mapa.dragging.enable(); cont.style.cursor = 'grab'; cont.style.touchAction = ''; }
  atualizarTrilhaTemp();
}
document.querySelectorAll('#ferrTrilha button').forEach(b => b.onclick = () => escolherFerramenta(b.dataset.f));

let historico = [];   // para desfazer (cópias de pontos)
const guardarHist = () => { historico.push(pontos.map(p => [...p])); if (historico.length > 50) historico.shift(); };

function atualizarTrilhaTemp(soLinha = false) {
  if (modo !== 'trilha') return;
  const cor = eu ? eu.cor : '#c9a45c';
  const lls = pontos.map(p => P(p[0], p[1]));
  if (!linhaTemp) linhaTemp = L.polyline([], {color: cor, weight: 4, dashArray: '10 8', lineJoin: 'round', interactive: false}).addTo(mapa);
  linhaTemp.setStyle({color: cor}); linhaTemp.setLatLngs(lls);
  if (!soLinha) {
    if (!alcas) alcas = L.layerGroup().addTo(mapa);
    alcas.clearLayers();
    // Alças arrastáveis para ajustar a linha (no máximo ~80 visíveis)
    const passo = Math.max(1, Math.ceil(pontos.length / 80));
    pontos.forEach((p, i) => {
      if (i % passo && i !== pontos.length - 1) return;
      const a = L.marker(P(p[0], p[1]), {draggable: true, icon: L.divIcon({className: '', html: `<div class="alca" style="border-color:${esc(cor)}"></div>`, iconSize: [16, 16], iconAnchor: [8, 8]})});
      a.on('dragstart', () => guardarHist());
      a.on('drag', e => { const [y, x] = PX(e.target.getLatLng()); pontos[i] = [Math.round(y), Math.round(x)]; atualizarTrilhaTemp(true); });
      a.on('dragend', () => atualizarTrilhaTemp());
      a.on('dblclick', e => { L.DomEvent.stop(e); guardarHist(); pontos.splice(i, 1); atualizarTrilhaTemp(); });
      a.addTo(alcas);
    });
  }
  const dica = {livre: 'Arraste para desenhar o caminho.', pontos: 'Toque no mapa ponto a ponto.', mover: 'Arraste o mapa à vontade.'}[ferramenta];
  $('#modo .txt').textContent = pontos.length < 2 ? dica : `${pontos.length} pontos. Arraste as bolinhas para ajustar; duplo clique apaga uma.`;
  $('#btConcluir').disabled = pontos.length < 2;
  $('#btDesfazer').disabled = !historico.length;
}

// Simplifica a linha desenhada à mão (Ramer–Douglas–Peucker), em pixels do mapa
function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  const d2 = (p, a, b) => { const dx = b[1] - a[1], dy = b[0] - a[0]; const l = dx * dx + dy * dy; let t = l ? ((p[1] - a[1]) * dx + (p[0] - a[0]) * dy) / l : 0; t = Math.max(0, Math.min(1, t)); const x = a[1] + t * dx, y = a[0] + t * dy; return (p[1] - x) ** 2 + (p[0] - y) ** 2; };
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) { const d = d2(pts[i], pts[0], pts[pts.length - 1]); if (d > max) { max = d; idx = i; } }
  if (max <= tol * tol) return [pts[0], pts[pts.length - 1]];
  return [...simplificar(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplificar(pts.slice(idx), tol)];
}

// Desenho à mão livre
let tracando = null;
cont.addEventListener('pointerdown', e => {
  if (modo !== 'trilha' || ferramenta !== 'livre' || e.button > 0) return;
  if (e.target.closest('.leaflet-marker-icon,.leaflet-control')) return;
  guardarHist();
  tracando = [];
  cont.setPointerCapture(e.pointerId);
  adicionarTraco(e);
});
cont.addEventListener('pointermove', e => { if (tracando) adicionarTraco(e); });
const fimTraco = () => {
  if (!tracando) return;
  const escala = Math.pow(2, ZMAX - mapa.getZoom());          // px do mapa por px de tela
  const novo = simplificar(tracando, 2.5 * escala);
  // liga ao final da linha que já existia
  pontos = pontos.slice(0, pontos.length - tracando.length).concat(novo);
  if (pontos.length > 300) pontos = simplificar(pontos, 6 * escala).slice(0, 300);
  tracando = null; atualizarTrilhaTemp();
};
cont.addEventListener('pointerup', fimTraco);
cont.addEventListener('pointercancel', fimTraco);
function adicionarTraco(e) {
  const r = cont.getBoundingClientRect();
  const ll = mapa.containerPointToLatLng([e.clientX - r.left, e.clientY - r.top]);
  const [y, x] = PX(ll);
  if (y < 0 || x < 0 || y > H || x > W) return;
  const p = [Math.round(y), Math.round(x)];
  const ult = tracando[tracando.length - 1];
  const escala = Math.pow(2, ZMAX - mapa.getZoom());
  if (ult && Math.hypot(p[0] - ult[0], p[1] - ult[1]) < 4 * escala) return;
  tracando.push(p); pontos.push(p);
  atualizarTrilhaTemp(true);
}

$('#btNota').onclick = async () => { if (await garantirEu()) entrarModo('nota'); };
$('#btTrilha').onclick = async () => { if (await garantirEu()) entrarModo('trilha'); };
$('#btCancelar').onclick = sairModo;
$('#btDesfazer').onclick = () => { if (historico.length) { pontos = historico.pop(); atualizarTrilhaTemp(); } };
$('#btConcluir').onclick = async () => {
  if (pontos.length < 2) return;
  $('#tNome').value = edicao ? edicao.nome : '';
  if (!(await abrirDialogo('#dTrilha'))) return;
  const nome = $('#tNome').value.trim(); if (!nome) return;
  if (edicao) {
    const {data, error} = await sb.rpc('galtherdara_trilha_editar', {p_id: edicao.id, p_token: token, p_nome: nome, p_pontos: pontos});
    if (error || !data) { console.error(error); aviso('Não foi possível salvar a trilha.'); return; }
    sairModo(); aviso('Trilha atualizada.'); carregarTudo(); return;
  }
  const {data, error} = await sb.rpc('galtherdara_trilha_criar', {p_personagem: eu.nome, p_cor: eu.cor, p_nome: nome, p_pontos: pontos, p_token: token});
  if (error) { console.error(error); aviso('Não foi possível salvar a trilha.'); return; }
  meus.add(data); salvarMeus(); sairModo(); aviso('Trilha salva. Todos já podem ver.'); carregarTudo();
};
mapa.on('click', e => {
  if (!modo) return;
  const [y, x] = PX(e.latlng);
  if (y < 0 || x < 0 || y > H || x > W) return;
  if (modo === 'nota') { sairModo(); pedirNota([y, x]); }
  else if (ferramenta === 'pontos' && pontos.length < 300) { guardarHist(); pontos.push([Math.round(y), Math.round(x)]); atualizarTrilhaTemp(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modo) sairModo(); });

// ---------- Busca ----------
const busca = $('#busca'), res = $('#buscaRes');
const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
busca.addEventListener('input', () => {
  const q = semAcento(busca.value.trim()); res.innerHTML = '';
  if (!q) { res.hidden = true; return; }
  const itens = [
    ...locais.filter(l => semAcento(l.nome).includes(q)).map(l => ({t: l.nome, s: TIPOS[l.tipo], ir: () => abrirLugar(l)})),
    ...notas.filter(n => semAcento(n.titulo + ' ' + n.texto + ' ' + n.personagem).includes(q)).map(n => ({t: n.titulo, s: 'Anotação de ' + n.personagem, ir: () => irParaNota(n)})),
    ...Object.values(kanka).filter(e => e.cat !== 'character' && !kankaParaLocal[e.id] && semAcento(e.nome).includes(q)).map(e => ({t: e.nome, s: (CATS[e.cat] || '') + (e.tipo ? ' · ' + e.tipo : '') + ' (wiki)', ir: () => abrirEntidade(e)})),
    ...trilhas.filter(t => semAcento(t.nome + ' ' + t.personagem).includes(q)).map(t => ({t: t.nome, s: 'Trilha de ' + t.personagem, ir: () => irParaTrilha(t)}))
  ].slice(0, 12);
  if (!itens.length) res.innerHTML = '<li><small>Nada encontrado.</small></li>';
  itens.forEach(i => {
    const li = document.createElement('li'); li.innerHTML = `${esc(i.t)}<small>${esc(i.s)}</small>`;
    li.onclick = () => { i.ir(); busca.value = ''; res.hidden = true; busca.blur(); };
    res.appendChild(li);
  });
  res.hidden = false;
});
busca.addEventListener('keydown', e => { if (e.key === 'Enter') { const li = res.querySelector('li'); if (li) li.click(); } if (e.key === 'Escape') { busca.value = ''; res.hidden = true; } });
document.addEventListener('click', e => { if (!e.target.closest('.busca')) res.hidden = true; });

// ---------- Painel lateral ----------
document.querySelectorAll('.abas button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.abas button').forEach(x => x.classList.toggle('ativa', x === b));
  document.querySelectorAll('.aba').forEach(a => a.classList.toggle('ativa', a.id === 'aba-' + b.dataset.aba));
});
$('#btMenu').onclick = () => document.body.classList.toggle('lado-fechado');
document.body.classList.add('lado-fechado');   // painel começa recolhido

// ---------- Entrada ----------
const entrada = $('#entrada');
mapa.setView(limites.getCenter(), mapa.getMinZoom(), {animate: false});
$('#btEntrar').onclick = () => {
  entrada.classList.add('sai');
  setTimeout(() => entrada.remove(), 1000);
  const cobre = mapa.getBoundsZoom(limites, true);
  mapa.flyTo(P(2900, 3900), Math.max(Math.ceil(cobre), mapa.getMinZoom() + 1), {duration: 2.2});
  setTimeout(() => !eu && aviso('Dica: escolha quem é você no canto de cima para anotar.', 4500), 2600);
};

// ---------- Início ----------
mostrarEu();
montarCamadas(); if (!camadas.lugares) camadaLugares.remove();
carregarLocais().then(carregarKanka).catch(e => { console.error(e); aviso('Não foi possível carregar os lugares.'); });
carregarTudo().then(assinar);
window.addEventListener('resize', () => mapa.invalidateSize());
})();
