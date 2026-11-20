/* Ponte: leva comandos do notebook (Mestre) ao tablet (tela.html).
   Não há servidor próprio: usa o canal público ntfy.sh (as mensagens são minúsculas: só o caminho de uma imagem)
   e, quando as duas páginas estão no mesmo navegador, o BroadcastChannel. */
(function(){
  'use strict';
  var ALF = 'abcdefghjkmnpqrstuvwxyz23456789';
  function base(){ try { return localStorage.getItem('otl-ntfy-base') || 'https://ntfy.sh'; } catch(e){ return 'https://ntfy.sh'; } }
  function novoCodigo(){ var s = '', a = new Uint8Array(6); crypto.getRandomValues(a); for (var i = 0; i < a.length; i++) s += ALF[a[i] % ALF.length]; return s; }
  function limpa(c){ return String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12); }
  function abrir(codigo, onMsg, onEstado){
    codigo = limpa(codigo);
    var topo = 'otl-' + codigo, eu = Math.random().toString(36).slice(2, 8), es = null, bc = null, fechado = false, vistas = {};
    function entrega(m){
      if (!m || m.de === eu) return;
      var k = m.de + ':' + m.ts; if (vistas[k]) return; vistas[k] = 1;
      try { onMsg(m); } catch(e){}
    }
    try { bc = new BroadcastChannel('otl-' + codigo); bc.onmessage = function(ev){ entrega(ev.data); }; } catch(e){}
    function liga(){
      if (fechado || typeof EventSource === 'undefined') return;
      try {
        es = new EventSource(base() + '/' + topo + '/sse?since=latest');
        es.onopen = function(){ if (onEstado) onEstado('on'); };
        es.onerror = function(){ if (onEstado) onEstado('off'); };
        es.onmessage = function(ev){
          try { var d = JSON.parse(ev.data); if (d.event && d.event !== 'message') return; entrega(JSON.parse(d.message)); } catch(e){}
        };
      } catch(e){ if (onEstado) onEstado('off'); }
    }
    liga();
    return {
      codigo: codigo, eu: eu,
      enviar: function(m){
        m = Object.assign({de: eu, ts: Date.now()}, m);
        try { if (bc) bc.postMessage(m); } catch(e){}
        return fetch(base() + '/' + topo, {method: 'POST', body: JSON.stringify(m)})
          .then(function(r){ return r.ok; }).catch(function(){ return false; });
      },
      fechar: function(){ fechado = true; try { if (es) es.close(); } catch(e){} try { if (bc) bc.close(); } catch(e){} }
    };
  }
  window.Ponte = {abrir: abrir, novoCodigo: novoCodigo, limpa: limpa};
})();
