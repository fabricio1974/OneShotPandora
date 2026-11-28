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
const VERSAO = 3;

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

L.tileLayer('tiles/{z}/{y}/{x}.webp', {
  minZoom: 0, maxNativeZoom: ZMAX, maxZoom: ZMAX + 2, noWrap: true, bounds: limites, tileSize: 256,
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
      .addTo(mapa);
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
  selecionado = null; $('#lugar').hidden = true; document.body.classList.remove('com-lugar');
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

async function carregarTudo() {
  if (!sb) { estadoConexao(false); return; }
  const [a, b] = await Promise.all([
    sb.from('galtherdara_notas').select('id,personagem,cor,y,x,titulo,texto,criado').order('criado'),
    sb.from('galtherdara_trilhas').select('id,personagem,cor,nome,pontos,criado').order('criado')
  ]);
  if (a.error || b.error) { console.error(a.error || b.error); estadoConexao(false); return; }
  estadoConexao(true);
  notas = a.data; trilhas = b.data;
  desenhar();
}

const quando = s => new Date(s).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'});

function iconeNota(n) {
  return L.divIcon({className: '', html: `<div class="nota-pin" style="background:${esc(n.cor)}"><b>${esc((n.personagem[0] || '?').toUpperCase())}</b></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30]});
}

function popNota(n) {
  const meu = meus.has(n.id);
  return `<div class="pop-autor"><span class="bolinha" style="background:${esc(n.cor)}"></span>${esc(n.personagem)} · ${quando(n.criado)}</div>
    <div class="pop-tit">${esc(n.titulo)}</div><p class="pop-txt">${esc(n.texto)}</p>
    ${meu ? `<div class="pop-acoes"><button class="bt" data-editar="${n.id}">Editar</button><button class="bt" data-apagar-nota="${n.id}">Apagar</button></div>` : ''}`;
}
function popTrilha(t) {
  const meu = meus.has(t.id);
  return `<div class="pop-autor"><span class="bolinha" style="background:${esc(t.cor)}"></span>${esc(t.personagem)} · ${quando(t.criado)}</div>
    <div class="pop-tit">${esc(t.nome)}</div><p class="pop-txt">${t.pontos.length} pontos</p>
    ${meu ? `<div class="pop-acoes"><button class="bt" data-apagar-trilha="${t.id}">Apagar</button></div>` : ''}`;
}

function desenhar() {
  camadaNotas.clearLayers(); camadaTrilhas.clearLayers();
  for (const k in marcasNotas) delete marcasNotas[k];
  for (const k in marcasTrilhas) delete marcasTrilhas[k];
  trilhas.forEach(t => {
    if (ocultos.has(t.personagem)) return;
    const lls = t.pontos.map(p => P(p[0], p[1]));
    const g = L.featureGroup([
      L.polyline(lls, {color: '#000', weight: 7, opacity: .35}),
      L.polyline(lls, {color: t.cor, weight: 4, opacity: .95, dashArray: '10 8'}),
      L.circleMarker(lls[0], {radius: 6, color: '#fff', weight: 2, fillColor: t.cor, fillOpacity: 1}),
      L.circleMarker(lls[lls.length - 1], {radius: 8, color: '#fff', weight: 2, fillColor: t.cor, fillOpacity: 1})
    ]).bindPopup(() => popTrilha(t)).bindTooltip(`${t.nome} · ${t.personagem}`, {className: 'rot', sticky: true});
    g.addTo(camadaTrilhas); marcasTrilhas[t.id] = g;
  });
  notas.forEach(n => {
    if (ocultos.has(n.personagem)) return;
    const m = L.marker(P(n.y, n.x), {icon: iconeNota(n), riseOnHover: true})
      .bindPopup(() => popNota(n), {maxWidth: 300})
      .bindTooltip(`${n.titulo} · ${n.personagem}`, {className: 'rot', direction: 'top', offset: [0, -30]});
    m.addTo(camadaNotas); marcasNotas[n.id] = m;
  });
  listarPersonagens(); preencherNotasPerto();
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
    li.innerHTML = `<input type="checkbox" ${ocultos.has(g.nome) ? '' : 'checked'} aria-label="Mostrar ${esc(g.nome)}">
      <span class="bolinha" style="background:${esc(g.cor)}"></span>
      <span>${esc(g.nome)}<br><span class="cont">${g.n} nota${g.n === 1 ? '' : 's'} · ${g.t} trilha${g.t === 1 ? '' : 's'}</span></span>
      <button class="focar">Ver</button>`;
    li.querySelector('input').onchange = e => {
      e.target.checked ? ocultos.delete(g.nome) : ocultos.add(g.nome);
      guardar('ocultos', [...ocultos]); desenhar();
    };
    li.querySelector('.focar').onclick = () => {
      ocultos.delete(g.nome); guardar('ocultos', [...ocultos]); desenhar();
      const pts = [];
      notas.filter(n => n.personagem === g.nome).forEach(n => pts.push(P(n.y, n.x)));
      trilhas.filter(t => t.personagem === g.nome).forEach(t => t.pontos.forEach(p => pts.push(P(p[0], p[1]))));
      if (pts.length) mapa.flyToBounds(L.latLngBounds(pts).pad(0.3), {maxZoom: 4, duration: 1.1});
      if (innerWidth < 760) document.body.classList.add('lado-fechado');
    };
    ul.appendChild(li);
  });
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
});

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
        eu = {nome: $('#qNome').value.trim().slice(0, 40), cor: corEscolhida}; guardar('eu', eu); mostrarEu(); res(true);
      } else res(!!eu);
    };
    d.returnValue = ''; d.showModal(); setTimeout(() => $('#qNome').focus(), 50);
  });
}
$('#btQuem').onclick = abrirQuem;
async function garantirEu() { return eu ? true : abrirQuem(); }

// ---------- Notas ----------
function abrirDialogo(id) {
  return new Promise(res => { const d = $(id); d.returnValue = ''; d.onclose = () => res(d.returnValue === 'ok'); d.showModal(); });
}
async function pedirNota(pos) {
  if (!(await garantirEu())) return;
  if (!sb) { aviso('Sem conexão com o banco.'); return; }
  $('#dNota .tit').textContent = 'Nova anotação';
  $('#nTitulo').value = ''; $('#nTexto').value = '';
  if (!(await abrirDialogo('#dNota'))) return;
  const titulo = $('#nTitulo').value.trim(); if (!titulo) return;
  const y = Math.min(H, Math.max(0, pos[0])), x = Math.min(W, Math.max(0, pos[1]));
  const {data, error} = await sb.rpc('galtherdara_nota_criar', {p_personagem: eu.nome, p_cor: eu.cor, p_y: y, p_x: x, p_titulo: titulo, p_texto: $('#nTexto').value, p_token: token});
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
  if (!(await abrirDialogo('#dNota'))) return;
  const {data, error} = await sb.rpc('galtherdara_nota_editar', {p_id: id, p_token: token, p_titulo: $('#nTitulo').value.trim() || n.titulo, p_texto: $('#nTexto').value});
  if (error || !data) { aviso('Não foi possível editar.'); return; }
  aviso('Anotação atualizada.'); carregarTudo();
}

// ---------- Modos (nota e trilha) ----------
let modo = null, pontos = [], linhaTemp = null, pontosTemp = null;
function entrarModo(m) {
  modo = m; document.body.classList.add('em-modo'); $('#mapa').classList.add('mapa-modo');
  document.querySelector('.leaflet-container').style.cursor = 'crosshair';
  $('#modo').hidden = false;
  $('#btConcluir').hidden = $('#btDesfazer').hidden = m !== 'trilha';
  if (m === 'nota') $('#modo .txt').textContent = 'Toque no mapa onde quer anotar.';
  else { pontos = []; atualizarTrilhaTemp(); }
  fecharLugar();
}
function sairModo() {
  modo = null; document.body.classList.remove('em-modo');
  document.querySelector('.leaflet-container').style.cursor = '';
  $('#modo').hidden = true;
  if (linhaTemp) { linhaTemp.remove(); linhaTemp = null; }
  if (pontosTemp) { pontosTemp.remove(); pontosTemp = null; }
  pontos = [];
}
function atualizarTrilhaTemp() {
  const cor = eu ? eu.cor : '#c9a45c';
  const lls = pontos.map(p => P(p[0], p[1]));
  if (!linhaTemp) linhaTemp = L.polyline([], {color: cor, weight: 4, dashArray: '10 8'}).addTo(mapa);
  if (!pontosTemp) pontosTemp = L.layerGroup().addTo(mapa);
  linhaTemp.setLatLngs(lls); pontosTemp.clearLayers();
  lls.forEach(ll => L.circleMarker(ll, {radius: 5, color: '#fff', weight: 2, fillColor: cor, fillOpacity: 1}).addTo(pontosTemp));
  $('#modo .txt').textContent = pontos.length < 2 ? `Toque no mapa ponto a ponto pelo caminho (${pontos.length}/2 no mínimo).` : `${pontos.length} pontos. Continue ou conclua.`;
  $('#btConcluir').disabled = pontos.length < 2;
}
$('#btNota').onclick = async () => { if (await garantirEu()) entrarModo('nota'); };
$('#btTrilha').onclick = async () => { if (await garantirEu()) entrarModo('trilha'); };
$('#btCancelar').onclick = sairModo;
$('#btDesfazer').onclick = () => { pontos.pop(); atualizarTrilhaTemp(); };
$('#btConcluir').onclick = async () => {
  if (pontos.length < 2) return;
  $('#tNome').value = '';
  if (!(await abrirDialogo('#dTrilha'))) return;
  const nome = $('#tNome').value.trim(); if (!nome) return;
  const {data, error} = await sb.rpc('galtherdara_trilha_criar', {p_personagem: eu.nome, p_cor: eu.cor, p_nome: nome, p_pontos: pontos, p_token: token});
  if (error) { console.error(error); aviso('Não foi possível salvar a trilha.'); return; }
  meus.add(data); salvarMeus(); sairModo(); aviso('Trilha salva. Todos já podem ver.'); carregarTudo();
};
mapa.on('click', e => {
  if (!modo) return;
  const [y, x] = PX(e.latlng);
  if (y < 0 || x < 0 || y > H || x > W) return;
  if (modo === 'nota') { sairModo(); pedirNota([y, x]); }
  else if (pontos.length < 300) { pontos.push([Math.round(y), Math.round(x)]); atualizarTrilhaTemp(); }
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
    ...notas.filter(n => semAcento(n.titulo + ' ' + n.texto + ' ' + n.personagem).includes(q)).map(n => ({t: n.titulo, s: 'Anotação de ' + n.personagem, ir: () => { ocultos.delete(n.personagem); desenhar(); const m = marcasNotas[n.id]; mapa.flyTo(m.getLatLng(), Math.max(mapa.getZoom(), 4)); setTimeout(() => m.openPopup(), 900); }})),
    ...Object.values(kanka).filter(e => e.cat !== 'character' && !kankaParaLocal[e.id] && semAcento(e.nome).includes(q)).map(e => ({t: e.nome, s: (CATS[e.cat] || '') + (e.tipo ? ' · ' + e.tipo : '') + ' (wiki)', ir: () => abrirEntidade(e)})),
    ...trilhas.filter(t => semAcento(t.nome + ' ' + t.personagem).includes(q)).map(t => ({t: t.nome, s: 'Trilha de ' + t.personagem, ir: () => { ocultos.delete(t.personagem); desenhar(); mapa.flyToBounds(marcasTrilhas[t.id].getBounds().pad(0.3), {maxZoom: 4}); }}))
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
if (innerWidth < 760) document.body.classList.add('lado-fechado');

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
carregarLocais().then(carregarKanka).catch(e => { console.error(e); aviso('Não foi possível carregar os lugares.'); });
carregarTudo().then(assinar);
window.addEventListener('resize', () => mapa.invalidateSize());
})();
