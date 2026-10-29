/* Complete human-readable submission plus native answer metadata for local C review. */
(function () {
  'use strict';
  const label=n=>Number(n).toLocaleString('nl-BE'),safe=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,90)||'leerling';
  function base64(value){const bytes=new TextEncoder().encode(value);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
  async function create(config,state){
    if(!state||state.examId!==config.id||state.version!==config.version||state.revision!==config.revision||state.configSha256!==config.configSha256)throw new Error('De opgeslagen poging hoort niet bij deze toets.');
    const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
    for(const [filename,family,style] of [['NotoSans-Regular.ttf','Noto','normal'],['NotoSans-Bold.ttf','Noto','bold'],['NotoSansMono-Regular.ttf','Code','normal']]){
      const inline=window.ASSESSMENT_ASSETS?.['assessment/vendor/fonts/'+filename];if(!inline)throw new Error('Een PDF-lettertype ontbreekt.');
      pdf.addFileToVFS(filename,inline.split(',')[1]);pdf.addFont(filename,family,style);
    }
    let y=25,section='Toetsgegevens';const margin=18,width=174,bottom=274,evidence={};
    const font=(mono=false,bold=false,size=10)=>{pdf.setFont(mono?'Code':'Noto',bold?'bold':'normal');pdf.setFontSize(size);pdf.setTextColor(22,0,51);};
    function page(title){if(title)section=title;pdf.addPage();y=25;}
    function space(height){if(y+height>bottom)page();}
    function box(id,start,height){if(!id)return;(evidence[id]??=[]).push({page:pdf.getNumberOfPages(),box:[margin/210,(start-4)/297,(margin+width)/210,(start+height)/297]});}
    function text(value,{bold=false,mono=false,size=10,id,gap=3,color}={}){
      font(mono,bold,size);if(color)pdf.setTextColor(...color);
      const lineHeight=size*.48,lines=pdf.splitTextToSize(String(value??''),width);
      for(const line of lines){space(lineHeight+2);if(color)pdf.setTextColor(...color);pdf.text(line,margin,y);box(id,y,lineHeight);y+=lineHeight;}y+=gap;
    }
    function heading(value){space(18);text(value,{bold:true,size:15,color:[82,0,255],gap:6});}
    function answer(value,id,mono=false){if(typeof value!=='string'||!value.trim())text('[Geen antwoord]',{id,color:[98,91,112]});else if(mono)code(value,id);else text(value,{id});}
    function code(source,id,marks=[]){
      font(true,false,9);let at=0;
      for(const originalLine of String(source).split('\n')){
        // Hard wrapping preserves every character; native metadata preserves exact newlines.
        const chunks=originalLine.length?Array.from({length:Math.ceil(originalLine.length/88)},(_,i)=>originalLine.slice(i*88,(i+1)*88)):[''];
        for(let ci=0;ci<chunks.length;ci++){
          const line=chunks[ci],start=at+ci*88;space(6);font(true,false,9);
          for(const mark of marks){const lo=Math.max(mark.start,start),hi=Math.min(mark.end,start+line.length);if(hi>lo){const left=pdf.getTextWidth(line.slice(0,lo-start)),w=pdf.getTextWidth(line.slice(lo-start,hi-start));pdf.setFillColor(255,229,141);pdf.rect(margin+left,y-3.8,w,5.1,'F');}}
          pdf.text(line||' ',margin,y);box(id,y,5);y+=5;
        }
        at+=originalLine.length+1;
      }y+=4;
    }
    async function picture(src,w=125,id){
      const image=new Image();image.src=window.CHAPTER2_ASSETS?.[src]||src;await image.decode();
      let h=w*image.naturalHeight/image.naturalWidth;if(h>190){w*=190/h;h=190;}space(h+8);pdf.addImage(image,'PNG',margin,y,w,h);box(id,y,h);y+=h+6;
    }
    const algorithmLines=(items,depth=0)=>items.flatMap(item=>typeof item==='string'?['  '.repeat(depth)+item]:['  '.repeat(depth)+`herhaal ${item.repeat} keer {`,...algorithmLines(item.body,depth+1),'  '.repeat(depth)+'}']);
    pdf.setProperties({title:`${config.title} - Hoofdstuk 2 - Versie ${config.version} - ${state.identity.name}`,author:'Robbe Wulgaert · AI in de Klas'});
    heading(config.title);text(config.subtitle,{size:11});text(`Hoofdstuk 2 · versie ${config.version} · ${config.totalPoints} punten · maximaal 45 minuten`,{bold:true});
    text(`Naam: ${state.identity.name}\nKlas: ${state.identity.className} · klasnummer: ${state.identity.number}\nLeerkracht: ${config.teacher}\nGestart: ${new Date(state.startedAt).toLocaleString('nl-BE',{timeZone:'Europe/Brussels'})}\nPDF gemaakt: ${new Date().toLocaleString('nl-BE',{timeZone:'Europe/Brussels'})}`);
    text(`Toets: ${config.id} · revisie ${config.revision}\nPoging: ${state.attemptId}`,{size:8,color:[98,91,112]});
    text('Dit bestand bevat de leerlingantwoorden. De leerkracht beoordeelt de toets. De codepreview is geen score. Er geldt geen blokkenfactor.',{size:9});
    for(const [index,group] of config.groups.entries()){
      if(index===0){y+=6;section='1. '+group.title;}else page(`${index+1}. ${group.title}`);
      heading(`${index+1}. ${group.title} · ${label(group.points)} punten`);text(Chapter2Turtle.instructions(group));
      const a=state.answers;
      if(group.id==='q1')answer(a.q1,'q1',true);
      else if(group.id==='q2'){
        for(const [i,trace] of group.traces.entries()){
          if(i){page(`${trace.label}. Figuur kiezen`);heading(`${trace.label} · 1 punt`);}
          else text(`${trace.label} · 1 punt`,{bold:true});
          text('Gegeven algoritme · begin bij Start (0, 0), richting omhoog',{bold:true,size:9});code(algorithmLines(trace.instructions).join('\n'));
          space(118);const gridTop=y;
          for(const [j,option] of trace.options.entries()){
            const x=j%2?110:margin,top=gridTop+Math.floor(j/2)*56;
            font(false,true,9);pdf.text(`Optie ${option.id}${a[trace.id].choice===option.id?' · jouw keuze':''}`,x,top);
            const canvas=document.createElement('canvas');canvas.width=400;canvas.height=260;Chapter2Turtle.draw(canvas,option.figure,{cursor:false});
            pdf.addImage(canvas.toDataURL('image/png'),'PNG',x,top+3,76,49.4);
          }
          box(trace.id,gridTop,112);y=gridTop+117;
          text('Jouw figuurkeuze · 0,5 punt',{bold:true,size:9});answer(a[trace.id].choice,trace.id+'.choice');
          text(trace.countPrompt+' · 0,5 punt',{bold:true,size:9});answer(a[trace.id].count,trace.id+'.count');
        }
      }else if(group.id==='q3'){
        text('Per figuur: 0,5 punt werking, 0,5 punt leesbaarheid, 1,5 punt for-concepten en parameters.',{size:9});
        for(const [i,task] of group.tasks.entries()){
          if(i){page(task.label);heading(`${task.label} · ${label(task.points)} punten`);}else text(`${task.label} · ${label(task.points)} punten`,{bold:true});
          text(task.prompt);
          const result=a[task.id].trim()?Chapter2Turtle.run(a[task.id]):null;
          space(65);const figureTop=y;
          text('Gegeven figuur',{bold:true,size:9});y=figureTop;
          font(false,true,9);pdf.text('Jouw definitieve code · uitvoer',110,y);y+=4;
          const reference=document.createElement('canvas');reference.width=500;reference.height=320;Chapter2Turtle.draw(reference,task.figure,{cursor:false});pdf.addImage(reference.toDataURL('image/png'),'PNG',margin,y,80,51.2);
          if(result){const canvas=document.createElement('canvas');canvas.width=500;canvas.height=320;Chapter2Turtle.draw(canvas,result,{cursor:false});pdf.addImage(canvas.toDataURL('image/png'),'PNG',110,y,80,51.2);box(task.id+'-output',y,51.2);}
          else {font(false,false,9);pdf.text('[Geen code]',110,y+12);}
          y+=59;
          if(result)text(result.status==='ok'?`Uitvoering gestopt na ${result.actions.length} acties. Vergelijking en score door de leerkracht.`:`Uitvoering vraagt controle: ${result.message}`,{id:task.id+'-execution',size:8,gap:3});
          text('Jouw definitieve JavaScript',{bold:true});answer(a[task.id],task.id,true);
        }
      }else if(['q4','q6','q7'].includes(group.id)){
        const rows=group.terms||group.rows;for(const [i,row] of rows.entries()){space(23);text(`${index+1}${String.fromCharCode(97+i)}. ${row}`,{bold:true});answer(a[group.id][i],`${group.id}-${i}`,group.id==='q6');}
      }else if(group.id==='q8'){
        for(const [i,row] of group.rows.entries()){
          space(35);text(`Rij ${i+1} · volgorde: ${a.q8[i].order||'[Geen antwoord]'}`,{bold:true,id:`q8-${i}-order`});
          text(`${row.name?'Gegeven naam':'Jouw naam'}: ${row.name||a.q8[i].name||'[Geen antwoord]'}`,{id:row.name?null:`q8-${i}-name`});
          text(`${row.description?'Gegeven uitleg':'Jouw uitleg'}: ${row.description||a.q8[i].description||'[Geen antwoord]'}`,{id:row.description?null:`q8-${i}-description`});y+=3;
        }
        space(45);heading('Terugblik · geen punten');answer(a.reflection,'reflection');text(`Verwachte score op ${label(config.totalPoints)}`,{bold:true});answer(a.estimate,'estimate');
      }
    }
    const count=pdf.getNumberOfPages();for(let i=1;i<=count;i++){
      pdf.setPage(i);font(false,false,8);pdf.setTextColor(98,91,112);pdf.text(`${state.identity.name} · ${state.identity.className} · Hoofdstuk 2 · ${config.version}`,margin,12);pdf.setDrawColor(226,221,234);pdf.line(margin,16,192,16);pdf.text('© 2026 Robbe Wulgaert · AI in de Klas · robbewulgaert.be',margin,287);pdf.text(`${i} / ${count}`,192,287,{align:'right'});
    }
    const payload={schemaVersion:1,examId:config.id,version:config.version,revision:config.revision,attemptId:state.attemptId,identity:state.identity,answers:state.answers,sourceSha256:config.sourceSha256,configSha256:config.configSha256,startedAt:state.startedAt,expiresAt:state.expiresAt,evidence};
    pdf.setProperties({subject:'BLOCKLY-CH2-V1:'+base64(JSON.stringify(payload))});
    const blob=pdf.output('blob'),filename=`${safe(state.identity.name)}-${safe(state.identity.className)}-Toets_Turtle_H2_${config.version}.pdf`;
    return {blob,filename,payload};
  }
  window.Chapter2PDF={create};
})();
