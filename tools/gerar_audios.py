#!/usr/bin/env python3
"""Gera TODAS as vozes, falas e sons do one-shot na ElevenLabs e grava em audio/.
Uso:  python tools/gerar_audios.py          (pede a chave; ela não é salva em lugar nenhum)
      ELEVEN_KEY=sk_... python tools/gerar_audios.py
Pode rodar de novo: o que já existe em audio/ é pulado. Depois faça commit da pasta audio/.
"""
import os, sys, json, hashlib, getpass, urllib.request, urllib.error, base64
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(RAIZ, 'audio'); os.makedirs(AUD + '/falas', exist_ok=True); os.makedirs(AUD + '/fx', exist_ok=True); os.makedirs(AUD + '/cam', exist_ok=True)
KEY = os.environ.get('ELEVEN_KEY') or getpass.getpass('Chave da ElevenLabs (não aparece e não fica salva): ').strip()
PED = json.load(open(os.path.join(RAIZ, 'tools', 'pedidos.json'), encoding='utf-8'))
MAN = os.path.join(AUD, 'manifest.json'); VOZ = os.path.join(AUD, 'vozes.json')
man = json.load(open(MAN, encoding='utf-8')) if os.path.exists(MAN) else {'fx': {}, 'cam': {}, 'falas': {}}
vozes = json.load(open(VOZ, encoding='utf-8')) if os.path.exists(VOZ) else {}

def api(caminho, corpo=None, bin=False):
    req = urllib.request.Request('https://api.elevenlabs.io' + caminho, data=json.dumps(corpo).encode() if corpo is not None else None,
        headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=180) as r: d = r.read()
    except urllib.error.HTTPError as e:
        raise SystemExit('Erro %s em %s: %s' % (e.code, caminho, e.read()[:300].decode('utf-8', 'ignore')))
    return d if bin else json.loads(d)

# 1) uma voz por personagem (Voice Design). A descrição já diz o gênero; confirmo pelo rótulo quando a API devolve.
for pid, v in PED['vozes'].items():
    if pid in vozes: continue
    print('Criando a voz de', pid, '(' + v['genero'] + ')...')
    desc = v['desc']
    d = api('/v1/text-to-voice/design', {'voice_description': desc, 'auto_generate_text': True})
    prev = d['previews'][0]
    nova = api('/v1/text-to-voice', {'voice_name': 'OTL ' + pid, 'voice_description': desc, 'generated_voice_id': prev['generated_voice_id']})
    vozes[pid] = nova['voice_id']; json.dump(vozes, open(VOZ, 'w', encoding='utf-8'), indent=1)

# 2) falas
for pid, texto in PED['falas']:
    k = pid + '|' + texto
    if k in man['falas'] and os.path.exists(os.path.join(AUD, man['falas'][k])): continue
    nome = 'falas/%s_%s.mp3' % (pid, hashlib.md5(texto.encode()).hexdigest()[:10])
    print('Fala', pid, ':', texto[:50])
    mp3 = api('/v1/text-to-speech/%s?output_format=mp3_44100_64' % vozes[pid], {'text': texto, 'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': .28, 'similarity_boost': .8, 'style': .75, 'use_speaker_boost': True}}, bin=True)
    open(os.path.join(AUD, nome), 'wb').write(mp3); man['falas'][k] = nome
    json.dump(man, open(MAN, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)

# 3) efeitos e sons de fundo
for tipo in ('fx', 'cam'):
    for sid, p in PED[tipo].items():
        nome = '%s/%s.mp3' % (tipo, sid)
        if sid in man[tipo] and os.path.exists(os.path.join(AUD, nome)): continue
        print('Som', tipo, sid)
        corpo = {'text': p['prompt'], 'prompt_influence': .5, 'model_id': 'eleven_text_to_sound_v2', 'duration_seconds': max(.5, min(30, p['seg']))}
        if tipo == 'cam': corpo['loop'] = True
        open(os.path.join(AUD, nome), 'wb').write(api('/v1/sound-generation', corpo, bin=True)); man[tipo][sid] = nome
        json.dump(man, open(MAN, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('Pronto. Agora: git add audio && git commit -m "audios" && git push')
