@echo off
cd /d "%~dp0"
echo Abrindo a Trilha do Cordeiro. Deixe esta janela aberta durante a sessao.
start "" http://localhost:8765/index.html
python -m http.server 8765
