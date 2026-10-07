/* Complete assessment export. © 2026 Robbe Wulgaert · AI in de Klas. */
(function () {
  'use strict';
  const fontCache={};
  async function fontData(path) {
    if(fontCache[path])return fontCache[path];
    const inline=window.ASSESSMENT_ASSETS?.[path];
    if(inline)return fontCache[path]=inline.slice(inline.indexOf(',')+1);
    const response=await fetch(path);if(!response.ok)throw new Error('PDF-lettertype ontbreekt: '+path);
    const bytes=new Uint8Array(await response.arrayBuffer());let binary='';
    for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));
    return fontCache[path]=btoa(binary);
  }
  async function loadImage(src) {
    const image=new Image();image.src=window.ASSESSMENT_ASSETS?.[src]||src;await image.decode();return image;
  }
  const label=n=>Number(n).toLocaleString('nl-BE',{maximumFractionDigits:2});
  const pointText=n=>`${label(n)} ${Number(n)===1?'punt':'punten'}`;
  const safeName=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,90)||'leerling';
  async function exportAssessment(config,state) {
    const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
    const [regular,bold,mono]=await Promise.all([
      fontData('assessment/vendor/fonts/NotoSans-Regular.ttf'),fontData('assessment/vendor/fonts/NotoSans-Bold.ttf'),fontData('assessment/vendor/fonts/NotoSansMono-Regular.ttf')]);
    [['NotoSans-Regular.ttf',regular,'Noto','normal'],['NotoSans-Bold.ttf',bold,'Noto','bold'],['NotoSansMono-Regular.ttf',mono,'Code','normal']].forEach(([name,data,family,style])=>{pdf.addFileToVFS(name,data);pdf.addFont(name,family,style);});
    const margin=18,width=174,bottom=276;let y=25;
    const purple=[82,0,255],ink=[22,0,51],muted=[98,91,112];
    function page(){pdf.addPage();y=25;}
    function space(height){if(y+height>bottom)page();}
    function font(family='Noto',style='normal',size=10,color=ink){pdf.setFont(family,style);pdf.setFontSize(size);pdf.setTextColor(...color);}
    function text(value,{size=10,bold=false,color=ink,gap=3}={}) {
      font('Noto',bold?'bold':'normal',size,color);
      const lines=pdf.splitTextToSize(String(value||''),width),lineHeight=size*.49;
      for(const line of lines){space(lineHeight);pdf.text(line,margin,y);y+=lineHeight;}
      y+=gap;
    }
    function heading(value){space(18);y+=4;text(value,{size:15,bold:true,color:purple,gap:5});}
    function blankAnswer(){text('[Geen antwoord]',{color:muted});}
    function codeLines(code,marks=[]) {
      const value=String(code||'');if(!value.trim()){blankAnswer();return;}
      font('Code','normal',8.5);
      const charWidth=pdf.getTextWidth('M'),maxChars=Math.floor((width-4)/charWidth),lineHeight=4.5;
      let start=0;
      for(const rawLine of value.split('\n')) {
        let local=0;
        do {
          const chunk=rawLine.slice(local,local+maxChars);space(lineHeight+2);
          pdf.setFillColor(248,247,251);pdf.rect(margin-1,y-3.5,width+2,lineHeight+1,'F');
          for(const mark of marks){
            const a=Math.max(mark.start,start+local),b=Math.min(mark.end,start+local+chunk.length);
            if(a>=b)continue;
            const before=chunk.slice(0,a-start-local),selected=chunk.slice(a-start-local,b-start-local);
            pdf.setFillColor(...(mark.kind==='action'?[255,228,92]:[134,237,181]));
            pdf.rect(margin+pdf.getTextWidth(before),y-3.3,pdf.getTextWidth(selected),lineHeight,'F');
          }
          pdf.setTextColor(...ink);pdf.text(chunk||' ',margin,y);y+=lineHeight;local+=maxChars;
        } while(local<rawLine.length);
        start+=rawLine.length+1;
      }
      y+=5;
    }
    async function picture(src,maxWidth=width,pixelScale=null) {
      const image=await loadImage(src),drawWidth=Math.min(maxWidth,width,pixelScale?image.naturalWidth/pixelScale*0.2646:width),ratio=drawWidth/image.naturalWidth;
      const maxSlicePixels=Math.max(1,Math.floor(230/ratio));let offset=0;
      while(offset<image.naturalHeight){
        const available=bottom-y-6;
        if(available<25){page();continue;}
        const sliceHeight=Math.min(image.naturalHeight-offset,maxSlicePixels,Math.max(1,Math.floor(available/ratio)));
        const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=sliceHeight;
        const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(image,0,offset,image.naturalWidth,sliceHeight,0,0,image.naturalWidth,sliceHeight);
        pdf.addImage(canvas.toDataURL('image/png'),'PNG',margin,y,drawWidth,sliceHeight*ratio);
        y+=sliceHeight*ratio+5;offset+=sliceHeight;if(offset<image.naturalHeight)page();
      }
    }
    let host=null,runtime=null;
    try {
      pdf.setProperties({title:`${config.title} - Versie ${config.version} - ${state.identity.name}`,author:'Robbe Wulgaert · AI in de Klas',subject:'Leerlingantwoorden; handmatige beoordeling'});
      text(config.title,{size:21,bold:true,color:purple});text(config.subtitle,{size:11,color:muted});
      text(`Versie ${config.version} · toets op ${label(config.totalPoints)} punten`,{bold:true});
      text(`Naam: ${state.identity.name}\nKlas: ${state.identity.className} · klasnummer: ${state.identity.number}\nLeerkracht: ${config.teacher}\nGestart: ${new Date(state.startedAt).toLocaleString('nl-BE',{timeZone:'Europe/Brussels'})}\nPDF gemaakt: ${new Date().toLocaleString('nl-BE',{timeZone:'Europe/Brussels'})}`);
      const maximum=config.totalPoints-config.exercises.reduce((sum,e)=>sum+(state.exercises[e.id].choice==='blocks'?e.points/2:0),0);
      text(`Maximum met de gekozen antwoordtypes: ${label(maximum)} / ${label(config.totalPoints)}. Dit is geen behaalde score.`,{bold:true});
      text('Blokken: maximaal 50% van de oefenpunten. JavaScript: maximaal 100%. De leerkracht beoordeelt de oplossing. Alleen het gekozen antwoordtype wordt ingediend.',{color:muted});
      text(`Poging: ${state.attemptId}`,{size:8,color:muted});
      for(const [index,group] of config.groups.entries()) {
        if(group.type!=='coding') {
          space(group.type==='ordering'?140:55);
          heading(`${index+1}. ${group.title} — ${pointText(group.points)}`);text(group.prompt);
        }
        if(group.asset)await picture(group.asset,95);
        if(group.codeSample){text('Gegeven programma',{bold:true});codeLines(group.codeSample);}
        if(group.type==='open')text('Taalzorg: gebruik hoofdletters en leestekens. Schrijf je uitleg in duidelijke, volledige zinnen.',{size:9,color:muted});
        if(group.rows) {
          const ordered=group.parts?group.parts.flatMap(part=>part.indices.map((i,index)=>({i,row:group.rows[i],part:index===0?part:null}))):group.rows.map((row,i)=>({i,row,part:null}));
          for(const {i,row,part} of ordered) {
            if(part){space(24);text(part.title,{bold:true,color:purple});}
            space(16);text(row[1],{bold:true});
            if(group.type==='short'&&!group.parts)text(row[0],{size:8,color:muted});
            const answer=state.answers[group.id]?.[i];
            if(!String(answer||'').trim())blankAnswer();else if(group.type==='correction')codeLines(answer);else text(answer);
          }
        } else if(group.type==='coding') {
          for(const exercise of config.exercises){
            page();const ex=state.exercises[exercise.id],branch=ex.choice;
            heading(`4.${config.exercises.indexOf(exercise)+1}. ${exercise.title} — ${pointText(exercise.points)}`);
            if(config.exercises.indexOf(exercise)===0){text(`Vraag 4: ${group.title} · totaal ${label(group.points)} punten`,{size:8,color:muted});text(group.prompt,{size:8,color:muted});}
            text(`Gekozen antwoordtype: ${branch==='blocks'?'Blokken':branch==='code'?'JavaScript':'Geen keuze'} · maximum: ${label(branch==='blocks'?exercise.points/2:exercise.points)} / ${label(exercise.points)}`,{bold:true});
            for(const requirement of exercise.requirements||[])text(`Vereiste voor beide antwoordtypes: ${requirement}`,{bold:true,size:9});
            text('Beoordeling: werking, gevraagde concepten en duidelijke structuur. Bij JavaScript ook correcte syntax, één instructie per regel en passende inspringingen.',{size:9,color:muted});
            text('Oorspronkelijke figuur',{size:9,color:muted});await picture(exercise.asset,58);
            if(!branch){blankAnswer();continue;}
            const draft=ex.drafts[branch];heading('Jouw definitieve antwoord');
            if(branch==='code')codeLines(draft.code,draft.markings);
            host=document.createElement('div');host.style.cssText='position:fixed;left:-12000px;top:0;width:900px;height:650px;pointer-events:none;';
            const blockly=document.createElement('div');blockly.style.cssText='width:900px;height:650px;';host.appendChild(blockly);
            const canvas=document.createElement('canvas');canvas.width=420;canvas.height=420;canvas.style.cssText='width:420px;height:420px;';host.appendChild(canvas);document.body.appendChild(host);
            runtime=new window.AssessmentMaze({blocklyElement:blockly,canvas});
            runtime.mount({...exercise,mode:branch,workspace:branch==='blocks'?draft.workspace:null,code:branch==='code'?draft.code:'',markings:branch==='blocks'?draft.markings:{}});
            await runtime.ready();
            if(branch==='blocks') {
              if(draft.workspace?.blocks?.blocks?.length){const evidence=await runtime.getBlockEvidence();if(!evidence)throw new Error('Een blokkenantwoord kon niet worden afgebeeld.');await picture(evidence,width,3);}
              else blankAnswer();
            }
            const result=ex.results[branch];
            if(exercise.explanationPrompt){space(30);heading('Waarom werkt jouw algoritme?');text(exercise.explanationPrompt,{size:9});if(draft.explanation?.trim())text(draft.explanation);else blankAnswer();}
            space(98);heading('Maze-weergave');await picture(runtime.snapshot(result?.position),58);
            text(result?`Laatste uitvoering: ${result.status==='reached'?'doel bereikt':result.status==='error'?'uitvoeringsfout':'doel niet bereikt'} · ${result.steps} stappen/controles${result.message?'\n'+result.message:''}`:'Dit antwoord werd nog niet uitgevoerd.',{size:9,color:muted});
            text(`Score leerkracht: ______ / ${label(branch==='blocks'?exercise.points/2:exercise.points)} (oefening op ${label(exercise.points)})`,{bold:true});
            runtime.dispose();runtime=null;host.remove();host=null;
          }
        } else if(group.type==='marking') {
          text('Geel = actie (A). Groen = voorwaarde (V). De kleuren/labels zijn door de leerling gekozen; ze zijn geen automatische correctie.',{color:muted});
          for(const exercise of config.exercises){
            const ex=state.exercises[exercise.id];text(exercise.title,{bold:true});
            if(ex.needsReview)text('LET OP: antwoord gewijzigd; markeringen nog na te kijken.',{bold:true});
            const marks=ex.choice==='code'?ex.drafts.code.markings:ex.choice==='blocks'?Object.values(ex.drafts.blocks.markings):[];
            if(!marks.length)text('[Geen markeringen]',{color:muted});
            else if(ex.choice==='code')for(const mark of marks){text(`${mark.kind==='action'?'Actie (geel)':'Voorwaarde (groen)'}:`,{bold:true,size:9});codeLines(ex.drafts.code.code.slice(mark.start,mark.end));}
            else text(`${marks.filter(m=>m.kind==='action').length} blokken gemarkeerd als actie; ${marks.filter(m=>m.kind==='condition').length} als voorwaarde. Zie de A/V-labels bij de blokken in vraag 4.`);
          }
        }
        if(group.type!=='coding')text(`Score leerkracht: ______ / ${label(group.points)}`,{size:9,bold:true});
      }
      heading('Beoordeling en feedback');text(`Totaal: ______ / ${label(config.totalPoints)}\nFeedback leerkracht:\n\n\n\n`);
      text('Deze PDF bevat leerlingantwoorden. Upload dit bestand in Smartschool en controleer daar de indiening.',{size:9,color:muted});
      for(let p=1;p<=pdf.getNumberOfPages();p++){
        pdf.setPage(p);font('Noto','normal',7,muted);pdf.setDrawColor(226,221,234);pdf.line(margin,16,192,16);
        const header=`${state.identity.name} · ${state.identity.className} · ${config.title} · ${config.version}`;
        const headerLines=pdf.splitTextToSize(header,width);
        pdf.text(headerLines[0]+(headerLines.length>1?'…':''),margin,12);
        pdf.text('© 2026 Robbe Wulgaert · AI in de Klas · robbewulgaert.be',margin,287);
        pdf.text(`${p} / ${pdf.getNumberOfPages()}`,192,287,{align:'right'});
      }
      const filename=`${safeName(state.identity.name)}-${safeName(state.identity.className)}-Toets_Maze_${safeName(config.version)}.pdf`;
      pdf.save(filename);return {filename};
    } finally {runtime?.dispose();host?.remove();}
  }
  window.AssessmentPDF={export:exportAssessment};
})();
