#!/bin/bash
set -x
cd tmp_mun
q(){ curl -sSL -m 180 "https://apisidra.ibge.gov.br/$1" -o s.json; echo "== $1 $(wc -c < s.json)" >> sidra2.txt; python3 -c "
import json,sys
try:
  d=json.load(open('s.json'))
  if isinstance(d,list): print(len(d), d[0] if d else '', d[1] if len(d)>1 else '')
  else: print(str(d)[:1500])
except Exception as e: print('ERRO', e, open('s.json').read()[:300])" >> sidra2.txt; }
# metadados das tabelas (produtos, variáveis, períodos)
for t in 5457 3939 5938 6579 4709 1612; do curl -sSL -m 60 "https://servicodados.ibge.gov.br/api/v3/agregados/$t/metadados" -o m.json; python3 -c "
import json; d=json.load(open('m.json')); print('==',d.get('id'),d.get('nome')); print(' periodos', d.get('periodicidade'))
print(' variaveis', [(v['id'],v['nome']) for v in d.get('variaveis',[])][:12])
for c in d.get('classificacoes',[]):
  cats=[(x['id'],x['nome']) for x in c['categorias'] if any(k in x['nome'] for k in ('Soja','Milho','Algod','Bovino','Total','Cana'))]
  print(' class', c['id'], c['nome'], cats[:12])" >> meta.txt 2>&1; curl -sSL -m 60 "https://servicodados.ibge.gov.br/api/v3/agregados/$t/periodos" | head -c 600 >> meta.txt; echo >> meta.txt; done
q "values/t/6579/n6/in%20n3%2051/v/9324/p/all"
q "values/t/5938/n6/in%20n3%2051/v/37,513/p/all"
# TSE: cabeçalhos e tamanhos 2012, 2016, 2024
for a in 2012 2016 2024; do
  curl -sSL -m 900 "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_$a.zip" -o v.zip
  echo "== $a $(wc -c < v.zip)" >> tse2.txt; unzip -l v.zip | grep -E "_MT|_GO|BRASIL" >> tse2.txt
  f=$(unzip -l v.zip | grep -oE "votacao_candidato_munzona_${a}_MT\.(csv|txt)" | head -1)
  unzip -p v.zip "$f" | iconv -f latin1 -t utf-8 | head -3 >> tse2.txt
  unzip -p v.zip "$f" | iconv -f latin1 -t utf-8 | grep -iE "prefeito" | head -3 >> tse2.txt
  rm -f v.zip
done
rm -f s.json m.json; ls -la
