/* Mesa do Mestre: cabeçalho recolhível, menu lateral de tópicos (aba Mestre) e painel direito "Ambiente e sons".
   Carregado no fim do <body> de index.html e combate.html, depois do script principal (usa E, INIMIGOS, aba, desenhar...).
   Os sons são sintetizados no próprio aparelho (WebAudio): não dependem de internet nem de vídeo. */
(function(){
  'use strict';
  var KEY = 'otl_mesa';
  var S = {hdr:0, nav:1, dir:1, vol:70, cam:{}, fix:'', dicas:0, foco:1, retos:1, rail:1, rolar:0};
  try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && typeof v === 'object') { for (var k in S) if (k in v) S[k] = v[k]; if (!S.cam || typeof S.cam !== 'object') S.cam = {}; } } catch (e) {}
  function gravar(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function h(tag, a, kids){
    var e = document.createElement(tag);
    for (var x in (a || {})) { if (a[x] == null) continue; if (x === 'class') e.className = a[x]; else if (x.slice(0, 2) === 'on') e[x] = a[x]; else e.setAttribute(x, a[x]); }
    (kids || []).forEach(function(c){ if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
    return e;
  }
  var root = document.documentElement;

  /* ===================== MOTOR DE SOM (WebAudio) ===================== */
  var AU = OTL_AU(S);

  /* ---- frases em latim: voz do aparelho (italiano/latim, grave e lenta) ---- */
  function falar(txt, tribal){
    try {
      if (!window.speechSynthesis) return false;
      var u = new SpeechSynthesisUtterance(txt), vs = speechSynthesis.getVoices() || [];
      var vz = tribal ? (vs.filter(function(x){ return /^pt/i.test(x.lang); })[0]) : vs.filter(function(x){ return /^la/i.test(x.lang); })[0] || vs.filter(function(x){ return /^it/i.test(x.lang); })[0] || vs.filter(function(x){ return /^pt/i.test(x.lang); })[0];
      if (vz) { u.voice = vz; u.lang = vz.lang; } else u.lang = 'it-IT';
      u.rate = tribal ? .85 : .72; u.pitch = tribal ? .25 : .55; u.volume = Math.min(1, S.vol / 100 + .2); speechSynthesis.cancel(); speechSynthesis.speak(u); return true;
    } catch (e) { return false; }
  }

  /* ---- catálogo: nomes e sons de cada inimigo ---- */
  var EFN = {trovao:'Trovão', impacto:'Impacto', sino:'Sino grave', magia:'Magia', meteoro:'Meteoro', gravidade:'Gravidade', orbita:'Órbita', moedas:'Moedas (cobrança)', pincelada:'Pincelada', harpa:'Harpa', vitral:'Vitral quebrando',
    coroSubida:'Coro de anjos', luz:'Luz sagrada', espada:'Espada flamejante', trombeta:'Trombeta', corrente:'Correntes', flecha:'Flecha', uivo:'Uivo de lobo', assobio:'Assobio do caçador', chifre:'Chifre de guerra', rosnado:'Rosnado', tambor:'Tambor', rufar:'Rufar de tambores', estaca:'Estaca', sussurro:'Sussurros', relogio:'Relógio e sino', orgao:'Órgão grave', katana:'Katana saindo da bainha', passos:'Passos na terra', dragao:'Rugido de dragão', asas:'Asas enormes', fogoSopro:'Sopro de fogo'};
  var CAN = {vento:'Vento', chuva:'Chuva', mar:'Ondas', fogo:'Fogueira', trovoes:'Trovões distantes', grave:'Zumbido grave', cosmos:'Cosmos e gravidade', coro:'Coro (pad)', sinos:'Sinos ao longe', coracao:'Coração batendo', sussurros:'Sussurros', tambores:'Tambores tribais', floresta:'Floresta à noite'};
  var CAT = {
    viagem:{nome:'A viagem', ef:[], ca:['vento','floresta','fogo','mar','chuva'], fr:[]},
    momentos:{nome:'Momentos da história', ef:['sino','coroSubida','luz'], ca:['grave','coro','vento'], fr:[]},
    clima:{nome:'Ambiente e clima', ef:['trovao','uivo'], ca:['chuva','vento','mar','fogo','floresta','trovoes'], fr:[]},
    ozy:{nome:'Ozymandias', ef:['magia','meteoro','gravidade','orbita','moedas','trovao'], ca:['cosmos','trovoes','vento'], fr:['Memento mori','Sic transit gloria mundi','Omnia mea mecum porto','Tempus rerum imperator']},
    elodie:{nome:'Elizabeth', ef:['pincelada','harpa','vitral','magia'], ca:['mar','vento','sinos'], fr:['Ars longa, vita brevis','Lux et color','Fiat lux']},
    hildegarda:{nome:'Hildegarda', ef:['coroSubida','sino','luz','orgao'], ca:['coro','sinos','grave'], fr:['Spiritus Sanctus vivificans vitam','O vis aeternitatis','O vos angeli','Ave generosa','Kyrie eleison']},
    anjo:{nome:'O Anjo', ef:['espada','trombeta','coroSubida','luz'], ca:['coro','grave','fogo'], fr:['Gloria in excelsis Deo','Sanctus, sanctus, sanctus','Nolite timere','Dies irae']},
    esau:{nome:'Esaú', vz:'tribal', ef:['tambor','chifre','assobio','corrente','flecha','rosnado','uivo'], ca:['floresta','tambores','fogo','vento','coracao'], fr:[['Ka rago ni, tuh!','Eu vou te matar, agora!'],['Ni mubo! Ni ugo!','Você é fraco! Você morre!'],['Orga! Orga! Zuk nak!','Caçada! Caçada! A presa corre!'],['Kesh nak, zuk. Hura vahk ni.','Não corra, presa. O lobo sente o seu sangue.'],['Ugo, ugo, ugo! Ka rago vahk ni!','Morra, morra, morra! Eu levo o seu sangue!'],['Hura orga ni. Tuh ni ugo.','O lobo caça você. Agora você morre.']]},
    ezequiel:{nome:'Ezequiel', ef:['sussurro','relogio','orgao','sino'], ca:['sussurros','grave','sinos'], fr:['Tempus fugit','Videbis iterum','Memento']},
    jael:{nome:'Jael', ef:['rufar','tambor','estaca','trovao'], ca:['coracao','tambores','fogo'], fr:['Tempus et mors','Fortis et fidelis','Ad bellum']},
    akari:{nome:'Akari', ef:['katana','passos','impacto','flecha'], ca:['vento','coracao','chuva'], fr:[['Ozymandias! Você disse que ninguém ia morrer!','']]},
    thorian:{nome:'Thorian', ef:['dragao','asas','fogoSopro','trovao'], ca:['vento','trovoes','mar'], fr:[['Eu vi os reinos nascerem, criança. Nenhum durou.','']]}
  };
  /* perfil de voz de cada personagem (descrição em inglês, que a ElevenLabs entende melhor) */
  var VOZP = {
    esau:['Young wild male hunter in his early twenties, rough raspy guttural voice with a harsh tribal accent, aggressive and growling, Nordic steppe warrior', 'homem, ~22 anos, caçador tribal (chifres, arco)'],
    ezequiel:['Elderly West African man in his seventies, deep warm gravelly voice, slow and wise old sailor storyteller, Nigerian accent', 'homem, ~70 anos, africano, timoneiro'],
    jael:['Confident adult woman, clearly female voice, in her late twenties, strong husky voice, battle-hardened warrior with a firm direct tone, slight Eastern European accent', 'mulher, ~28 anos, guerreira de martelo'],
    hildegarda:['Young German woman, clearly female voice, in her early twenties, soft clear gentle voice, serene and pious, light German accent, like a cathedral choir singer speaking', 'mulher, ~22 anos, clériga alemã'],
    ozy:['Very old aristocratic man around ninety years old, deep raspy commanding voice, cold and arrogant, slow and measured, Mediterranean accent, ominous', 'homem, ~90 anos, encapuzado, avareza'],
    elodie:['Young woman in her early twenties, female voice, soft gentle and slightly shy, calm artistic tone, light French accent, speaking quietly like a painter', 'mulher jovem, ~20 anos, pintora de chapéu vermelho (Elizabeth)'],
    akari:['Young Japanese woman, female voice, in her early twenties, fierce determined voice with a Japanese accent, emotional, shouting and trembling with anger when confronting someone', 'mulher, ~22 anos, japonesa, samurai'],
    thorian:['Ancient wise dragon, enormous deep resonant androgynous voice, very slow and serene, mythic Eastern sage, calm authority', 'dragão ancestral, oriental, sereno'],
    anjo:['Androgynous celestial being, powerful ethereal resonant voice, solemn and awe-inspiring, echoing, terrifying holiness', 'anjo sombrio, andrógino']
  };
  /* vozes prontas da conta (a conta só tem 3 vagas de voz própria, então só Esaú e Ezequiel são criadas; as demais são vozes de biblioteca): fem = Akari, Elizabeth, Jael, Hildegarda */
  var VOZ_PADRAO = {"esau": "2zCx8HB0ozFoxQGJ3lwR", "ezequiel": "LBXo4JC51IOVPjEVdSIB", "ozy": "pqHfZKP75CvOlQylNhV4", "thorian": "nPczCjzI2devNBz1zQrb", "anjo": "SAz9YHcvj6GT2YYXdXww", "jael": "EXAVITQu4vr4xnSDxMaL", "hildegarda": "Xb7hH8MSUJpSbSDYk0k2", "elodie": "lWq4KDY8znfkV0DrK8Vb", "akari": "oi8rgjIfLgJRsQ6rbZh3"};
  var GEN_V = {esau:'male', ezequiel:'male', jael:'female', hildegarda:'female', ozy:'male', elodie:'female', akari:'female', thorian:'male', anjo:'male'};
  /* diálogo de Akari contra Ozymandias (campo: personagem, texto) */
  var DIAL = [
    ['akari','Ozymandias! Olhe para mim! Você disse que ninguém ia morrer!'],
    ['ozy','Eu disse muitas coisas, jovem. Palavras são moedas, e eu sempre soube gastá-las.'],
    ['akari','Não ouse! Eu vi os corpos! Eu vi os rostos! Você mentiu na minha cara, e eles pagaram por isso!'],
    ['ozy','Os mortos já não reclamam. Os vivos, sim. É por isso que ainda tenho o que fazer aqui.'],
    ['akari','Cale a boca! Cale a boca! Hoje a minha lâmina responde por cada um deles! Urusai! Hoje você paga!']
  ];
  var GERAL = {nome:'Geral', ef:['trovao','impacto','sino','magia','sussurro'], ca:['vento','chuva','mar','fogo','trovoes','grave','coro','sinos','coracao'], fr:[]};

  /* ===================== INIMIGO EM COMBATE ===================== */
  function ft(x){ return typeof x === 'string' ? x : x[0]; }
  var GRUPO = {anjo:'demonio'};   // o Anjo usa o grupo de músicas "O demônio"
  function noCombate(){
    var r = {atual:'', porque:'', presentes:[]};
    try {
      var m = E.m, vistos = {};
      (m.ini || []).forEach(function(c){ var i = inmDeLinha(c); if (i && CAT[i.id] && !vistos[i.id]) { vistos[i.id] = 1; r.presentes.push(i.id); } });
      if (S.fix && CAT[S.fix]) { r.atual = S.fix; r.porque = 'escolhido aqui'; return r; }
      if (m.inm && !m.inm.todos && CAT[m.inm.sel]) { r.atual = m.inm.sel; r.porque = 'o escolhido na ficha'; return r; }
      var c = m.ini && m.ini[m.turno], i = c && inmDeLinha(c);
      if (i && CAT[i.id]) { r.atual = i.id; r.porque = 'a vez dele'; return r; }
      if (r.presentes.length) { r.atual = r.presentes[0]; r.porque = 'na iniciativa'; }
    } catch (e) {}
    return r;
  }
  function grupoDe(id){ try { return E.grupos.filter(function(g){ return g.id === (GRUPO[id] || id); })[0] || null; } catch (e) { return null; } }


  /* ===================== VOZ REALISTA (ElevenLabs, gerada no seu navegador) ===================== */
  var VZ = {chave:'', vozes:[], voz:'', msg:'', ocupado:false};   // a chave fica só na memória desta aba: nunca é salva
  try { VZ.voz = localStorage.getItem('otl_voz') || ''; } catch (e) {}
  var idb = null;
  function bd(){ return idb || (idb = new Promise(function(ok, no){ var r = indexedDB.open('otl_falas', 1); r.onupgradeneeded = function(){ r.result.createObjectStore('a'); }; r.onsuccess = function(){ ok(r.result); }; r.onerror = function(){ no(r.error); }; })); }
  function bdLer(k){ return bd().then(function(d){ return new Promise(function(ok){ var q = d.transaction('a').objectStore('a').get(k); q.onsuccess = function(){ ok(q.result || null); }; q.onerror = function(){ ok(null); }; }); }).catch(function(){ return null; }); }
  function bdGravar(k, v){ return bd().then(function(d){ return new Promise(function(ok){ var t = d.transaction('a', 'readwrite'); t.objectStore('a').put(v, k); t.oncomplete = ok; t.onerror = ok; }); }); }
  function bdApagar(){ return bd().then(function(d){ return new Promise(function(ok){ var t = d.transaction('a', 'readwrite'); t.objectStore('a').clear(); t.oncomplete = ok; t.onerror = ok; }); }); }
  function chaveFala(id, t){ return id + '|' + t; }
  var tocandoFala = null;
  function fala(id, t, trib){
    bdLer(chaveFala(id, t)).then(function(b){
      if (!b && PRONTO.falas[chaveFala(id, t)]) { try { if (tocandoFala) tocandoFala.pause(); } catch (e) {} var a0 = new Audio('audio/' + PRONTO.falas[chaveFala(id, t)]); a0.volume = Math.min(1, S.vol / 100 + .2); tocandoFala = a0; a0.play().catch(function(){ falar(t, trib); }); return; }
      if (b) { try { if (tocandoFala) tocandoFala.pause(); } catch (e) {} var a = new Audio(URL.createObjectURL(b)); a.volume = Math.min(1, S.vol / 100 + .2); tocandoFala = a; a.play().catch(function(){ falar(t, trib); }); }
      else falar(t, trib);
    });
  }
  function eleven(caminho, corpo){
    return fetch('https://api.elevenlabs.io' + caminho, corpo ? {method:'POST', headers:{'xi-api-key':VZ.chave, 'Content-Type':'application/json', 'Accept':'audio/mpeg'}, body:JSON.stringify(corpo)} : {headers:{'xi-api-key':VZ.chave}});
  }
  function carregarVozes(){
    VZ.msg = 'Carregando as vozes…'; vozRedes();
    eleven('/v1/voices').then(function(r){ if (!r.ok) throw new Error('A chave não foi aceita (' + r.status + ').'); return r.json(); }).then(function(j){
      VZ.vozes = (j.voices || []).map(function(v){ return {id:v.voice_id, g:(v.labels && v.labels.gender) || '', n:v.name + (v.labels && v.labels.gender ? ' · ' + v.labels.gender : '')}; });
      if (!VZ.voz && VZ.vozes[0]) VZ.voz = VZ.vozes[0].id; VZ.msg = VZ.vozes.length + ' vozes carregadas.'; vozRedes();
    }).catch(function(e){ VZ.msg = 'Não deu: ' + e.message; vozRedes(); });
  }
  function gerarFalas(lista){   // lista: [[idInimigo, texto]]
    if (VZ.ocupado) return; VZ.ocupado = true; var feitas = 0, falhas = 0;
    (function prox(i){
      if (i >= lista.length) { VZ.ocupado = false; VZ.msg = 'Prontas: ' + feitas + ' falas' + (falhas ? ' (' + falhas + ' falharam)' : '') + '. Já funcionam sem a chave.'; vozRedes(); return; }
      VZ.msg = 'Gerando ' + (i + 1) + ' de ' + lista.length + '…'; vozRedes();
      eleven('/v1/text-to-speech/' + encodeURIComponent(vozDe(lista[i][0])) + '?output_format=mp3_44100_64', {text:lista[i][1], model_id:'eleven_multilingual_v2', voice_settings:{stability:.28, similarity_boost:.8, style:.75, use_speaker_boost:true}})
        .then(function(r){ if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function(b){ feitas++; return bdGravar(chaveFala(lista[i][0], lista[i][1]), b); })
        .catch(function(){ falhas++; }).then(function(){ prox(i + 1); });
    })(0);
  }
  function vozRedes(){ if (typeof ENG !== 'undefined' && ENG.on) engRender(); }
  function vozUI(idAtual){
    var chave = h('input', {type:'password', placeholder:'chave da ElevenLabs (não fica salva)', autocomplete:'off', 'aria-label':'Chave da ElevenLabs', oninput:function(ev){ VZ.chave = ev.target.value.trim(); }});
    chave.value = VZ.chave;
    var sel = h('select', {'aria-label':'Voz', onchange:function(ev){ VZ.voz = ev.target.value; try { localStorage.setItem('otl_voz', VZ.voz); } catch (e) {} }}, VZ.vozes.map(function(v){ var o = h('option', {value:v.id}, [v.n]); if (v.id === VZ.voz) o.selected = true; return o; }));
    var daqui = idAtual && CAT[idAtual] ? CAT[idAtual].fr.map(function(t){ return [idAtual, ft(t)]; }) : [];
    var todas = []; Object.keys(CAT).forEach(function(id){ CAT[id].fr.forEach(function(t){ todas.push([id, ft(t)]); }); });
    return h('div', {class:'dm-voz'}, [h('p', {class:'sub dm-nota'}, ['Gera as falas uma vez, com a sua conta, e guarda neste navegador. Depois dá para apagar a chave.']), chave,
      h('div', {class:'dm-efs'}, [h('button', {class:'peq', onclick:function(){ if (VZ.chave) carregarVozes(); else { VZ.msg = 'Cole a chave primeiro.'; vozRedes(); } }}, ['Carregar vozes'])]),
      VZ.vozes.length ? sel : null,
      VZ.vozes.length ? h('div', {class:'dm-efs'}, [(idAtual ? h('button', {class:'peq', onclick:function(){ gerarFalas(daqui); }}, ['Gerar as falas de ' + CAT[idAtual].nome]) : null), h('button', {class:'peq', onclick:function(){ gerarFalas(todas); }}, ['Gerar todas'])]) : null,
      h('div', {class:'dm-efs'}, [h('button', {class:'peq perigo', onclick:function(){ bdApagar().then(function(){ VZ.msg = 'Falas gravadas apagadas.'; vozRedes(); }); }}, ['Apagar falas gravadas'])]),
      VZ.msg ? h('p', {class:'sub dm-nota', role:'status'}, [VZ.msg]) : null]);
  }

  /* ===================== PAINEL DIREITO ===================== */
  var dir = h('aside', {id:'dirMesa', 'aria-label':'Ambiente e sons'});
  var abrirDir = h('button', {id:'dmAbrir', class:'lat-aba dir', 'aria-label':'Abrir o painel de ambiente e sons', onclick:function(){ S.dir = 1; gravar(); aplicar(); }}, ['Sons']);
  var assin = '', ultimo = '';
  function nivelCam(id){ return typeof S.cam[id] === 'number' ? S.cam[id] : 40; }
  function camadaUI(id){
    var on = AU.viva(id), li = h('div', {class:'dm-cam' + (on ? ' on' : '')});
    li.append(h('button', {class:'peq', 'aria-pressed':String(on), onclick:function(){ if (AU.viva(id)) AU.desliga(id); else AU.liga(id, nivelCam(id) / 100); desenhar2(true); }}, [CAN[id]]));
    if (on) li.append(h('input', {type:'range', min:'0', max:'100', value:String(nivelCam(id)), 'aria-label':'Volume de ' + CAN[id], oninput:function(ev){ S.cam[id] = +ev.target.value; AU.nivel(id, S.cam[id] / 100); }, onchange:gravar}));
    return li;
  }
  function efeitosUI(lista){ return h('div', {class:'dm-efs'}, lista.map(function(id){ return h('button', {class:'peq', onclick:function(){ AU.efeito(id); }}, [EFN[id]]); })); }
  function frasesUI(lista, trib, id){ return lista.length ? h('div', {class:'dm-frs'}, lista.map(function(x){ var t = ft(x); return h('button', {class:'peq', title:typeof x === 'string' ? 'Fala em voz grave e lenta' : x[1], onclick:function(){ fala(id, t, trib); }}, [t].concat(typeof x === 'string' ? [] : [h('small', {}, [x[1]])])); })) : null; }
  function musicasUI(id){
    var g = grupoDe(id); if (!g) return null;
    var todas = g.id === 'viagem' || g.id === 'momentos';   // viagem e momentos: mostra todas, as marcadas primeiro
    var fs = todas ? g.faixas.filter(function(f){ return f.usar; }).concat(g.faixas.filter(function(f){ return !f.usar; })) : g.faixas.filter(function(f){ return f.usar; });
    if (!fs.length) return h('p', {class:'sub dm-nota'}, ['Nenhuma música marcada para este inimigo na aba Seleção.']);
    var playing = (typeof tocando !== 'undefined') ? tocando : null;
    return h('div', {class:'dm-mus'}, fs.map(function(f){
      var on = playing === f;
      return h('button', {class:'dm-m' + (on ? ' on' : ''), 'aria-pressed':String(on), title:f.momento, onclick:function(){ try { tocar(f, 600, {fila:fs}); } catch (e) {} setTimeout(function(){ desenhar2(true); }, 250); }},
        [h('span', {class:'dm-mp'}, [on ? '■' : '▶']), h('span', {class:'dm-mn'}, [f.nome, h('small', {}, [f.momento])])]);
    }));
  }
  function secao(t, corpo, aberto){ return corpo ? h('details', {class:'dm-sec', open:aberto ? '' : null}, [h('summary', {}, [t]), corpo]) : null; }

  /* ===================== SONS GERADOS (ElevenLabs) E ENGRENAGEM ===================== */
  var CFGK = 'otl_snd';
  var PDEF = {   // prompts padrão (em inglês: a ElevenLabs entende melhor) e duração em segundos
    trovao:['Loud close thunderclap with a long rolling rumble', 5], impacto:['Heavy cinematic impact boom with deep sub bass hit', 2], sino:['Single deep church bell strike with long resonant decay', 5],
    magia:['Magical spell cast whoosh with shimmering arcane sparkles', 3], meteoro:['Meteor falling from the sky with a screaming whistle then a massive explosion impact', 5], gravidade:['Gravity spell, deep warping sub bass pulling distortion', 4],
    orbita:['Orbiting energy sphere whooshing around, rising fantasy whirl', 3], moedas:['Handful of gold coins dropping and clinking on a stone floor', 2], pincelada:['Wet paintbrush stroke swish on canvas with a magical shimmer', 2],
    harpa:['Ascending harp glissando, magical and bright', 3], vitral:['Stained glass window shattering into many pieces', 3], coroSubida:['Angelic choir sustained chord rising, ethereal, cathedral reverb', 6],
    luz:['Holy light shimmer, divine chime swell', 4], espada:['Flaming sword swing whoosh with fire crackle', 2], trombeta:['Epic heavenly trumpet fanfare in a cathedral', 5],
    corrente:['Heavy iron chains rattling and dragging on stone', 3], flecha:['Arrow whooshing past then thudding into wood', 2], uivo:['Lone wolf howling at night, long and mournful, forest echo', 6],
    tambor:['Deep tribal war drum single hit, hollow wooden, echo in a forest', 2], rufar:['Tribal war drums rolling crescendo', 5], estaca:['Wooden stake driven into the ground, heavy thud', 2],
    sussurro:['Eerie ghostly whispers surrounding the listener', 4], relogio:['Old grandfather clock ticking then a heavy bell chime', 6], orgao:['Deep ominous church organ low chord', 6],
    assobio:['Hunter whistling a sharp two note whistle signal outdoors', 2], chifre:['Tribal war horn blast, deep, echoing across a valley', 4], rosnado:['Large beast growling low and menacing', 3],
    vento:['Steady wind blowing across open plains, seamless ambient loop', 20], chuva:['Steady rain falling on leaves and ground, seamless ambient loop', 20], mar:['Ocean waves rolling onto a shore, seamless ambient loop', 20],
    fogo:['Campfire crackling softly, seamless ambient loop', 20], trovoes:['Distant thunder rumbling in a storm, seamless ambient loop', 20], grave:['Low dark ominous cinematic drone, seamless ambient loop', 20],
    cosmos:['Deep space cosmic ambient drone with shimmering pads, seamless loop', 20], coro:['Ethereal choir pad sustained, cathedral ambience, seamless loop', 20], sinos:['Distant church bells ringing slowly, ambient, seamless loop', 20],
    coracao:['Slow deep heartbeat thumping, seamless ambient loop', 20], sussurros:['Ghostly whispers ambience, seamless loop', 20], tambores:['Distant tribal war drums steady rhythm, seamless loop', 20],
    katana:['Samurai katana drawn from its scabbard with a sharp metallic ring, then a swift slash', 2], passos:['Heavy determined footsteps on dry dirt and gravel', 3], dragao:['Enormous ancient dragon roar, deep and resonant, long echo over mountains', 5], asas:['Giant dragon wings flapping slowly with powerful gusts of wind', 4], fogoSopro:['Dragon fire breath roaring, intense flames whoosh', 4],
    floresta:['Night forest ambience with crickets and soft wind, seamless loop', 20]
  };
  var CFG = {p:{}, fr:{}, voz:{}, rm:{}};
  try { var cj = JSON.parse(localStorage.getItem(CFGK) || 'null'); if (cj && typeof cj === 'object') { CFG.p = cj.p || {}; CFG.fr = cj.fr || {}; CFG.voz = cj.voz || {}; CFG.rm = cj.rm || {}; } } catch (e) {}
  function cfgGravar(){ try { localStorage.setItem(CFGK, JSON.stringify(CFG)); } catch (e) {} }
  function pDe(id){ var d = PDEF[id] || ['', 3], c = CFG.p[id] || {}; return {t:c.t != null ? c.t : d[0], d:c.d != null ? c.d : d[1]}; }
  function vis(l){ return l.filter(function(id){ return !CFG.rm[id]; }); }
  function frDe(id){ return CFG.fr[id] || CAT[id].fr; }

  /* sons novos e prompts vêm de tools/prompts_audio.json (um arquivo só, revisado): sobrescreve a lista de efeitos e fundos de cada personagem */
  try { fetch('tools/prompts_audio.json', {cache:'no-cache'}).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ if (!j || !j.sons) return;
    var lista = {};
    j.sons.forEach(function(s){ PDEF[s.id] = [s.prompt, s.seg]; if (s.cat) CATG[s.id] = s.cat; if (s.tipo === 'cam') CAN[s.id] = s.nome || s.id; else EFN[s.id] = s.nome || s.id;
      if (s.dono === 'mapa' && !CAT.mapa) CAT.mapa = {nome:'Mapa e lugares', ef:[], ca:[], fr:[]}; var c = CAT[s.dono]; if (!c) return;
      (lista[s.dono] = lista[s.dono] || {ef:[], ca:[]})[s.tipo === 'cam' ? 'ca' : 'ef'].push(s.id); });
    Object.keys(lista).forEach(function(k){ if (k === 'clima') { CAT.clima.ef = CAT.clima.ef.concat(lista[k].ef.filter(function(i){ return CAT.clima.ef.indexOf(i) < 0; })); CAT.clima.ca = CAT.clima.ca.concat(lista[k].ca.filter(function(i){ return CAT.clima.ca.indexOf(i) < 0; })); return; } if (lista[k].ef.length) CAT[k].ef = lista[k].ef; if (lista[k].ca.length) CAT[k].ca = lista[k].ca; });
    assin = ''; try { desenhar2(true); } catch (e) {} try { mixPinta(); } catch (e) {} }).catch(function(){}); } catch (e) {}
  var GEN = {}, LOOPS = {};     // 'fx|id' / 'cam|id' -> endereço do áudio gerado
  function ehCam(id){ return !!CAN[id]; }
  function chG(id){ return (ehCam(id) ? 'cam|' : 'fx|') + id; }
  function volG(){ return Math.min(1, S.vol / 100 * 1.15); }
  bd().then(function(d){ var q = d.transaction('a').objectStore('a').openCursor(); q.onsuccess = function(){ var c = q.result; if (!c) { if (ENG.on) engRender(); return; } var k = String(c.key); if (/^(fx|cam)\|/.test(k)) GEN[k] = URL.createObjectURL(c.value); c.continue(); }; }).catch(function(){});
  var PRONTO = {falas:{}};
  try { fetch('audio/manifest.json', {cache:'no-cache'}).then(function(r){ return r.ok ? r.json() : null; }).then(function(m){ if (!m) return;
    ['fx','cam'].forEach(function(t){ Object.keys(m[t] || {}).forEach(function(id){ if (!GEN[t + '|' + id]) GEN[t + '|' + id] = 'audio/' + m[t][id]; }); });
    PRONTO.falas = m.falas || {}; if (ENG.on) engRender(); try { mixPinta(); } catch (e) {} }).catch(function(){}); } catch (e) {}
  var _ef = AU.efeito, _li = AU.liga, _ni = AU.nivel, _de = AU.desliga, _vi = AU.viva, _tu = AU.tudo, _ms = AU.mestre;
  var SIN = {katana:'flecha', passos:'tambor', dragao:'rosnado', asas:'chifre', fogoSopro:'trovao'};
  var REMV = {};
  function rem(){ return window.OTLREM && window.OTLREM.on(); }
  AU.efeito = function(id){ if (CFG.rm[id]) return; if (rem()) { window.OTLREM.au('efeito', [id]); return; } var u = GEN['fx|' + id]; if (!u) return _ef(SIN[id] || id); var a = new Audio(u); a.volume = volG(); a.play().catch(function(){ _ef(SIN[id] || id); }); };
  AU.liga = function(id, nv){ if (CFG.rm[id]) return; if (rem()) { REMV[id] = 1; window.OTLREM.au('liga', [id, nv]); return; } var u = GEN['cam|' + id]; if (!u) return _li(id, nv); if (LOOPS[id]) return; var a = new Audio(u); a.loop = true; a.volume = Math.min(1, nv * volG() * 1.6); LOOPS[id] = a; a.play().catch(function(){}); };
  AU.nivel = function(id, nv){ if (REMV[id]) { if (rem()) window.OTLREM.au('nivel', [id, nv]); return; } if (LOOPS[id]) LOOPS[id].volume = Math.min(1, nv * volG() * 1.6); else _ni(id, nv); };
  AU.desliga = function(id){ if (REMV[id]) { delete REMV[id]; if (window.OTLREM) window.OTLREM.au('desliga', [id]); return; } var a = LOOPS[id]; if (a) { delete LOOPS[id]; a.pause(); } else _de(id); };
  AU.viva = function(id){ return !!REMV[id] || !!LOOPS[id] || _vi(id); };
  AU.mestre = function(p){ _ms(p); if (rem()) window.OTLREM.au('mestre', [p]); };
  AU.tudo = function(){ if (Object.keys(REMV).length || rem()) { REMV = {}; if (window.OTLREM) window.OTLREM.au('tudo', []); } Object.keys(LOOPS).forEach(function(k){ LOOPS[k].pause(); delete LOOPS[k]; }); try { if (tocandoFala) tocandoFala.pause(); } catch (e) {} _tu(); };
  function gerarSom(id){
    var p = pDe(id), corpo = {text:p.t, prompt_influence:ehCam(id) ? .6 : .5, model_id:'eleven_text_to_sound_v3'};
    if (ehCam(id) && !/clearly audible/.test(corpo.text)) corpo.text += ', recorded close up and clearly audible at full volume';
    if (p.d) corpo.duration_seconds = Math.max(.5, Math.min(30, +p.d)); if (ehCam(id)) corpo.loop = true;
    return eleven('/v1/sound-generation', corpo).then(function(r){ if (!r.ok) return r.text().then(function(t){ throw new Error(r.status + ' ' + t.slice(0, 80)); }); return r.blob(); })
      .then(function(b){ var k = chG(id); if (GEN[k]) URL.revokeObjectURL(GEN[k]); GEN[k] = URL.createObjectURL(b); return bdGravar(k, b); });
  }
  function apagarSom(id){ var k = chG(id); if (GEN[k]) { URL.revokeObjectURL(GEN[k]); delete GEN[k]; } return bd().then(function(d){ return new Promise(function(ok){ var t = d.transaction('a', 'readwrite'); t.objectStore('a').delete(k); t.oncomplete = ok; t.onerror = ok; }); }); }
  function fila(tarefas, rotulo){   // tarefas: funções que devolvem promessas, uma por vez
    if (VZ.ocupado) return; if (!VZ.chave) { VZ.msg = 'Cole a chave primeiro.'; engRender(); return; }
    VZ.ocupado = true; var ok = 0, mal = 0, ult = '';
    (function prox(i){
      if (i >= tarefas.length) { VZ.ocupado = false; VZ.msg = rotulo + ': ' + ok + ' prontos' + (mal ? ', ' + mal + ' falharam (' + ult + ')' : '') + '.'; engRender(); return; }
      VZ.msg = rotulo + ': ' + (i + 1) + ' de ' + tarefas.length + '…'; engRender();
      tarefas[i]().then(function(){ ok++; }).catch(function(e){ mal++; ult = e.message; }).then(function(){ prox(i + 1); });
    })(0);
  }
  var ENG = {on:false, alvo:''};
  function linhaSom(id){
    var p = pDe(id), tem = !!GEN[chG(id)], loop = ehCam(id);
    var t = h('textarea', {rows:'3', class:'en-t', 'aria-label':'Descrição do som ' + (EFN[id] || CAN[id]), onchange:function(ev){ (CFG.p[id] = CFG.p[id] || {}).t = ev.target.value; cfgGravar(); }}, [p.t]);
    var d = h('input', {type:'number', min:'1', max:'30', value:String(p.d), class:'dur', 'aria-label':'Duração em segundos', onchange:function(ev){ (CFG.p[id] = CFG.p[id] || {}).d = +ev.target.value; cfgGravar(); }});
    return h('div', {class:'en-lin'}, [h('div', {class:'en-n'}, [h('b', {}, [EFN[id] || CAN[id]]), h('span', {class:'sub'}, [tem ? ' · gerado' : ' · sintético'])]), t,
      h('div', {class:'dm-efs'}, [d, h('span', {class:'sub'}, ['s']),
        h('button', {class:'peq', onclick:function(){ if (loop) { if (AU.viva(id)) AU.desliga(id); else AU.liga(id, .5); engRender(); } else AU.efeito(id); }}, [loop ? (AU.viva(id) ? '■' : '▶') : '▶']),
        h('button', {class:'peq', onclick:function(){ fila([function(){ return gerarSom(id); }], EFN[id] || CAN[id]); }}, [tem ? 'Gerar de novo' : 'Gerar']),
        tem ? h('button', {class:'peq', title:'Apaga o som gerado e volta ao som sintético simples', onclick:function(){ apagarSom(id).then(engRender); }}, ['Usar sintético']) : null,
        h('button', {class:'peq perigo', title:'Tira este som da lista (dá para restaurar em Removidos)', onclick:function(){ if (loop && AU.viva(id)) AU.desliga(id); CFG.rm[id] = 1; cfgGravar(); assin = ''; engRender(); }}, ['Remover'])])]);
  }
  function linhaFala(id, i){
    var lista = frDe(id), x = lista[i], t = ft(x), tr = typeof x === 'string' ? '' : x[1];
    function salvar(novoT, novoTr){ var l = frDe(id).map(function(y){ return typeof y === 'string' ? [y, ''] : y.slice(); }); l[i] = [novoT, novoTr]; CFG.fr[id] = l; cfgGravar(); }
    var it = h('input', {type:'text', value:t, 'aria-label':'Texto da fala', onchange:function(ev){ salvar(ev.target.value, tr); engRender(); }});
    var ir = h('input', {type:'text', value:tr, placeholder:'tradução (só para você)', 'aria-label':'Tradução', onchange:function(ev){ salvar(t, ev.target.value); }});
    var tem = null; bdLer(chaveFala(id, t)).then(function(b){ var s = document.getElementById('fs-' + id + i); if (s) s.textContent = b ? ' · gravada' : ' · voz do aparelho'; });
    return h('div', {class:'en-lin'}, [h('div', {class:'en-n'}, [h('b', {}, ['Fala ' + (i + 1)]), h('span', {class:'sub', id:'fs-' + id + i}, [''])]), it, ir,
      h('div', {class:'dm-efs'}, [h('button', {class:'peq', onclick:function(){ fala(id, t, !!CAT[id].vz); }}, ['▶']),
        h('button', {class:'peq', onclick:function(){ fila([function(){ return gerarFalaUma(id, t); }], 'Fala'); }}, ['Gerar voz']),
        h('button', {class:'peq perigo', onclick:function(){ var l = frDe(id).slice(); l.splice(i, 1); CFG.fr[id] = l; cfgGravar(); engRender(); }}, ['Remover'])])]);
  }
  function vozDe(id){
    if (CFG.voz[id] && CFG.voz[id].id) return CFG.voz[id].id;
    if (VOZ_PADRAO[id]) return VOZ_PADRAO[id];
    var g = GEN_V[id], c = VZ.vozes.filter(function(v){ return v.g === g; })[0];   // sem voz própria: pega uma do gênero certo
    return c ? c.id : (VZ.vozes.filter(function(v){ return v.id === VZ.voz; })[0] || {g:g}).g === g ? VZ.voz : '';
  }
  function gerarFalaUma(id, t){
    if (!vozDe(id)) return Promise.reject(new Error('sem voz ' + (GEN_V[id] === 'female' ? 'feminina' : 'masculina')));
    return eleven('/v1/text-to-speech/' + encodeURIComponent(vozDe(id)) + '?output_format=mp3_44100_64', {text:t, model_id:'eleven_multilingual_v2', voice_settings:{stability:.28, similarity_boost:.8, style:.75, use_speaker_boost:true}})
      .then(function(r){ if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function(b){ return bdGravar(chaveFala(id, t), b); });
  }
  /* ---- voz própria de cada personagem: Voice Design da ElevenLabs a partir da descrição ---- */
  function criarVoz(id){
    var desc = (CFG.voz[id] && CFG.voz[id].d) || VOZP[id][0];
    VZ.msg = 'Criando a voz de ' + CAT[id].nome + '…'; vozRedes();
    return eleven('/v1/text-to-voice/design', {voice_description:desc, auto_generate_text:true})
      .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(j){ var pv = (j.previews || [])[0]; if (!pv) throw new Error('sem prévia');
        return eleven('/v1/text-to-voice', {voice_name:'OTL ' + CAT[id].nome, voice_description:desc, generated_voice_id:pv.generated_voice_id}); })
      .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(j){ CFG.voz[id] = {id:j.voice_id, d:desc}; cfgGravar(); VZ.msg = 'Voz de ' + CAT[id].nome + ' criada.'; vozRedes(); })
      .catch(function(e){ VZ.msg = 'Não criou a voz de ' + CAT[id].nome + ' (' + e.message + '). Escolha uma da lista.'; vozRedes(); });
  }
  function vozPersonagemUI(id){
    if (!VOZP[id]) return null;
    var cur = CFG.voz[id] || {}, desc = cur.d || VOZP[id][0];
    var ta = h('textarea', {rows:'4', 'aria-label':'Descrição da voz de ' + CAT[id].nome, onchange:function(ev){ CFG.voz[id] = Object.assign({}, CFG.voz[id], {d:ev.target.value}); cfgGravar(); }}, [desc]);
    var sel = VZ.vozes.length ? h('select', {'aria-label':'Voz de ' + CAT[id].nome, onchange:function(ev){ CFG.voz[id] = Object.assign({}, CFG.voz[id], {id:ev.target.value}); cfgGravar(); vozRedes(); }},
      [h('option', {value:''}, ['(voz geral)'])].concat(VZ.vozes.map(function(v){ var o = h('option', {value:v.id}, [v.n]); if (v.id === cur.id) o.selected = true; return o; }))) : null;
    return h('div', {class:'dm-voz'}, [h('p', {class:'sub dm-nota'}, ['Pela imagem: ' + VOZP[id][1] + '.']), ta,
      h('div', {class:'dm-efs'}, [h('button', {class:'peq', onclick:function(){ if (!VZ.chave) { VZ.msg = 'Cole a chave primeiro.'; vozRedes(); return; } criarVoz(id); }}, [cur.id ? 'Recriar a voz' : 'Criar a voz']),
        cur.id ? h('span', {class:'sub'}, ['voz pronta']) : null]), sel]);
  }
  function dialogoUI(){
    function tocarSeq(i){ if (i >= DIAL.length) return; var d = DIAL[i]; bdLer(chaveFala(d[0], d[1])).then(function(b){
      var u = b ? URL.createObjectURL(b) : (PRONTO.falas[chaveFala(d[0], d[1])] ? 'audio/' + PRONTO.falas[chaveFala(d[0], d[1])] : '');
      if (!u) { falar(d[1]); setTimeout(function(){ tocarSeq(i + 1); }, 4000); return; }
      var a = new Audio(u); a.volume = Math.min(1, S.vol / 100 + .2); a.onended = function(){ tocarSeq(i + 1); }; a.play().catch(function(){ tocarSeq(i + 1); }); }); }
    return h('div', {}, [h('p', {class:'sub dm-nota'}, ['Akari enfrenta Ozymandias por ter matado depois de dizer que não mataria.'])].concat(DIAL.map(function(d){ return h('p', {class:'sub'}, [CAT[d[0]].nome + ': ' + d[1]]); })).concat([
      h('div', {class:'dm-efs'}, [h('button', {class:'peq', onclick:function(){ tocarSeq(0); }}, ['▶ Tocar o diálogo']),
        h('button', {class:'peq', onclick:function(){ if (!VZ.chave) { VZ.msg = 'Cole a chave primeiro.'; engRender(); return; } fila(DIAL.map(function(d){ return function(){ return gerarFalaUma(d[0], d[1]); }; }), 'Diálogo'); }}, ['Gerar as vozes do diálogo'])])]));
  }
  function engRender(){
    if (!ENG.on) return; var raiz = ENG.host || dir, grande = !!ENG.host;
    var nc = noCombate(), alvo = ENG.alvo || nc.atual || 'esau', c = CAT[alvo];
    var sel = h('select', {'aria-label':'Editar os sons de', onchange:function(ev){ ENG.alvo = ev.target.value; engRender(); }}, Object.keys(CAT).map(function(id){ var o = h('option', {value:id}, [CAT[id].nome]); if (id === alvo) o.selected = true; return o; }));
    var topo = h('div', {class:'dm-top'}, [h('b', {}, [grande ? 'Sons dos personagens' : 'Editar sons']), grande ? null : h('button', {class:'peq', onclick:function(){ ENG.on = false; assin = ''; desenhar2(true); }}, ['Voltar'])]);
    var tarefasAlvo = vis(c.ef.concat(c.ca)).map(function(id){ return function(){ return gerarSom(id); }; }).concat(frDe(alvo).map(function(x){ return function(){ return gerarFalaUma(alvo, ft(x)); }; }));
    var chips = h('div', {class:'dm-chips dm-quem'}, Object.keys(CAT).map(function(id){ return h('button', {class:'peq', 'aria-pressed':String(id === alvo), onclick:function(){ ENG.alvo = id; engRender(); }}, [CAT[id].nome]); }));
    var corpo = [h('div', {class:'dm-onde'}, [grande ? chips : sel]),
      secao('Chave e voz', vozUI(null), !VZ.vozes.length),
      h('div', {class:'dm-efs'}, [h('button', {class:'peq', onclick:function(){ if (VZ.voz) fila(tarefasAlvo, 'Tudo de ' + c.nome); else { VZ.msg = 'Carregue as vozes primeiro.'; engRender(); } }}, ['Gerar tudo de ' + c.nome])]),
      secao('Voz de ' + c.nome, vozPersonagemUI(alvo), false),
      (alvo === 'akari' || alvo === 'ozy') ? secao('Diálogo Akari × Ozymandias', dialogoUI(), false) : null,
      secao('Efeitos', h('div', {}, vis(c.ef).map(linhaSom)), true), secao('Sons de fundo', h('div', {}, vis(c.ca).map(linhaSom)), true),
      (function(){ var rm = c.ef.concat(c.ca).filter(function(id){ return CFG.rm[id]; }); return rm.length ? secao('Removidos (' + rm.length + ')', h('div', {}, rm.map(function(id){ return h('div', {class:'en-lin en-rm'}, [h('div', {class:'en-n'}, [h('b', {}, [EFN[id] || CAN[id]]), h('span', {class:'sub'}, [' · fora da lista'])]), h('div', {class:'dm-efs'}, [h('button', {class:'peq', onclick:function(){ delete CFG.rm[id]; cfgGravar(); assin = ''; engRender(); }}, ['Restaurar'])])]); })), false) : null; })(),
      alvo === 'clima' ? null : secao('Falas', h('div', {}, frDe(alvo).map(function(x, i){ return linhaFala(alvo, i); }).concat([h('button', {class:'peq', onclick:function(){ var l = frDe(alvo).slice(); l.push(['', '']); CFG.fr[alvo] = l; cfgGravar(); engRender(); }}, ['+ nova fala'])])), true),
      VZ.msg ? h('p', {class:'sub dm-nota', role:'status'}, [VZ.msg]) : null];
    var rol = raiz.querySelector('.dm-corpo'), st = rol ? rol.scrollTop : 0;
    var abertos = {}; Array.prototype.forEach.call(raiz.querySelectorAll('details.dm-sec'), function(d){ abertos[d.firstChild.textContent] = d.open; });
    raiz.textContent = ''; raiz.append(topo, h('div', {class:'dm-corpo en' + (grande ? ' grande' : '')}, corpo.filter(Boolean)));
    Array.prototype.forEach.call(raiz.querySelectorAll('details.dm-sec'), function(d){ var k = d.firstChild.textContent; if (k in abertos) d.open = abertos[k]; });
    var n = raiz.querySelector('.dm-corpo'); if (n) n.scrollTop = st;
  }


  /* ===================== MIXER DE AMBIENTE ===================== */
  var CATG = {trovao:'Chuva e tempestade', chuva:'Chuva e tempestade', trovoes:'Chuva e tempestade', vento:'Vento', mar:'Água e lugares', fogo:'Animais e natureza', floresta:'Animais e natureza', uivo:'Animais e natureza'};
  var GRUPOS_CL = ['Chuva e tempestade', 'Vento', 'Água e lugares', 'Animais e natureza', 'Cenário e ação', 'Tensão e perigo'];
  var AUTO = {}, AUTO_T = {}, AUTO_N = [['desligado', 0, 0], ['rara · 1 a 2 min', 60, 120], ['média · 25 a 60 s', 25, 60], ['frequente · 10 a 25 s', 10, 25]];
  function autoPara(id){ if (AUTO_T[id]) { clearTimeout(AUTO_T[id]); delete AUTO_T[id]; } }
  function autoAgenda(id, primeira){ autoPara(id); var n = AUTO[id] | 0; if (!n) return; var a = AUTO_N[n], t = (a[1] + Math.random() * (a[2] - a[1])) * (primeira ? .3 : 1);
    AUTO_T[id] = setTimeout(function(){ if (!AUTO[id]) return; if (!CFG.rm[id]) AU.efeito(id); autoAgenda(id); }, t * 1000); }
  function autoDefine(id, n){ AUTO[id] = n; if (n) autoAgenda(id, true); else autoPara(id); }
  function autoTodos(){ Object.keys(AUTO).forEach(function(id){ AUTO[id] = 0; autoPara(id); }); }
  var _tu2 = AU.tudo; AU.tudo = function(){ autoTodos(); _tu2(); try { mixPinta(); } catch (e) {} };
  var PRESETS_CL = [
    ['Tempestade', {'cl-tempestade':60, 'cl-ventania':30}, {'cl-raio':2, 'cl-trovaoPerto':2}],
    ['Chuva calma', {'cl-chuvaLeve':55, 'cl-ventoSuave':25}, {'cl-trovaoLonge':1}],
    ['Noite na floresta', {'cl-grilos':50, 'cl-florestaSombria':35}, {'cl-coruja':1, 'uivo':1}],
    ['Lobos na neve', {'cl-nevasca':50, 'cl-lobosDistantes':40}, {'cl-matilha':1}],
    ['Montanha', {'cl-ventoMontanha':55}, {'cl-aguia':1, 'cl-pedras':1}],
    ['Porto', {'cl-marPorto':55}, {'cl-gaivotas':2, 'cl-sinoLonge':1}],
    ['Taverna', {'cl-taverna':60, 'fogo':20}, {}],
    ['Acampamento', {'cl-acampamento':50, 'cl-grilos':25}, {'cl-coruja':1}],
    ['Caverna', {'cl-caverna':60}, {'cl-morcegos':1, 'cl-pedras':1}],
    ['Pântano', {'cl-pantano':60}, {'cl-cobra':1, 'cl-enxame':1}],
    ['Batalha distante', {'cl-batalhaDistante':50, 'cl-ventoSuave':20}, {'cl-corvos':1}],
    ['Cidade em chamas', {'cl-incendio':55, 'cl-multidao':30}, {'cl-sinoLonge':2}]
  ];
  var mixHost = h('div', {class:'mix'}), mixMsg = '';
  function mixNome(id){ return EFN[id] || CAN[id] || id; }
  function temSom(id){ return !!GEN[chG(id)] || (ehCam(id) ? !!AU.CA[id] : !!AU.EF[id]); }
  function irGerar(){ ENG.alvo = 'clima'; if (window.aba) window.aba('son'); }
  function mixCam(id){
    var on = AU.viva(id), tem = temSom(id), li = h('div', {class:'mix-cam' + (on ? ' on' : '') + (tem ? '' : ' sem')});
    li.append(h('button', {class:'peq', 'aria-pressed':String(on), title:tem ? '' : 'Ainda sem som: gere em Ajustes › Sons', onclick:function(){ if (!tem) { irGerar(); return; } if (AU.viva(id)) AU.desliga(id); else AU.liga(id, nivelCam(id) / 100); mixPinta(); }}, [(on ? '● ' : '') + mixNome(id) + (tem ? '' : ' · gerar')]));
    if (on) li.append(h('input', {type:'range', min:'0', max:'100', value:String(nivelCam(id)), 'aria-label':'Volume de ' + mixNome(id), oninput:function(ev){ S.cam[id] = +ev.target.value; AU.nivel(id, S.cam[id] / 100); }, onchange:gravar}));
    return li;
  }
  function mixEf(id){
    var tem = temSom(id), n = AUTO[id] | 0, li = h('div', {class:'mix-ef' + (tem ? '' : ' sem') + (n ? ' auto' : '')});
    li.append(h('button', {class:'peq', title:tem ? 'Toca uma vez' : 'Ainda sem som: gere em Ajustes › Sons', onclick:function(){ if (!tem) { irGerar(); return; } AU.efeito(id); }}, ['▶ ' + mixNome(id) + (tem ? '' : ' · gerar')]));
    if (tem) li.append(h('select', {class:'mix-auto', 'aria-label':'Repetir sozinho: ' + mixNome(id), title:'Toca sozinho de tempos em tempos', onchange:function(ev){ autoDefine(id, +ev.target.value); mixPinta(); }},
      AUTO_N.map(function(a, i){ var o = h('option', {value:String(i)}, [i ? '↻ ' + a[0] : '↻ sozinho: não']); if (i === n) o.selected = true; return o; })));
    return li;
  }
  function mixPinta(){
    var c = CAT.clima, ids = vis(c.ca.concat(c.ef)), grupos = {};
    ids.forEach(function(id){ var g = CATG[id] || 'Cenário e ação'; (grupos[g] = grupos[g] || []).push(id); });
    var ligados = Object.keys(AUTO).filter(function(i){ return AUTO[i]; }).length, tocando = c.ca.filter(function(i){ return AU.viva(i); }).length;
    var topo = h('div', {class:'mix-top'}, [
      h('div', {class:'mix-pre'}, PRESETS_CL.map(function(p){ return h('button', {class:'peq', title:'Liga um conjunto de fundos e efeitos', onclick:function(){ preset(p); }}, [p[0]]); })),
      h('div', {class:'dm-efs'}, [h('button', {class:'peq perigo', onclick:function(){ AU.tudo(); mixMsg = ''; mixPinta(); }}, ['Parar tudo']), h('span', {class:'sub'}, [tocando + ' fundo(s) ligado(s)' + (ligados ? ' · ' + ligados + ' efeito(s) sozinho(s)' : '')])]),
      mixMsg ? h('p', {class:'sub dm-nota', role:'status'}, [mixMsg]) : null]);
    var corpo = [topo];
    GRUPOS_CL.concat(Object.keys(grupos).filter(function(g){ return GRUPOS_CL.indexOf(g) < 0; })).forEach(function(g){
      var l = grupos[g]; if (!l) return; var ca = l.filter(ehCam), ef = l.filter(function(i){ return !ehCam(i); });
      corpo.push(h('div', {class:'mix-g'}, [h('h4', {}, [g]), ca.length ? h('div', {class:'mix-cams'}, ca.map(mixCam)) : null, ef.length ? h('div', {class:'mix-efs'}, ef.map(mixEf)) : null]));
    });
    mixHost.replaceChildren.apply(mixHost, corpo.filter(Boolean));
  }
  function preset(p){
    AU.tudo(); var falta = [];
    Object.keys(p[1]).forEach(function(id){ if (!CAN[id] || !temSom(id)) { falta.push(mixNome(id)); return; } S.cam[id] = p[1][id]; AU.liga(id, p[1][id] / 100); });
    Object.keys(p[2]).forEach(function(id){ if (!temSom(id)) { falta.push(mixNome(id)); return; } autoDefine(id, p[2][id]); });
    gravar(); mixMsg = falta.length ? p[0] + ': faltam sons (' + falta.join(', ') + '). Gere em Ajustes › Sons › Ambiente e clima.' : ''; mixPinta();
  }
  window.OTLCLIMA = {montar:function(host){ host.replaceChildren(mixHost); mixPinta(); }};
  setTimeout(function(){ var d = document.getElementById('mixClima'); if (d) window.OTLCLIMA.montar(d); }, 0);   // o painel já pode ter sido desenhado antes deste script

  window.OTLSONS = {abrir:function(host){ ENG.host = host; ENG.on = true; if (!ENG.alvo) ENG.alvo = noCombate().atual || 'esau'; engRender(); },
    fechar:function(){ if (!ENG.host) return; ENG.host.textContent = ''; ENG.host = null; ENG.on = false; assin = ''; try { desenhar2(true); } catch (e) {} }};
  function desenhar2(forcar){
    if (ENG.on) { if (forcar) engRender(); return; }
    var nc = noCombate(), playing = (typeof tocando !== 'undefined' && tocando) ? tocando.id : '';
    var assinatura = VZ.msg + VZ.vozes.length + nc.atual + '|' + nc.porque + '|' + nc.presentes.join(',') + '|' + S.fix + '|' + playing;
    if (!forcar && assinatura === assin && dir.firstChild) return; assin = assinatura;
    // ao trocar de inimigo, as músicas da aba Seleção e da Sessão passam para o grupo dele
    if (nc.atual && nc.atual !== ultimo) { ultimo = nc.atual; var g0 = grupoDe(nc.atual); if (g0) { try { atual = g0.id; atualSes = g0.id; } catch (e) {} } }
    var topo = h('div', {class:'dm-top'}, [h('b', {}, ['Sons']), h('button', {class:'peq', 'aria-label':'Editar sons', title:'Editar e gerar sons e falas', onclick:function(){ ENG.host = null; ENG.on = true; ENG.alvo = nc.atual || ''; engRender(); }}, ['⚙']), h('button', {class:'peq', 'aria-label':'Recolher o painel de sons', onclick:function(){ S.dir = 0; gravar(); aplicar(); }}, ['»'])]);
    var vol = h('label', {class:'dm-vol'}, [h('span', {}, ['Volume']), h('input', {type:'range', min:'0', max:'100', value:String(S.vol), 'aria-label':'Volume dos sons sintetizados', oninput:function(ev){ AU.mestre(+ev.target.value); }, onchange:gravar}),
      h('button', {class:'peq perigo', onclick:function(){ AU.tudo(); desenhar2(true); }}, ['Parar sons'])]);
    var corpo = [h('label', {class:'dm-onde'}, [h('span', {}, ['Personagem ']), h('select', {'aria-label':'Ver sons de', onchange:function(ev){ S.fix = ev.target.value; gravar(); desenhar2(true); }}, [h('option', {value:''}, ['(automático)'])].concat(Object.keys(CAT).map(function(k){ var o = h('option', {value:k}, [CAT[k].nome]); if (k === S.fix) o.selected = true; return o; })))])];
    if (nc.atual) {
      var c = CAT[nc.atual];
      corpo.push(h('div', {class:'dm-onde'}, [h('b', {}, [c.nome])]));
      corpo.push(secao('Músicas de ' + c.nome, musicasUI(nc.atual), true));
      corpo.push(secao('Efeitos', efeitosUI(vis(c.ef)), true));
      corpo.push(secao('Som de fundo', h('div', {class:'dm-cams'}, vis(c.ca).map(camadaUI)), true));
      if (frDe(nc.atual).length) corpo.push(secao(c.vz ? 'Gritos e falas' : 'Frases em latim', frasesUI(frDe(nc.atual), !!c.vz, nc.atual), true));
    } else corpo.push(h('p', {class:'sub dm-nota'}, ['Abra a ficha de um inimigo (ou ponha um na iniciativa) e os sons e as músicas dele aparecem aqui.']));
    if (!nc.atual) corpo.push(secao('Músicas da viagem', musicasUI('viagem'), true));
    if (!nc.atual) corpo.push(secao('Sons gerais', h('div', {}, [efeitosUI(vis(GERAL.ef)), h('div', {class:'dm-sub'}, ['Fundo']), h('div', {class:'dm-cams'}, vis(GERAL.ca).map(camadaUI))]), true));
    var rol = dir.querySelector('.dm-corpo'), st = rol ? rol.scrollTop : 0;
    var abertos = {}; Array.prototype.forEach.call(dir.querySelectorAll('details.dm-sec'), function(d){ abertos[d.firstChild.textContent] = d.open; });
    dir.textContent = ''; dir.append(topo, vol, h('div', {class:'dm-corpo'}, corpo.filter(Boolean)));
    Array.prototype.forEach.call(dir.querySelectorAll('details.dm-sec'), function(d){ var k = d.firstChild.textContent; if (k in abertos) d.open = abertos[k]; });
    var n = dir.querySelector('.dm-corpo'); if (n) n.scrollTop = st;
  }

  /* ===================== MENU LATERAL (tópicos do Mestre) ===================== */
  var nav = h('aside', {id:'navMestre', 'aria-label':'Tópicos do Mestre'});
  var abrirNav = h('button', {id:'nmAbrir', class:'lat-aba esq', 'aria-label':'Abrir os tópicos do Mestre', onclick:function(){ S.nav = 1; gravar(); aplicar(); }}, ['Tópicos']);
  var NOMES = {palco:'Agora tocando', rot:'Roteiro da noite', gat:'Gatilhos', esp:'Cena especial', noite:'A noite (volta e pétalas)', ab:'Abates', notas:'Notas', ini:'Iniciativa e PV', inm:'Inimigos e ações', apo:'Tobias e Rafaela', fim:'Fim da noite', anja:'Oferta da anja', loops:'Registro das voltas', jog:'Jogadores e votação', falas:'Falas e anotações', rit:'Ritmo da noite', dados:'Dados', aud:'Clima e som', amb:'Ambiente e clima', elenco:'Elenco de apoio'};
  function titulo(el0, id){ var s = el0.querySelector(':scope > summary'); if (s && s.textContent.trim()) return s.textContent.trim(); var t = el0.querySelector('h3, h2'); return (NOMES[id] || (t && t.textContent.trim()) || id); }
  function irPara(el0){
    if (!el0) return; if (el0.tagName === 'DETAILS' && !el0.open) el0.open = true;
    setTimeout(function(){ el0.scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'}); }, 60);
    if (window.innerWidth < 1100) { S.nav = 0; gravar(); aplicar(); }
  }
  var navSig = '';
  function desenharNav(){
    var pm = document.getElementById('painelMestre'); if (!pm) return;
    var itens = [], sig = '';
    Array.prototype.forEach.call(pm.children, function(c){ var id = c.dataset && c.dataset.p; if (!id || c.hidden || getComputedStyle(c).display === 'none') return; var t = titulo(c, id); itens.push({id:id, t:t, el:c}); sig += id + t + '|'; });
    sig += (S.foco ? 'f' : '') + lutaAtiva(); if (sig === navSig && nav.firstChild) return; navSig = sig;
    var lista = h('nav', {class:'nm-lista'});
    itens.forEach(function(it){
      lista.append(h('button', {class:'nm-it', onclick:function(){ var alvo = pm.querySelector(':scope > [data-p="' + it.id + '"]'); irPara(alvo); }}, [it.t]));
    });
    nav.textContent = ''; var rod = h('div', {class:'nm-rod'}, [dois('Zerar a luta', zerarLuta), dois('Zerar a noite', zerarNoite, 'perigo')]); nav.append(h('div', {class:'nm-top'}, [h('b', {}, ['Tópicos']), h('button', {class:'peq', 'aria-label':'Recolher os tópicos', onclick:function(){ S.nav = 0; gravar(); aplicar(); }}, ['«'])]), lista, rod);
    var tabs = Array.prototype.filter.call(document.querySelectorAll('header .abas button'), function(b){ return b.id !== 'btHdr'; });
    if (tabs.length) nav.prepend(h('div', {class:'nm-abas2'}, tabs.map(function(b){ return h('button', {class:'peq', 'aria-pressed':String(b.getAttribute('aria-selected') === 'true'), onclick:function(){ b.click(); }}, [b.textContent.trim()]); })));
  }


  /* ===================== LUTA ATIVA, DICAS E ZERAR ===================== */
  function lutaAtiva(){ try { return (E.m.ini || []).some(function(c){ return !!inmDeLinha(c); }); } catch (e) { return false; } }
  var DICA = /^(Direito de|Teto da volta|Já Vi|O vos angeli|Só luta|Juramento|Virada da Tela|Memória das|Conta como|Descreva o que|Volta \d+, \d|Manual:)/;
  function botaoRail(){
    var pm = document.getElementById('painelMestre'); if (!pm) return;
    var main = pm.querySelector('.dk-main'); if (!main || main.querySelector(':scope>.rail-t')) { var t = main && main.querySelector(':scope>.rail-t'); var tx = S.rail ? '◧ Esconder iniciativa e PV' : '◨ Mostrar iniciativa e PV'; if (t && t.textContent !== tx) t.textContent = tx; return; }
    var b = h('button', {class:'rail-t', onclick:function(){ S.rail = S.rail ? 0 : 1; gravar(); aplicar(); }}, [S.rail ? '◧ Esconder iniciativa e PV' : '◨ Mostrar iniciativa e PV']);
    main.insertBefore(b, main.firstChild);
  }
  function marcarDicas(){
    botaoRail();
    var pm = document.getElementById('painelMestre'); if (!pm) return;
    Array.prototype.forEach.call(pm.querySelectorAll('.inm-av'), function(e){ if (DICA.test(e.textContent.trim())) e.classList.add('dica'); });
    Array.prototype.forEach.call(pm.querySelectorAll('.inm-faixa'), function(e){ var d = Array.prototype.slice.call(e.querySelectorAll(':scope>div')); if (d.length && d.every(function(x){ return /^(Esaú: Direito|Ozymandias: Memória)/.test(x.textContent.trim()); })) e.classList.add('dica'); });
  }
  function zerarLuta(){
    var m = E.m; m.ini = []; m.turno = 0; m.rodada = 1;
    Object.assign(m.inm, {uso:{}, rec:{}, ult:[], pvLuta:{}, lutaSel:{}, lend:{}, nh:{}, amb:{}, av:[], alvo:'', f2:false, f2man:false, elLonge:false, vt:false, todos:false, sel:'esau'});
    salvar(); desenhar();
  }
  function zerarNoite(){ var g = E.grupos, vol = E.ambVol; E.m = M0(); garantir(); salvar(); desenhar(); }
  function dois(rotulo, acao, cls){
    var b = h('button', {class:'peq ' + (cls || ''), onclick:function(){
      if (b.dataset.c) { delete b.dataset.c; b.textContent = rotulo; acao(); return; }
      b.dataset.c = 1; b.textContent = 'Confirmar?'; setTimeout(function(){ if (b.isConnected) { delete b.dataset.c; b.textContent = rotulo; } }, 3000); }}, [rotulo]);
    return b;
  }
  var ajx = null;
  /* exporta os sons gerados (IndexedDB) em MP3, num único arquivo, para colocar na pasta audio/ do repositório */
  function exportarSons(st){
    function lame(){ return window.lamejs ? Promise.resolve() : new Promise(function(ok, no){ var s = document.createElement('script'); s.src = 'vendor/lame.min.js'; s.onload = ok; s.onerror = function(){ no(new Error('encoder')); }; document.head.append(s); }); }
    st.textContent = 'Lendo os sons…';
    return lame().then(bd).then(function(d){ return new Promise(function(ok){ var o = [], q = d.transaction('a').objectStore('a').openCursor(); q.onsuccess = function(){ var c = q.result; if (!c) return ok(o); if (/^(fx|cam)\|/.test(String(c.key))) o.push([String(c.key), c.value]); c.continue(); }; }); })
      .then(function(lista){ var ac = new (window.AudioContext || window.webkitAudioContext)(), partes = [], indice = [], i = 0;
        function prox(){ if (i >= lista.length) return Promise.resolve(); var k = lista[i][0]; st.textContent = 'Convertendo ' + (i + 1) + ' de ' + lista.length + '…';
          return lista[i][1].arrayBuffer().then(function(ab){ return ac.decodeAudioData(ab); }).then(function(buf){
            var a = buf.getChannelData(0), pcm = new Int16Array(a.length); for (var j = 0; j < a.length; j++) pcm[j] = Math.max(-1, Math.min(1, a[j])) * 32767;
            var enc = new lamejs.Mp3Encoder(1, buf.sampleRate, 64), out = [], p = 1152, x;
            for (var s = 0; s < pcm.length; s += p) { x = enc.encodeBuffer(pcm.subarray(s, s + p)); if (x.length) out.push(x); } x = enc.flush(); if (x.length) out.push(x);
            var blob = new Blob(out, {type:'audio/mpeg'}); partes.push(blob); indice.push({k:k, n:blob.size}); i++; return new Promise(function(r){ setTimeout(r, 0); }).then(prox); }); }
        return prox().then(function(){ var cab = new TextEncoder().encode(JSON.stringify(indice)), len = new Uint8Array(4); new DataView(len.buffer).setUint32(0, cab.length);
          var pacote = new Blob([new TextEncoder().encode('OTLSONS1'), len, cab].concat(partes), {type:'application/octet-stream'});
          var a = document.createElement('a'); a.href = URL.createObjectURL(pacote); a.download = 'otl_sons.bin'; document.body.append(a); a.click(); a.remove();
          st.textContent = 'Pronto: otl_sons.bin (' + Math.round(pacote.size / 1024) + ' KB) na pasta Downloads.'; }); })
      .catch(function(e){ st.textContent = 'Não deu: ' + e.message; });
  }
  function ajustesExtra(){
    var aj = document.getElementById('ajustes'); if (!aj || aj.querySelector('.mx-aj')) return;
    var dic = h('label', {class:'mx-lin'}, [h('input', {type:'checkbox', onchange:function(ev){ S.dicas = ev.target.checked ? 1 : 0; gravar(); aplicar(); }}), ' Mostrar as dicas em amarelo (lembretes de regra nas fichas dos inimigos)']);
    dic.firstChild.checked = !!S.dicas;
    var ret = h('label', {class:'mx-lin'}, [h('input', {type:'checkbox', onchange:function(ev){ S.retos = ev.target.checked ? 1 : 0; gravar(); aplicar(); }}), ' Cantos retos (visual mais seco, sem cartões arredondados)']);
    ret.firstChild.checked = !!S.retos;
    var rol = h('label', {class:'mx-lin'}, [h('input', {type:'checkbox', onchange:function(ev){ S.rolar = ev.target.checked ? 1 : 0; gravar(); }}), ' Rolar os dados de dano (padrão: usar o dano médio da ficha)']);
    rol.firstChild.checked = !!S.rolar;
    aj.append(h('div', {class:'mx-aj'}, [h('h2', {}, ['Mesa do Mestre']), dic, ret, rol,
      h('h3', {}, ['Sons gerados']), h('p', {class:'sub'}, ['Salva todos os sons e fundos já gerados neste navegador em um arquivo (MP3), para guardar no repositório.']), (function(){ var st = h('p', {class:'sub'}, []); return h('div', {}, [h('button', {class:'peq', onclick:function(){ exportarSons(st); }}, ['Exportar os sons']), st]); })(),
      h('h3', {}, ['Zerar']), h('p', {class:'sub'}, ['As músicas escolhidas e a aparência não mudam.']),
      h('div', {class:'lin2'}, [dois('Zerar a luta (iniciativa, PV, rodada, usos)', zerarLuta), dois('Zerar a noite inteira (volta 1, abates, notas, tudo do Mestre)', zerarNoite, 'perigo')])]));
  }

  /* ===================== CABEÇALHO RECOLHÍVEL ===================== */
  var hdr = document.querySelector('header');
  var puxa = h('button', {id:'btHdr', class:'puxa', 'aria-label':'Recolher ou abrir o cabeçalho', onclick:function(){ S.hdr = S.hdr ? 0 : 1; gravar(); aplicar(); }}, ['']);
  var abasE = document.querySelector('header .abas'); if (abasE) abasE.append(puxa); else if (hdr) hdr.append(puxa);
  function medir(){
    if (!hdr) return; var r = hdr.getBoundingClientRect(), lateral = hdr.offsetWidth < window.innerWidth * .6;
    root.style.setProperty('--hdr-h', lateral ? '0px' : Math.round(r.height) + 'px');
  }
  if (hdr && window.ResizeObserver) new ResizeObserver(medir).observe(hdr);
  window.addEventListener('resize', medir);

  function aplicar0(){ var l = lutaAtiva() ? (S.foco ? 'foco' : '1') : '0'; if (root.getAttribute('data-luta') !== l) root.setAttribute('data-luta', l); }
  function aplicar(){
    var mes = document.getElementById('painelMestre') && !document.getElementById('painelMestre').hidden;
    root.setAttribute('data-hdr', S.hdr ? 'rec' : 'abr');
    root.setAttribute('data-nav', S.nav ? '1' : '0'); root.setAttribute('data-dicas', S.dicas ? '1' : '0'); root.setAttribute('data-cantos', S.retos ? '1' : '0'); root.setAttribute('data-rail', S.rail ? '1' : '0'); root.setAttribute('data-luta', lutaAtiva() ? (S.foco ? 'foco' : '1') : '0'); root.setAttribute('data-dir', S.dir ? '1' : '0');
    root.setAttribute('data-aba', mes ? 'mes' : (typeof modo !== 'undefined' ? modo : ''));
    puxa.title = S.hdr ? 'Abrir o cabeçalho' : 'Recolher o cabeçalho'; puxa.textContent = S.hdr ? '▼' : '▲';
    medir();
    if (mes) { desenharNav(); desenhar2(); }
  }

  /* ---- montagem ---- */
  var main = document.querySelector('main');
  if (main) { main.append(nav, dir, abrirNav, abrirDir); }
  var _aba = window.aba;
  if (typeof _aba === 'function') { window.aba = function(q){ var r = _aba.apply(this, arguments); aplicar(); return r; }; }
  var pmE = document.getElementById('painelMestre'); if (pmE) new MutationObserver(marcarDicas).observe(pmE, {childList:true, subtree:true});
  var ajE = document.getElementById('ajustes'); if (ajE) new MutationObserver(ajustesExtra).observe(ajE, {childList:true});
  marcarDicas(); ajustesExtra();
  document.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.isConnected) return;
    var pm = document.getElementById('painelMestre'); if (!pm || pm.hidden || !pm.querySelector('.inm-res')) return;
    var cartao = t.closest && t.closest('.inm-card'); if (cartao && cartao.querySelector('.inm-res')) return;
    if (t.closest && t.closest('#dirMesa,#navMestre,.inm-aplic,.inm-ap')) return;
    try { limpaRol(); desenhar(['inm']); } catch (e) {}
  });
  var barraAgora = document.getElementById('agoraTit');
  setInterval(function(){
    if (document.hidden) return;
    var pm = document.getElementById('painelMestre'); if (!pm || pm.hidden) return;
    aplicar0(); desenharNav(); desenhar2();
    var t = document.getElementById('dmTit'); if (t && barraAgora && t.textContent !== barraAgora.textContent) t.textContent = barraAgora.textContent;
  }, 800);
  window.addEventListener('keydown', function(ev){ if (ev.key === 'Escape' && window.innerWidth < 1100 && (S.nav || S.dir)) { /* fecha as gavetas em telas estreitas */ S.nav = 0; S.dir = 0; gravar(); aplicar(); } });
  if (window.innerWidth < 1100) { S.nav = 0; S.dir = 0; }   // em tela estreita começam fechadas
  aplicar();
  /* efeitos dos inimigos: botão de ação (Usar / Rolar ataque) toca o MP3 correspondente */
  var FX_ACAO = {"ozy":{"pedra-orbital":"pedraOrbital","mao-de-orbita":"pedraOrbital","ataques-multiplos":"pedraOrbital","inverter":"inverterGrav","l-inverter":"inverterGrav","cobranca":"moedas","l-cobranca":"moedas","peso-da-conta":"gravidade","saturno":"gravidade","a-gravidade-pesada":"gravidade","a-ilhas-flutuantes":"ilhasFlutuantes","a-chuva-de-rochas":"meteoro"},"elodie":{"pincelada":"pincelada","ataques-multiplos":"pincelada","l-pincelada-rapida":"pincelada","raspar":"raspar","salto-de-cor":"saltoCor","l-retrato":"moldura","a-esbocar":"esboco","obra-prima-de-sala":"obraPrima","a-antecipar":"obraPrima"},"esau":{"arpao-de-corrente":"arpao","l-arpao":"arpao","chuva-de-ferro":"chuvaFerro","a-ponte-de-ferro":"ponteFerro","a-correntes-brotam":"correntesBrotam","facao":"facao","flecha-de-ferro":"flecha"},"jael":{"martelo-de-guerra":"martelo","estaca":"estaca","arremessar-estaca":"estaca","a-estacas-do-chao":"estacasChao","a-tenda-desaba":"tendaDesaba","batida-do-tambor":"pulsoTambor","a-tambor-no-peito":"pulsoTambor","l-rufar":"rufar"},"ezequiel":{"rodas-de-fogo":"rodasFogo","raio-da-roda":"raioRoda","a-eco-do-futuro":"sussurro","a-nota-grave":"orgao"},"hildegarda":{"maca-sagrada":"macaSagrada","chama-sagrada-maior":"chamaSagrada","sino-de-bronze":"sinoBronze","ave-generosa":"aveGenerosa","palavra-curativa":"luz"},"anjo":{"espada-flamejante":"espada","julgamento":"julgamento","l-clarao":"clarao","escudo-de-asas":"escudoAsas","asas":"asasCouro"}};
  document.addEventListener('click', function(e){
    var b = e.target && e.target.closest && e.target.closest('.inm-usar,.inm-atk');
    if (!b || b.getAttribute('aria-disabled') === 'true' || b.getAttribute('aria-pressed') === 'true' || b.disabled) return;
    var m = FX_ACAO[b.getAttribute('data-i')], id = m && m[b.getAttribute('data-a')];
    if (id) { try { AU.efeito(id); } catch (x) {} }
  }, true);
  window.OTLMesa = {AU:AU, S:S, aplicar:aplicar, CAT:CAT, noCombate:noCombate, DEFS:{VOZ_PADRAO:VOZ_PADRAO, CAT:CAT, VOZP:VOZP, GEN_V:GEN_V, PDEF:PDEF, DIAL:DIAL, CAN:CAN, EFN:EFN}};
})();
