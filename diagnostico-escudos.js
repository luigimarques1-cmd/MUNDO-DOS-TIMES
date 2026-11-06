(() => {
  'use strict';
  const cfg = typeof configuracao === 'object' ? configuracao : null;
  const $ = id => document.getElementById(id);
  if (!cfg || !Array.isArray(cfg.ligas)) {
    $('status').textContent = 'Não foi possível carregar configuracao.js.';
    return;
  }
  const items = cfg.ligas.flatMap(liga => liga.clubes.map(clube => ({
    liga:liga.nome, nome:clube.nome, imagem:clube.imagem
  })));
  $('total').textContent = String(items.length);
  let results=[];
  const getImage = (item, timeoutMs=9500) => new Promise(resolve => {
    if (!item.imagem) {resolve({...item,ok:false,reason:'URL vazia'});return;}
    const image=new Image();
    let complete=false;
    let id;
    const finish=(ok,reason)=>{
      if(complete)return;
      complete=true;clearTimeout(id);image.onload=null;image.onerror=null;
      resolve({...item,ok,reason});
    };
    id=setTimeout(()=>finish(false,'Tempo esgotado'),timeoutMs);
    image.onload=()=>finish(!!image.naturalWidth,image.naturalWidth?'':'Arquivo inválido');
    image.onerror=()=>finish(false,'Erro de carregamento');
    image.src=item.imagem;
  });
  function renderBad(){
    const out=$('results');out.replaceChildren();
    const failures=results.filter(x=>!x.ok);
    if(!failures.length){
      const p=document.createElement('p');p.textContent='Nenhum erro identificado neste teste.';out.append(p);return;
    }
    for(const x of failures){
      const row=document.createElement('div');row.className='result';
      const label=document.createElement('div');label.className='label';label.textContent=x.nome+' — '+x.liga;
      const reason=document.createElement('div');reason.className='reason';reason.textContent=x.reason;
      const url=document.createElement('small');url.textContent=x.imagem||'SEM URL';
      row.append(label,reason,url);out.append(row);
    }
  }
  $('start').addEventListener('click', async () => {
    $('start').disabled=true;$('export').disabled=true;
    results=[];let index=0,passed=0,failed=0;
    $('tested').textContent='0';$('passed').textContent='0';$('failed').textContent='0';
    $('results').replaceChildren();$('status').textContent='Testando escudos…';
    const workers=Array.from({length:Math.min(12,items.length)},async()=>{
      while(index<items.length){
        const i=index++;
        const result=await getImage(items[i]);
        results.push(result);
        if(result.ok)passed++;else failed++;
        $('tested').textContent=String(results.length);
        $('passed').textContent=String(passed);
        $('failed').textContent=String(failed);
        $('status').textContent='Testando '+results.length+' de '+items.length+' escudos…';
      }
    });
    await Promise.all(workers);
    const pos=new Map(items.map((x,i)=>[x.liga+'|'+x.nome,i]));
    results.sort((a,b)=>(pos.get(a.liga+'|'+a.nome)??0)-(pos.get(b.liga+'|'+b.nome)??0));
    $('status').textContent=`Concluído: ${passed} carregaram e ${failed} falharam.`;
    renderBad();$('start').disabled=false;$('start').textContent='Testar novamente';$('export').disabled=false;
  });
  $('export').addEventListener('click',()=>{
    const failed=results.filter(x=>!x.ok);
    const lines=[
      'CATÁLOGO DIGITAL — RELATÓRIO DE IMAGENS DE ESCUDOS',
      'Gerado em: '+new Date().toLocaleString('pt-BR'),
      `Total: ${items.length} | Carregaram: ${results.length-failed.length} | Falharam: ${failed.length}`,
      '',
      'A falha foi registrada no navegador e pode depender da rede ou do servidor.',
      ''
    ];
    for(const x of failed)lines.push(x.nome+' — '+x.liga+'\nMotivo: '+x.reason+'\nURL: '+(x.imagem||'(vazia)')+'\n');
    if(!failed.length)lines.push('Nenhuma falha de carregamento detectada.');
    const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='escudos-que-falharam.txt';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();
