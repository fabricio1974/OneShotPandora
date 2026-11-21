/* Motor de sons sintetizados (Web Audio). Usado pela mesa (mesa.js) e pela aba de transmissão (tela.html).
   OTL_AU(S) devolve {efeito, liga, nivel, desliga, mestre, tudo, viva, EF, CA}; S.vol é o volume geral (0 a 100). */
window.OTL_AU = function(S){
    var ctx, master, comp, rev, bufs = {}, vivas = {}, nivel = {};
    function init(){
      if (!ctx) {
        var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
        ctx = new C(); master = ctx.createGain(); master.gain.value = S.vol / 100;
        comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
        rev = ctx.createConvolver(); var n = ctx.sampleRate * 3.2, b = ctx.createBuffer(2, n, ctx.sampleRate);
        for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
        rev.buffer = b; var rg = ctx.createGain(); rg.gain.value = .9; rev.connect(rg); rg.connect(master);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function saida(rv, dest){ var g = ctx.createGain(); g.connect(dest || master); if (rv) { var s = ctx.createGain(); s.gain.value = rv; g.connect(s); s.connect(rev); } return g; }
    function ruido(tipo){
      if (bufs[tipo]) return bufs[tipo];
      var n = ctx.sampleRate * 6, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), l = 0, b0 = 0, b1 = 0, b2 = 0;
      for (var i = 0; i < n; i++) {
        var w = Math.random() * 2 - 1;
        if (tipo === 'branco') d[i] = w;
        else if (tipo === 'marrom') { l = (l + .02 * w) / 1.02; d[i] = l * 3.5; }
        else { b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * .1848) * .2; }
      }
      return (bufs[tipo] = b);
    }
    function fonte(tipo, loop){ var s = ctx.createBufferSource(); s.buffer = ruido(tipo); s.loop = !!loop; if (loop) s.loopStart = Math.random() * 2; return s; }
    function filtro(tipo, f, q){ var x = ctx.createBiquadFilter(); x.type = tipo; x.frequency.value = f; if (q != null) x.Q.value = q; return x; }
    function amp(t, pico, a, dur, dest, fim){   // envelope: sobe em a s, desce até o fim da duração
      var g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(pico, .0002), t + a);
      g.gain.exponentialRampToValueAtTime(.0001, t + a + dur); g.connect(dest); return g;
    }
    function osc(tipo, f, t, a, dur, pico, dest, glide){
      var o = ctx.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f, t);
      if (glide) o.frequency.exponentialRampToValueAtTime(glide[0], t + glide[1]);
      var g = amp(t, pico, a, dur, dest); o.connect(g); o.start(t); o.stop(t + a + dur + .1); return o;
    }
    function sopro(tipo, t, a, dur, pico, dest, tipoF, f1, f2, q){   // ruído com filtro varrendo de f1 até f2
      var s = fonte(tipo, false), fl = filtro(tipoF || 'bandpass', f1, q || 1);
      if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + dur);
      if (f2) { fl.frequency.setValueAtTime(f1, t); fl.frequency.exponentialRampToValueAtTime(f2, t + a + dur); }
      var g = amp(t, pico, a, dur, dest); s.connect(fl); fl.connect(g); s.start(t, Math.random() * 3); s.stop(t + a + dur + .1);
    }
    function sino(t, f, dur, pico, dest){
      [[1, 1], [2.76, .5], [5.4, .25], [8.93, .12]].forEach(function(p){ osc('sine', f * p[0], t, .005, dur / p[0] * 1.6, pico * p[1], dest); });
    }
    function coro(t, notas, a, seg, r, pico, dest){   // acorde de voz: serra filtrada por formantes de "ah"
      notas.forEach(function(f, k){
        [0, 6, -6].forEach(function(det){
          var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det + k;
          var lf = ctx.createOscillator(), lg = ctx.createGain(); lf.frequency.value = 4.6 + Math.random(); lg.gain.value = f * .006; lf.connect(lg); lg.connect(o.frequency); lf.start(t); lf.stop(t + a + seg + r + .2);
          var f1 = filtro('bandpass', 760, 5), f2 = filtro('bandpass', 1150, 7), mix = ctx.createGain(); mix.gain.value = 1;
          var g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(pico / 3, t + a); g.gain.setValueAtTime(pico / 3, t + a + seg); g.gain.exponentialRampToValueAtTime(.0001, t + a + seg + r);
          o.connect(f1); o.connect(f2); f1.connect(mix); f2.connect(mix); mix.connect(g); g.connect(dest); o.start(t); o.stop(t + a + seg + r + .2);
        });
      });
    }
    var N = function(m){ return 440 * Math.pow(2, (m - 69) / 12); };

    /* ---------- efeitos (um disparo) ---------- */
    var EFEITOS = {
      trovao: function(t){ var o = saida(.5); sopro('marrom', t, .15, 3.4, .9, o, 'lowpass', 900, 50, .7); sopro('branco', t, .02, .5, .25, o, 'lowpass', 2200, 200, .5); },
      impacto: function(t){ var o = saida(.3); osc('sine', 110, t, .002, .5, .9, o, [32, .35]); sopro('branco', t, .002, .25, .5, o, 'lowpass', 1800, 150, .7); },
      sino: function(t){ sino(t, N(48), 4.5, .35, saida(.8)); },
      magia: function(t){
        var o = saida(.9), esc = [0, 4, 7, 12, 16, 19, 24, 28]; esc.forEach(function(s, k){ osc('triangle', N(69 + s), t + k * .06, .005, .9, .16, o); osc('sine', N(81 + s), t + k * .06 + .02, .005, 1.2, .07, o); });
        sopro('branco', t, .3, 1.2, .12, o, 'highpass', 3000, 9000, .5);
      },
      meteoro: function(t){
        var o = saida(.4); sopro('rosa', t, 1.5, .5, .55, o, 'bandpass', 3800, 220, 1.2);
        osc('sawtooth', 220, t, 1.5, .4, .12, o, [60, 1.9]);
        var t2 = t + 1.95; osc('sine', 90, t2, .003, 1.1, 1, o, [28, .9]); sopro('marrom', t2, .004, 2.4, .9, o, 'lowpass', 700, 45, .6); sopro('branco', t2, .002, .3, .4, o, 'lowpass', 2600, 300, .6);
      },
      gravidade: function(t){ var o = saida(.5); osc('sine', 220, t, .6, 2.2, .5, o, [34, 2.6]); osc('sine', 330, t, .6, 2, .15, o, [50, 2.4]); sopro('marrom', t + .2, .8, 2, .5, o, 'lowpass', 300, 60, .8); },
      orbita: function(t){ var o = saida(.7); osc('sine', 180, t, 1.6, .6, .22, o, [720, 1.7]); osc('sine', 184, t, 1.6, .6, .22, o, [724, 1.7]); sopro('rosa', t, 1.6, .5, .12, o, 'bandpass', 400, 3000, 2); },
      moedas: function(t){ var o = saida(.35); for (var i = 0; i < 7; i++) { var tt = t + i * (.05 + Math.random() * .07), f = 2300 + Math.random() * 1500; osc('sine', f, tt, .002, .35, .18, o); osc('sine', f * 1.5, tt, .002, .25, .08, o); } },
      pincelada: function(t){ var o = saida(.3); sopro('rosa', t, .12, .35, .5, o, 'bandpass', 1200, 4200, 1.4); sopro('marrom', t, .05, .4, .3, o, 'lowpass', 900, 400, .5); },
      harpa: function(t){ var o = saida(.9), e = [0, 2, 4, 7, 9, 12, 14, 16]; e.forEach(function(s, k){ osc('triangle', N(60 + s), t + k * .11, .003, 1.6, .2, o); }); },
      vitral: function(t){ var o = saida(.7); for (var i = 0; i < 34; i++) { var tt = t + Math.random() * .6; osc('sine', 3200 + Math.random() * 6500, tt, .001, .12 + Math.random() * .25, .08, o); } sopro('branco', t, .002, .5, .3, o, 'highpass', 4500, 8000, .6); },
      coroSubida: function(t){ coro(t, [N(50), N(57), N(62), N(65)], 1.6, 2.4, 3, .5, saida(1.1)); coro(t + .3, [N(74), N(77), N(81)], 1.8, 2, 3, .3, saida(1.3)); },
      luz: function(t){ var o = saida(1); [1568, 2093, 2637, 3136].forEach(function(f, k){ osc('sine', f, t + k * .09, .004, 3.2, .12, o); }); sopro('branco', t, .4, 1.8, .07, o, 'highpass', 5000, 9000, .5); },
      espada: function(t){ var o = saida(.3); sopro('rosa', t, .18, .55, .7, o, 'bandpass', 500, 4200, 1); sopro('marrom', t + .1, .05, 1.2, .5, o, 'lowpass', 1400, 200, .6); for (var i = 0; i < 18; i++) sopro('branco', t + .15 + Math.random() * 1, .001, .04, .25, o, 'bandpass', 2000 + Math.random() * 3000, null, 2); },
      trombeta: function(t){
        var o = saida(1); [[N(60), 0, .5], [N(67), .55, .5], [N(72), 1.1, 1.8], [N(76), 1.1, 1.8]].forEach(function(n){
          var os = ctx.createOscillator(); os.type = 'sawtooth'; os.frequency.value = n[0]; var fl = filtro('lowpass', 500, 1); fl.frequency.setValueAtTime(500, t + n[1]); fl.frequency.exponentialRampToValueAtTime(3200, t + n[1] + .25);
          var g = ctx.createGain(); g.gain.setValueAtTime(.0001, t + n[1]); g.gain.exponentialRampToValueAtTime(.16, t + n[1] + .06); g.gain.setValueAtTime(.16, t + n[1] + n[2]); g.gain.exponentialRampToValueAtTime(.0001, t + n[1] + n[2] + .5);
          os.connect(fl); fl.connect(g); g.connect(o); os.start(t + n[1]); os.stop(t + n[1] + n[2] + .6);
        });
      },
      corrente: function(t){ var o = saida(.25); for (var i = 0; i < 12; i++) { var tt = t + i * (.04 + Math.random() * .09); sopro('branco', tt, .001, .06, .3, o, 'bandpass', 2500 + Math.random() * 2500, null, 4); osc('sine', 900 + Math.random() * 500, tt, .001, .18, .1, o); } },
      flecha: function(t){ var o = saida(.2); sopro('rosa', t, .05, .35, .55, o, 'bandpass', 3800, 700, 1.5); osc('sine', 130, t + .38, .002, .35, .8, o, [60, .25]); sopro('branco', t + .38, .001, .1, .3, o, 'lowpass', 1500, 300, .6); },
      uivo: function(t){   // lobo: tom puro com harmônicos suaves, vibrato que cresce, sopro de ar e cauda que cai
        var o = saida(1.1), d = 5.2;
        [[1, .5], [2, .22], [3, .09]].forEach(function(p){
          var os = ctx.createOscillator(); os.type = 'sine';
          os.frequency.setValueAtTime(330 * p[0], t); os.frequency.exponentialRampToValueAtTime(520 * p[0], t + 1.3); os.frequency.setValueAtTime(520 * p[0], t + 1.3);
          os.frequency.linearRampToValueAtTime(545 * p[0], t + 3.1); os.frequency.exponentialRampToValueAtTime(300 * p[0], t + d);
          var vf = ctx.createOscillator(), vg = ctx.createGain(); vf.frequency.value = 5.6; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(7 * p[0], t + 2.2); vg.gain.linearRampToValueAtTime(12 * p[0], t + d);
          vf.connect(vg); vg.connect(os.frequency); vf.start(t); vf.stop(t + d + .2);
          var g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22 * p[1], t + 1.1); g.gain.setValueAtTime(.22 * p[1], t + 3.2); g.gain.exponentialRampToValueAtTime(.0001, t + d);
          os.connect(g); g.connect(o); os.start(t); os.stop(t + d + .2);
        });
        sopro('rosa', t, 1.2, d - 1.2, .05, o, 'bandpass', 1500, 900, 1.5);
      },
      assobio: function(t){ var o = saida(.5), os = ctx.createOscillator(); os.type = 'sine'; os.frequency.setValueAtTime(1700, t); os.frequency.exponentialRampToValueAtTime(2700, t + .35); os.frequency.setValueAtTime(2700, t + .5); os.frequency.exponentialRampToValueAtTime(2100, t + .9);
        var vf = ctx.createOscillator(), vg = ctx.createGain(); vf.frequency.value = 9; vg.gain.value = 40; vf.connect(vg); vg.connect(os.frequency); vf.start(t); vf.stop(t + 1);
        var g = amp(t, .22, .06, .85, o); os.connect(g); os.start(t); os.stop(t + 1); sopro('branco', t, .05, .8, .03, o, 'bandpass', 2600, null, 8); },
      chifre: function(t){ var o = saida(1.3); [N(43), N(43) * 1.005, N(50)].forEach(function(f){ var os = ctx.createOscillator(); os.type = 'sawtooth'; os.frequency.setValueAtTime(f * .96, t); os.frequency.linearRampToValueAtTime(f, t + .5);
          var fl = filtro('lowpass', 260, 1.5); fl.frequency.linearRampToValueAtTime(1200, t + 1.1); fl.frequency.linearRampToValueAtTime(400, t + 2.8);
          var g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .5); g.gain.setValueAtTime(.2, t + 1.8); g.gain.exponentialRampToValueAtTime(.0001, t + 3);
          os.connect(fl); fl.connect(g); g.connect(o); os.start(t); os.stop(t + 3.1); }); },
      rosnado: function(t){ var o = saida(.3), os = ctx.createOscillator(); os.type = 'sawtooth'; os.frequency.setValueAtTime(75, t); os.frequency.linearRampToValueAtTime(58, t + 1.6);
        var am = ctx.createGain(); am.gain.value = .5; var lf = ctx.createOscillator(), lg = ctx.createGain(); lf.frequency.value = 27; lg.gain.value = .5; lf.connect(lg); lg.connect(am.gain); lf.start(t); lf.stop(t + 1.8);
        var fl = filtro('bandpass', 380, 1.2), g = amp(t, .55, .25, 1.3, o); os.connect(am); am.connect(fl); fl.connect(g); os.start(t); os.stop(t + 1.8); sopro('rosa', t, .2, 1.3, .25, o, 'bandpass', 700, 300, 1.2); },
      tambor: function(t){ var o = saida(.5); osc('sine', 150, t, .002, .45, 1, o, [48, .22]); osc('sine', 210, t + .22, .002, .3, .7, o, [90, .15]); sopro('branco', t, .001, .1, .45, o, 'lowpass', 1400, 200, .6); sopro('branco', t + .22, .001, .08, .3, o, 'lowpass', 1800, 300, .6); },
      rufar: function(t){ var o = saida(.4); for (var i = 0; i < 12; i++) { var tt = t + i * .09 * (1 - i * .02); osc('sine', 140, tt, .002, .25, .25 + i * .06, o, [60, .12]); sopro('branco', tt, .001, .06, .12 + i * .02, o, 'lowpass', 1500, 300, .6); } EFEITOS.tambor(t + 1.2); },
      estaca: function(t){ var o = saida(.35); osc('sine', 95, t, .002, .35, .9, o, [40, .2]); sopro('branco', t, .001, .08, .5, o, 'bandpass', 2200, 900, 3); sino(t, 520, 1.2, .1, o); },
      sussurro: function(t){ var o = saida(.9); for (var i = 0; i < 5; i++) sopro('rosa', t + i * (.35 + Math.random() * .25), .12, .45, .35, o, 'bandpass', 1400 + Math.random() * 1800, 900 + Math.random() * 1500, 5); },
      relogio: function(t){ var o = saida(.4); for (var i = 0; i < 6; i++) { osc('square', 1800, t + i * .6, .001, .03, .08, o); osc('sine', 700, t + i * .6, .001, .09, .12, o); } sino(t + 3.9, N(40), 4.5, .35, saida(.9)); },
      orgao: function(t){
        var o = saida(1.2); [N(36), N(43), N(48), N(52)].forEach(function(f){ [1, 2, 3, 4, 6].forEach(function(m, k){ var os = ctx.createOscillator(); os.type = 'sine'; os.frequency.value = f * m;
          var g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16 / (k + 1), t + 1.4); g.gain.setValueAtTime(.16 / (k + 1), t + 3); g.gain.exponentialRampToValueAtTime(.0001, t + 5.5); os.connect(g); g.connect(o); os.start(t); os.stop(t + 5.6); }); });
      }
    };

    /* ---------- camadas (som contínuo, com volume próprio) ---------- */
    function laco(fn, min, max){ var vivo = true, id; (function de(){ if (!vivo) return; try { fn(); } catch (e) {} id = setTimeout(de, min + Math.random() * (max - min)); })(); return function(){ vivo = false; clearTimeout(id); }; }
    function lfo(f, prof, alvo, t0){ var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.value = prof; o.connect(g); g.connect(alvo); o.start(t0 || 0); return o; }
    var CAMADAS = {
      vento: function(g){ var s = fonte('rosa', true), f = filtro('bandpass', 520, .8); s.connect(f); f.connect(g); lfo(.11, 260, f.frequency); lfo(.07, .25, g.gain); s.start(); return function(){ s.stop(); }; },
      chuva: function(g){ var s = fonte('branco', true), a = filtro('highpass', 1300, .5), b = filtro('lowpass', 7500, .5); s.connect(a); a.connect(b); b.connect(g); s.start(); return function(){ s.stop(); }; },
      mar: function(g){ var s = fonte('marrom', true), f = filtro('lowpass', 800, .6), v = ctx.createGain(); v.gain.value = .6; s.connect(f); f.connect(v); v.connect(g); lfo(.085, .45, v.gain); s.start(); return function(){ s.stop(); }; },
      fogo: function(g){
        var s = fonte('marrom', true), f = filtro('lowpass', 420, .7); s.connect(f); f.connect(g); s.start();
        var p = laco(function(){ var t = ctx.currentTime; sopro('branco', t, .001, .03 + Math.random() * .05, .5 + Math.random() * .5, g, 'bandpass', 1500 + Math.random() * 3000, null, 3); }, 40, 260);
        return function(){ s.stop(); p(); };
      },
      trovoes: function(g){ var s = fonte('marrom', true), f = filtro('lowpass', 130, .6), v = ctx.createGain(); v.gain.value = .2; s.connect(f); f.connect(v); v.connect(g); s.start();
        var p = laco(function(){ var t = ctx.currentTime; v.gain.cancelScheduledValues(t); v.gain.setValueAtTime(v.gain.value, t); v.gain.linearRampToValueAtTime(1, t + 1.5); v.gain.linearRampToValueAtTime(.2, t + 5); }, 6000, 15000);
        return function(){ s.stop(); p(); }; },
      grave: function(g){ var os = [55, 55.4, 82.4].map(function(f){ var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; return o; }), fl = filtro('lowpass', 210, 1.2), v = ctx.createGain(); v.gain.value = .35;
        os.forEach(function(o){ o.connect(fl); o.start(); }); fl.connect(v); v.connect(g); lfo(.06, 90, fl.frequency); return function(){ os.forEach(function(o){ o.stop(); }); }; },
      cosmos: function(g){ var a = ctx.createOscillator(), b = ctx.createOscillator(), v = ctx.createGain(), fl = filtro('lowpass', 400, 2); a.frequency.value = 40; b.frequency.value = 40.7; v.gain.value = .5;
        a.connect(fl); b.connect(fl); fl.connect(v); v.connect(g); lfo(.13, .35, v.gain); lfo(.05, 160, fl.frequency); var s = fonte('rosa', true), f = filtro('bandpass', 900, 6), w = ctx.createGain(); w.gain.value = .05; s.connect(f); f.connect(w); w.connect(g); lfo(.09, 700, f.frequency); a.start(); b.start(); s.start();
        return function(){ a.stop(); b.stop(); s.stop(); }; },
      coro: function(g){ var notas = [N(50), N(57), N(62), N(65), N(69)], parar = [];
        notas.forEach(function(f){ var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; var f1 = filtro('bandpass', 780, 5), f2 = filtro('bandpass', 1200, 7), v = ctx.createGain(); v.gain.value = .05; o.connect(f1); o.connect(f2); f1.connect(v); f2.connect(v); v.connect(g); lfo(4.8 + Math.random(), f * .004, o.frequency); lfo(.07 + Math.random() * .05, .035, v.gain); o.start(); parar.push(o); });
        return function(){ parar.forEach(function(o){ o.stop(); }); }; },
      sinos: function(g){ return laco(function(){ var t = ctx.currentTime; sino(t, N(45 + [0, 3, 7, 10, 12][Math.floor(Math.random() * 5)]), 5, .22, g); }, 4500, 12000); },
      coracao: function(g){ return laco(function(){ var t = ctx.currentTime; osc('sine', 62, t, .005, .22, .9, g, [38, .18]); osc('sine', 56, t + .3, .005, .2, .6, g, [34, .18]); }, 900, 900); },
      sussurros: function(g){ return laco(function(){ var t = ctx.currentTime, pn = ctx.createStereoPanner ? ctx.createStereoPanner() : null; var d = ctx.createGain(); if (pn) { pn.pan.value = Math.random() * 2 - 1; d.connect(pn); pn.connect(g); } else d.connect(g);
        sopro('rosa', t, .18, .5, .5, d, 'bandpass', 1500 + Math.random() * 1800, 1000 + Math.random() * 1500, 5); }, 300, 1500); },
      tambores: function(g){ var k = 0, pad = [1, 0, .5, 0, .8, 0, .5, .6];
        return laco(function(){ var v = pad[k++ % 8]; if (!v) return; var t = ctx.currentTime, alto = (k % 4 === 1); osc('sine', alto ? 190 : 120, t, .003, .35, v, g, [alto ? 90 : 48, .18]); sopro('branco', t, .001, .06, .25 * v, g, 'lowpass', 1100, 200, .6); }, 330, 330); },
      floresta: function(g){ var s = fonte('rosa', true), f = filtro('lowpass', 420, .7), w = ctx.createGain(); w.gain.value = .35; s.connect(f); f.connect(w); w.connect(g); lfo(.08, .15, w.gain); s.start();
        var gr = [0, 1].map(function(n){ var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 4300 + n * 330; var am = ctx.createGain(); am.gain.value = .0; var l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 17 + n * 3; lg.gain.value = .02; l.connect(lg); lg.connect(am.gain); l.start(); var gg = ctx.createGain(); gg.gain.value = .5; o.connect(am); am.connect(gg); gg.connect(g); o.start(); lfo(.2 + n * .07, .4, gg.gain); return [o, l]; });
        return function(){ s.stop(); gr.forEach(function(p){ p[0].stop(); p[1].stop(); }); }; }
    };

    function efeito(id){ if (!init() || !EFEITOS[id]) return; EFEITOS[id](ctx.currentTime + .03); }
    function camadaLiga(id, nv){
      if (!init() || !CAMADAS[id]) return; if (vivas[id]) return;
      var g = ctx.createGain(); g.gain.value = 0; g.connect(master); var parar = CAMADAS[id](g);
      g.gain.setTargetAtTime(Math.max(.0001, nv), ctx.currentTime, .6); vivas[id] = {g:g, parar:parar};
    }
    function camadaNivel(id, nv){ if (vivas[id]) vivas[id].g.gain.setTargetAtTime(Math.max(.0001, nv), ctx.currentTime, .15); }
    function camadaDesliga(id){
      var c = vivas[id]; if (!c) return; delete vivas[id];
      c.g.gain.setTargetAtTime(.0001, ctx.currentTime, .4); setTimeout(function(){ try { c.parar(); } catch (e) {} try { c.g.disconnect(); } catch (e) {} }, 2200);
    }
    function mestre(p){ S.vol = p; if (master) master.gain.setTargetAtTime(p / 100, ctx.currentTime, .05); }
    function tudo(){ Object.keys(vivas).forEach(camadaDesliga); try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} }
    return {efeito:efeito, liga:camadaLiga, nivel:camadaNivel, desliga:camadaDesliga, mestre:mestre, tudo:tudo, viva:function(id){ return !!vivas[id]; }, EF:EFEITOS, CA:CAMADAS, _ctx:function(){ return ctx; }, _master:function(){ return master; }};
};
