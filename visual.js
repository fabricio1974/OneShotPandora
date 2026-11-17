/* Aparência do site: 3 layouts e 5 paletas por layout. Fica salvo neste navegador (chave otl_visual).
   Carregado no <head> de index.html, combate.html e cartas.html; a aba "Ajustes" é montada por OTL.ui(). */
(function(){
  var PAL = {
    brasa:     {n:'Brasa',      e:'dark',  c:{fundo:'#0a0a0b',painel:'#121012',painel2:'#1a1612',linha:'#2f261d',marfim:'#f1e8dc',apagado:'#9b8f80',terracota:'#dd8440',terracota2:'#8a4a22',ouro:'#c9a24a',erro:'#e0685a',sobre:'#1a0f08',sombra:'rgba(0,0,0,.55)'}},
    meianoite: {n:'Meia-noite', e:'dark',  c:{fundo:'#070a12',painel:'#0d1320',painel2:'#131b2e',linha:'#23304c',marfim:'#e7edf8',apagado:'#8a97b3',terracota:'#6ea8ff',terracota2:'#2c5aa0',ouro:'#e3c06a',erro:'#ff7d7d',sobre:'#06101f',sombra:'rgba(0,0,0,.55)'}},
    floresta:  {n:'Floresta',   e:'dark',  c:{fundo:'#060a07',painel:'#0c120d',painel2:'#121b14',linha:'#223226',marfim:'#e9f1e3',apagado:'#8c9f8e',terracota:'#7fd08c',terracota2:'#2f6b3e',ouro:'#d2bd62',erro:'#ec7b6b',sobre:'#07140a',sombra:'rgba(0,0,0,.55)'}},
    ametista:  {n:'Ametista',   e:'dark',  c:{fundo:'#09070d',painel:'#110d17',painel2:'#181224',linha:'#30254a',marfim:'#f0e8f8',apagado:'#a094b6',terracota:'#c490ff',terracota2:'#6a40a3',ouro:'#e0c27a',erro:'#ff8099',sobre:'#14081f',sombra:'rgba(0,0,0,.55)'}},
    grafite:   {n:'Grafite',    e:'dark',  c:{fundo:'#0d0e10',painel:'#15171a',painel2:'#1d2024',linha:'#2d3137',marfim:'#eceef0',apagado:'#8a9099',terracota:'#f0c14b',terracota2:'#8f741e',ouro:'#d9a441',erro:'#f07a6a',sobre:'#1a1303',sombra:'rgba(0,0,0,.5)'}},
    carmim:    {n:'Carmim',     e:'dark',  c:{fundo:'#0c0607',painel:'#160b0d',painel2:'#201013',linha:'#3a1b21',marfim:'#f6e9e6',apagado:'#a58d8d',terracota:'#f0606c',terracota2:'#98303a',ouro:'#d9a95a',erro:'#ff9c8e',sobre:'#1f0508',sombra:'rgba(0,0,0,.55)'}},
    pergaminho:{n:'Pergaminho', e:'light', c:{fundo:'#f2ead9',painel:'#faf4e6',painel2:'#ece2cc',linha:'#d3c4a3',marfim:'#2b1e12',apagado:'#6d5b45',terracota:'#b4501a',terracota2:'#d9a273',ouro:'#8a6a12',erro:'#b3261e',sobre:'#fff8ef',sombra:'rgba(60,40,10,.22)'}}
  };
  var LAY = {
    1: {n:'Palco',  d:'Abas sublinhadas no topo e texto direto sobre o fundo. É o visual de antes, enxuto.', p:['brasa','meianoite','floresta','ametista','pergaminho']},
    2: {n:'Painel', d:'Menu fixo na lateral em tela larga (computador, tablet deitado); no celular as abas viram botões.', p:['grafite','meianoite','carmim','brasa','floresta']},
    3: {n:'Cartaz', d:'Cartões arredondados com sombra, abas em cápsula e a barra de música flutuando embaixo.', p:['ametista','brasa','carmim','pergaminho','grafite']}
  };
  var DEF = {l:1, p:{1:'brasa', 2:'grafite', 3:'ametista'}};
  var KEY = 'otl_visual';

  function ler(){
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && LAY[v.l]) {
        var p = v.p || {}, o = {};
        for (var k in LAY) o[k] = (PAL[p[k]] && LAY[k].p.indexOf(p[k]) >= 0) ? p[k] : DEF.p[k];
        return {l:+v.l, p:o};
      }
    } catch (e) {}
    return {l:DEF.l, p:{1:DEF.p[1], 2:DEF.p[2], 3:DEF.p[3]}};
  }
  var est = ler();

  var css = '';
  for (var id in PAL) {
    var t = 'color-scheme:' + PAL[id].e + ';';
    for (var k in PAL[id].c) t += '--' + k + ':' + PAL[id].c[k] + ';';
    css += ':root[data-paleta="' + id + '"]{' + t + '}';
  }
  var st = document.createElement('style'); st.id = 'otl-paletas'; st.textContent = css;
  document.head.appendChild(st);

  function aplicar(){
    var d = document.documentElement, pid = est.p[est.l];
    d.setAttribute('data-layout', String(est.l));
    d.setAttribute('data-paleta', pid);
    if (window.OTL_CARTAS) {   // cartas.html tem os próprios nomes de variáveis e cartas de papel: só paletas escuras
      var c = PAL[pid].e === 'dark' ? PAL[pid].c : PAL.brasa.c, s = d.style;
      s.setProperty('--fundo', c.fundo); s.setProperty('--painel', c.painel); s.setProperty('--linha', c.linha);
      s.setProperty('--terra', c.terracota); s.setProperty('--terra2', 'color-mix(in srgb,' + c.terracota + ' 72%,#fff)');
      s.setProperty('--texto', c.marfim); s.setProperty('--apagado', c.apagado);
    }
  }
  function salvar(){ try { localStorage.setItem(KEY, JSON.stringify(est)); } catch (e) {} }

  function h(tag, a, kids){
    var e = document.createElement(tag);
    for (var x in (a || {})) { if (x === 'class') e.className = a[x]; else if (x.slice(0, 2) === 'on') e[x] = a[x]; else e.setAttribute(x, a[x]); }
    (kids || []).forEach(function(c){ if (c != null) e.append(c.nodeType ? c : document.createTextNode(c)); });
    return e;
  }
  function mini(n){
    var b = function(c){ return h('i', {class:c}); };
    if (n === 1) return h('span', {class:'aj-mini m1', 'aria-hidden':'true'}, [h('span', {class:'t'}, [b('s'), b(''), b(''), b('')]), b('l'), b('l w'), b('l')]);
    if (n === 2) return h('span', {class:'aj-mini m2', 'aria-hidden':'true'}, [h('span', {class:'side'}, [b('s'), b(''), b('')]), h('span', {class:'corpo'}, [b('l'), b('l w'), b('l')])]);
    return h('span', {class:'aj-mini m3', 'aria-hidden':'true'}, [h('span', {class:'t'}, [b('s'), b(''), b('')]), h('span', {class:'cards'}, [b('c'), b('c')]), b('dock')]);
  }

  function ui(root){
    if (!root) return;
    function desenhar(){
      root.textContent = '';
      var lays = h('div', {class:'aj-lays', role:'group', 'aria-label':'Layout'});
      Object.keys(LAY).forEach(function(k){
        lays.append(h('button', {class:'aj-lay', 'aria-pressed':String(est.l === +k), onclick:function(){ est.l = +k; aplicar(); salvar(); desenhar(); }},
          [mini(+k), h('b', {}, [LAY[k].n]), h('span', {class:'sub'}, [LAY[k].d])]));
      });
      var pals = h('div', {class:'aj-pals', role:'group', 'aria-label':'Paleta de cores'});
      LAY[est.l].p.forEach(function(id){
        var c = PAL[id].c;
        pals.append(h('button', {class:'aj-pal', 'aria-pressed':String(est.p[est.l] === id), onclick:function(){ est.p[est.l] = id; aplicar(); salvar(); desenhar(); }},
          [h('span', {class:'sw', 'aria-hidden':'true', style:'background:' + c.fundo}, [
             h('i', {style:'background:' + c.painel2}), h('i', {style:'background:' + c.marfim}), h('i', {style:'background:' + c.terracota}), h('i', {style:'background:' + c.ouro})]),
           h('b', {}, [PAL[id].n]), h('span', {class:'sub'}, [PAL[id].e === 'light' ? 'Fundo claro' : 'Fundo escuro'])]));
      });
      root.append(
        h('h2', {}, ['Ajustes']),
        h('p', {class:'sub'}, ['Muda na hora e fica salvo neste navegador (vale também para as cartas). Cada layout lembra a própria paleta.']),
        h('h3', {}, ['Layout']), lays,
        h('h3', {}, ['Paleta de cores · ' + LAY[est.l].n]), pals,
        h('div', {class:'lin2'}, [h('button', {class:'peq', onclick:function(){ est.l = DEF.l; est.p = {1:DEF.p[1], 2:DEF.p[2], 3:DEF.p[3]}; aplicar(); salvar(); desenhar(); }}, ['Voltar ao visual de antes'])])
      );
    }
    desenhar();
  }

  window.OTL = {PAL:PAL, LAY:LAY, est:est, aplicar:aplicar, salvar:salvar, ui:ui};
  aplicar();
})();
