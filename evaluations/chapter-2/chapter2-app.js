/* Chapter 2 student assessment. © 2026 Robbe Wulgaert · AI in de Klas. */
(async function () {
  'use strict';
  const $=id=>document.getElementById(id);
  const modes=window.Chapter2AnswerModes;
  let config=window.ASSESSMENT_CONFIG;
  const delivery=modes?.requested(location.search,config.version);
  const choiceEnabled=Boolean(delivery);
  const blocksPilot=delivery==='practice';
  if(choiceEnabled){
    document.title=(blocksPilot?'Oefenversie':'Toets')+' Turtle · '+config.version+' · Blokken of JavaScript';
    const submit=$('start-form').querySelector('button[type="submit"]');
    const note=document.createElement('p');
    note.className='callout';
    note.textContent=blocksPilot?'Oefenversie · Kies bij vraag 3a en 3b voor blokken of JavaScript. Je PDF is bedoeld om te oefenen.':
      'Toets met blokkenkeuze · Kies bij vraag 3a en 3b voor blokken of JavaScript.';
    $('gate-title').after(note);
    if(blocksPilot)$('gate').querySelector('li:last-child').textContent='Bewaar je oefen-PDF op dit toestel.';
    submit.disabled=true;
    $('gate-error').textContent='Blokkeneditor laden…';
    try{
      config=await modes.prepare(config,delivery);
      await modes.loadEditor();
    }catch(error){
      $('gate-error').textContent='De blokkenversie kon niet worden geladen. Open de pagina opnieuw of vraag je leerkracht om hulp.';
      console.error(error);
      return;
    }
    submit.disabled=false;
    $('gate-error').textContent='';
  }
  const practice=window.AssessmentPractice?.create(config);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const points=n=>Number(n).toLocaleString('nl-BE');
  const prefix=`blockly-assessment:${config.id}:${config.version}:${choiceEnabled?delivery+'-blocks:':''}`;
  const blockEditors=new Map();
  let state=null,current='q1',saveTimer,timer,expired=false,lastWarning='',exporting=false,downloadUrl=null;
  function blankAnswers(){return {q1:'',q2a:{choice:'',count:''},q2b:{choice:'',count:''},q2c:{choice:'',count:''},q3a:choiceEnabled?modes.blankDraft():'',q3b:choiceEnabled?modes.blankDraft():'',q4:Array(6).fill(''),q6:Array(3).fill(''),q7:Array(2).fill(''),q8:Array.from({length:5},()=>({order:'',name:'',description:''})),reflection:'',estimate:''};}
  function fresh(identity){const now=Date.now();return {schemaVersion:1,examId:config.id,version:config.version,revision:config.revision,sourceSha256:config.sourceSha256,configSha256:config.configSha256,attemptId:crypto.randomUUID(),identity,startedAt:new Date(now).toISOString(),expiresAt:now+config.durationMinutes*60000,answers:blankAnswers(),lastExport:null};}
  function valid(saved,identity){
    return saved&&saved.schemaVersion===1&&saved.examId===config.id&&saved.version===config.version&&saved.revision===config.revision&&saved.sourceSha256===config.sourceSha256&&saved.configSha256===config.configSha256&&saved.attemptId&&Number.isFinite(saved.expiresAt)&&JSON.stringify(saved.identity)===JSON.stringify(identity)&&saved.answers&&Object.keys(blankAnswers()).every(key=>Object.hasOwn(saved.answers,key))&&['q2a','q2b','q2c'].every(key=>['','A','B','C','D'].includes(saved.answers[key]?.choice)&&typeof saved.answers[key]?.count==='string')&&saved.answers.q4?.length===6&&saved.answers.q6?.length===3&&saved.answers.q7?.length===2&&saved.answers.q8?.length===5&&(!choiceEnabled||modes.ids.every(id=>modes.validDraft(saved.answers[id])));
  }
  function storeBlocks(id,workspace){
    const draft=state.answers[id];
    if(expired||draft.mode!=='blocks'||JSON.stringify(draft.blocks)===JSON.stringify(workspace))return false;
    draft.blocks=workspace;
    invalidateDownload();
    return true;
  }
  function captureBlocks(){for(const [id,editor] of blockEditors)storeBlocks(id,editor.snapshot());}
  function disposeBlocks(){for(const editor of blockEditors.values())editor.dispose();blockEditors.clear();}
  function persist(){
    if(!state)return;
    captureBlocks();
    clearTimeout(saveTimer);
    try{localStorage.setItem(prefix+state.attemptId,JSON.stringify(state));localStorage.setItem(prefix+'active',state.attemptId);$('save-status').textContent='Opgeslagen op dit toestel';$('save-status').classList.remove('failed');}
    catch(error){$('save-status').textContent='Opslaan mislukt · download je PDF';$('save-status').classList.add('failed');}
  }
  function invalidateDownload(){
    state.lastExport=null;
    if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=null;}
  }
  function changed(){if(!state)return;invalidateDownload();$('save-status').textContent='Bezig met opslaan…';clearTimeout(saveTimer);saveTimer=setTimeout(persist,200);updateNav();}
  function filled(value){return typeof value==='string'&&value.trim().length>0;}
  function answered(group){const a=state.answers;switch(group.id){case 'q1':return filled(a.q1);case 'q2':return ['q2a','q2b','q2c'].every(id=>filled(a[id].choice)&&filled(a[id].count));case 'q3':return group.tasks.every(task=>choiceEnabled?!modes.selected(task.id,a[task.id]).blank:filled(a[task.id]));case 'q4':case 'q6':case 'q7':return a[group.id].every(filled);case 'q8':return a.q8.every((row,i)=>filled(row.order)&&(group.rows[i].name||filled(row.name))&&(group.rows[i].description||filled(row.description)));default:return false;}}
  function updateNav(){if(!state)return;$('question-nav').innerHTML=config.groups.map((g,i)=>`<button type="button" class="nav-button" data-go="${g.id}" ${current===g.id?'aria-current="step"':''}><span class="nav-number">${i+1}</span><span>${esc(g.title)}</span>${answered(g)?'<span class="done" aria-label="Ingevuld">✓</span>':''}</button>`).join('');$('progress-label').textContent=`${config.groups.filter(answered).length} / ${config.groups.length} onderdelen ingevuld`;}
  function heading(group){return `<div class="question-heading"><div><span class="eyebrow">VRAAG ${config.groups.indexOf(group)+1} VAN ${config.groups.length}</span><h1>${esc(group.title)}</h1></div><span class="points">${points(group.points)} punten</span></div><p class="instructions">${esc(Chapter2Turtle.instructions(group))}</p>`;}
  function footer(group){
    const i=config.groups.indexOf(group), next=config.groups[i+1];
    return `<div class="question-footer">${i?`<button type="button" data-go="${config.groups[i-1].id}">← Vorige vraag</button>`:'<span></span>'}<button type="button" class="primary" data-next="${next?.id||'review'}">${next?'Volgende vraag':practice?'Afronden & voorbeelden':'Overzicht & PDF'} →</button></div>`;
  }
  const textarea=(id,value,label,classes='',rows=4)=>`<label for="${id}">${esc(label)}</label><textarea id="${id}" data-answer="${id}" class="${classes}" rows="${rows}" spellcheck="false" maxlength="40000">${esc(value)}</textarea>`;
  function algorithm(items){return items.map(item=>typeof item==='string'?`<div class="action-block">${esc(item)}</div>`:`<div class="repeat-block">herhaal ${item.repeat} keer<div class="repeat-body">${algorithm(item.body)}</div></div>`).join('');}
  function traceChoices(group){return group.traces.map(trace=>`<section class="card trace-card"><h2>${trace.label} · Lees het algoritme <small>(1 punt)</small></h2><div class="trace-layout"><div class="algorithm" aria-label="Gegeven algoritme voor ${trace.label}">${algorithm(trace.instructions)}</div><div><fieldset class="trace-options"><legend>Kies de passende figuur · 0,5 punt</legend><div class="figure-options">${trace.options.map(option=>`<label class="figure-option"><input type="radio" name="${trace.id}" data-choice="${trace.id}" value="${option.id}" aria-label="${trace.label}: optie ${option.id}" ${state.answers[trace.id].choice===option.id?'checked':''}><span>Optie ${option.id}</span><canvas id="figure-${trace.id}-${option.id}" width="400" height="280" role="img" aria-label="${esc(option.alt)}"></canvas></label>`).join('')}</div></fieldset><button type="button" data-clear-choice="${trace.id}">Wis mijn keuze</button><label class="trace-count">${esc(trace.countPrompt)} · 0,5 punt<input id="${trace.id}-count" data-answer="${trace.id}-count" inputmode="numeric" maxlength="30" value="${esc(state.answers[trace.id].count)}" aria-label="Aantal lijnstukken ${trace.label}"></label></div></div></section>`).join('');}
  function taskEditor(task){
    const id=task.id;
    if(!choiceEnabled)return textarea(id,state.answers[id],'Jouw JavaScript voor '+task.label,'task-code',10);
    const draft=state.answers[id];
    const choices=Object.entries(modes.labels).map(([mode,label])=>`<label><input type="radio" name="mode-${id}" data-answer-mode="${id}" value="${mode}" ${draft.mode===mode?'checked':''}> ${label} · max. ${points(modes.maximum(task,mode))}</label>`).join('');
    const selector=`<fieldset class="turtle-mode"><legend>Hoe maak je ${esc(task.label)}?</legend>${choices}</fieldset>`;
    const editor=draft.mode==='code'?textarea(id,draft.code,'Jouw JavaScript voor '+task.label,'task-code',10):
      draft.mode==='blocks'?`<div id="blocks-${id}" class="turtle-blocks" role="group" aria-label="Blokkeneditor voor ${esc(task.label)}"></div><p class="field-note">Verbind je opdrachten in één reeks. De bloklus telt tot en met de eindwaarde.</p>`:'';
    return selector+editor;
  }
  function codeTasks(group){
    const explanation=choiceEnabled
      ? 'Kies per figuur. Met JavaScript kan je 2,5 punten halen. Met blokken telt je score voor de helft en kan je 1,25 punten halen.'
      : 'Per figuur: 0,5 punt werking · 0,5 punt leesbaarheid · 1,5 punt voor de for-lus en de juiste parameters. Voer je code uit om jouw tekening te bekijken.';
    return `<p class="callout">${explanation}</p>`+group.tasks.map(task=>{
      const id=task.id;
      const mode=choiceEnabled?state.answers[id].mode:'code';
      const actions=mode?`<div class="button-row"><button type="button" class="primary" data-run="${id}" aria-controls="output-${id}" aria-label="Voer ${mode==='blocks'?'blokken':'code'} van ${id.slice(1)} uit">▶ Voer mijn ${mode==='blocks'?'blokken':'code'} uit</button><button type="button" data-reset-output="${id}">Wis uitvoer</button></div>`:'';
      return `<section class="card turtle-task"><h2>${esc(task.label)} <small>(${points(task.points)} punten)</small></h2>
        <ul class="reference-summary">${task.prompt.map(line=>`<li>${esc(line)}</li>`).join('')}</ul>
        <div class="code-workbench"><div class="editor-pane">${taskEditor(task)}${actions}
          <p id="result-${id}" class="runtime-result" role="status" aria-live="polite"></p></div>
          <div class="preview-pane"><div class="target-pane"><h3>Doelfiguur</h3><canvas id="target-${id}" class="turtle-target" width="500" height="280" role="img" aria-label="${esc(task.alt)}"></canvas></div>
          <div class="output-pane" id="preview-${id}"><h3>Jouw tekening</h3><canvas id="output-${id}" class="turtle-output" width="500" height="320" tabindex="-1" role="img" aria-label="Uitvoer van jouw Turtle-programma voor ${esc(task.label)}"></canvas><p class="field-note">Start is (0, 0), richting omhoog, pen omlaag. Vergelijk zelf met het doel; dit is geen score.</p></div></div>
        </div></section>`;
    }).join('');
  }
  function paintPreview(id,scroll=false){
    const saved=state.previews?.[id];
    const selected=choiceEnabled?modes.selected(id,state.answers[id]):null;
    const mode=choiceEnabled?selected.mode:'code';
    const emptyMessage=mode==='blocks'?'Plaats eerst Turtle-blokken en klik op uitvoeren.':mode==='code'?'Schrijf eerst Turtle-code en klik op uitvoeren.':'Kies blokken of JavaScript om te beginnen.';
    const blank={status:'empty',segments:[],turtle:{x:0,y:0,heading:90},message:emptyMessage};
    const result=choiceEnabled?(saved?.mode===mode&&saved?modes.run(saved):null)||blank:
      filled(saved?.source)?Chapter2Turtle.run(saved.source):blank;
    Chapter2Turtle.draw($('output-'+id),result,{labelSide:id==='q3b'?'left':'auto'});
    const stale=choiceEnabled?Boolean(saved&&JSON.stringify(saved)!==JSON.stringify(selected)):
      typeof saved?.source==='string'&&saved.source!==state.answers[id];
    const status=$('result-'+id);
    status.dataset.status=stale?'stale':result.status;
    const answerName=mode==='blocks'?'blokken':'code';
    status.textContent=stale?`Je ${mode==='blocks'?'blokken zijn':'code is'} gewijzigd. Je ziet de laatste uitvoering; klik opnieuw op uitvoeren.`:result.status==='ok'?`Uitgevoerd · ${result.segments.length} getekende lijnstukken · ${result.actions.length} acties. Vergelijk jouw tekening met het doel.`:result.status==='empty'?result.message:`Controleer je ${answerName}: ${result.message}${result.segments.length?' Je ziet de tekening tot aan de fout.':''}`;
    if(scroll)$('preview-'+id).scrollIntoView({block:'nearest',behavior:'instant'});
  }
  function mountBlocks(id){
    const host=$('blocks-'+id);
    if(!host)return;
    try{
      const editor=Chapter2Blocks.mount(host,{workspace:state.answers[id].blocks,readOnly:expired,onChange:workspace=>{
        if(exporting||!storeBlocks(id,workspace))return;
        if(state.previews?.[id])paintPreview(id);
        changed();
      }});
      blockEditors.set(id,editor);
    }catch(error){
      host.textContent='De blokkeneditor kon deze poging niet openen. Je opgeslagen antwoord blijft beschikbaar in je PDF.';
      console.error(error);
    }
  }
  function simple(group){
    if(group.id==='q1')return `<section class="card">${textarea('q1',state.answers.q1,'Jouw for-lus','code-input',6)}</section>`;
    if(group.id==='q4'||group.id==='q6'||group.id==='q7'){
      const terms=group.terms||group.rows;
      return `<section class="card">${terms.map((term,i)=>textarea(group.id+'-'+i,state.answers[group.id][i],term,group.id==='q6'?'code-input':'',group.id==='q7'?5:2)).join('')}</section>`;
    }
    if(group.id==='q8')return `<section class="card ct-scroll"><table class="answer-table ct-table"><thead><tr><th scope="col">Volgorde</th><th scope="col">Naam</th><th scope="col">Korte uitleg</th></tr></thead><tbody>${group.rows.map((row,i)=>`<tr><td><label class="sr-only" for="q8-${i}-order">Volgorde rij ${i+1}</label><select class="ct-order" id="q8-${i}-order" data-answer="q8-${i}-order"><option value="">Kies…</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${state.answers.q8[i].order===String(n)?'selected':''}>${n}</option>`).join('')}</select></td><td ${row.name?'class="given-cell"':''}>${row.name?esc(row.name):textarea(`q8-${i}-name`,state.answers.q8[i].name,`Ontbrekende naam rij ${i+1}`,'',2)}</td><td ${row.description?'class="given-cell"':''}>${row.description?esc(row.description):textarea(`q8-${i}-description`,state.answers.q8[i].description,`Korte uitleg rij ${i+1}`,'',4)}</td></tr>`).join('')}</tbody></table></section><section class="card"><h2>Terugblik <small>(geen punten)</small></h2>${textarea('reflection',state.answers.reflection,'Wat vond je van de toets? Welke leerstrategie gebruikte je?', '',3)}<label for="estimate">Hoeveel denk je te halen op ${points(config.totalPoints)}?</label><input id="estimate" data-answer="estimate" class="estimate-input" inputmode="decimal" maxlength="10" value="${esc(state.answers.estimate)}"></section>`;
    return '';
  }
  function lock(){if(!expired)return;$('question-panel').querySelectorAll('input,select,textarea,[data-run],[data-reset-output],[data-clear-choice]').forEach(input=>input.disabled=true);}
  function render(id,focus=true){
    persist();disposeBlocks();current=id;if(id==='review'){renderReview(focus);return;}
    const group=config.groups.find(g=>g.id===id);if(!group)return;
    $('question-panel').innerHTML=(expired?'<p class="expired-banner">De toetstijd is voorbij. Je antwoorden zijn bewaard. Steek je hand op en wacht op de docent.</p>':'')+heading(group)+(group.id==='q2'?traceChoices(group):group.id==='q3'?codeTasks(group):simple(group))+footer(group);
    if(group.id==='q2')group.traces.forEach(trace=>trace.options.forEach(option=>Chapter2Turtle.draw($('figure-'+trace.id+'-'+option.id),option.figure,{cursor:false})));
    if(group.id==='q3')group.tasks.forEach(task=>{if(choiceEnabled)mountBlocks(task.id);Chapter2Turtle.draw($('target-'+task.id),task.figure,{cursor:false,labelSide:task.id==='q3b'?'left':'auto'});paintPreview(task.id);});
    updateNav();lock();if(focus){$('question-panel').focus({preventScroll:true});$('question-panel').scrollIntoView({block:'start',behavior:'instant'});}
  }
  function modeSummary(){
    if(!choiceEnabled)return '';
    const tasks=config.groups.find(group=>group.id==='q3').tasks;
    return `<section class="card turtle-choice-summary"><h2>Antwoordkeuzes · Vraag 3</h2><ul>${tasks.map(task=>{
      const mode=state.answers[task.id].mode;
      return `<li>${esc(task.label)} · ${mode?`Gekozen: ${modes.labels[mode]}`:'Geen keuze'}<br><small>Blokken max. ${points(modes.maximum(task,'blocks'))} · JavaScript max. ${points(modes.maximum(task,'code'))}</small></li>`;
    }).join('')}</ul><p><strong>Maximum met je keuzes: ${points(modes.ceiling(config,state.answers))} / ${points(config.totalPoints)}</strong></p></section>`;
  }
  function renderReview(focus=true){
    const missing=config.groups.filter(g=>!answered(g));
    $('question-panel').innerHTML=`<div class="question-heading"><div><span class="eyebrow">${blocksPilot?'OVERZICHT & OEFEN-PDF':'OVERZICHT & INDIENEN'}</span><h1>Controleer je antwoorden</h1></div><span class="points">${points(config.totalPoints)} punten</span></div>${expired?'<p class="expired-banner">Je tijd is voorbij. Je antwoorden zijn bewaard en kunnen niet meer aangepast worden.</p>':''}<p>Een vinkje betekent dat je iets hebt ingevuld. Je leerkracht beoordeelt de werking, leesbaarheid en geleerde concepten.</p>${practice?.reviewButton || ''}${modeSummary()}${missing.length?`<p class="error">Nog niet volledig ingevuld: vraag ${missing.map(g=>config.groups.indexOf(g)+1).join(', ')}. Ook onvolledige antwoorden worden geëxporteerd.</p>`:''}<div class="review-list">${config.groups.map((g,i)=>`<div class="review-row"><div><strong>${i+1}. ${esc(g.title)}</strong><p>${answered(g)?'Ingevuld':'Nog nakijken'} · ${points(g.points)} punten</p></div><button type="button" data-go="${g.id}">Nakijken</button></div>`).join('')}</div><section class="card"><h2>Download je volledige toets</h2><p>De PDF bevat alle vragen, figuurkeuzes, lijnstukaantallen, ${choiceEnabled?'geselecteerde blokken of code':'code'} en uitvoer. ${blocksPilot?'Bewaar de PDF als oefenbewijs.':'Downloaden is nog geen indiening.'}</p><button type="button" class="primary" id="export-pdf">${state.lastExport?'PDF opnieuw downloaden':'Download mijn volledige toets'}</button><p id="export-error" class="error" role="alert"></p><div id="completion" ${state.lastExport?'':'hidden'}>${completion()}</div></section>`;
    updateNav();lockExportButtons();if(focus){$('question-panel').focus({preventScroll:true});$('question-panel').scrollIntoView({block:'start',behavior:'instant'});}
  }
  function completion(){
    if(!state.lastExport)return '';
    const link=downloadUrl?`<p><a id="saved-pdf" href="${esc(downloadUrl)}" download="${esc(state.lastExport.filename)}">Bewaar deze PDF opnieuw</a></p>`:'';
    const handIn=blocksPilot?'<p>Controleer het bestand in je downloadmap en bewaar het als oefenbewijs.</p>':
      `<p>Controleer het bestand in je downloadmap en dien het in via Smartschool.</p><a class="smartschool-link" href="${esc(config.smartschoolUrl)}" target="_blank" rel="noopener">Open Smartschool ↗</a><p class="review-info">Deze toets kan niet controleren of je PDF daar ontvangen is.</p>`;
    return `<p><strong>Download gestart:</strong> ${esc(state.lastExport.filename)}</p>${link}${handIn}`;
  }
  function lockExportButtons(){if(exporting)document.querySelectorAll('button:not(:disabled)').forEach(button=>{button.disabled=true;button.dataset.exportLocked='true';});}
  async function download(){
    if(exporting)return;exporting=true;const button=$('export-pdf');lockExportButtons();button.textContent='Je PDF wordt gemaakt…';$('export-error').textContent='';persist();
    try{const snapshot=JSON.parse(JSON.stringify(state));const result=await Chapter2PDF.create(config,snapshot);if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(result.blob);const link=document.createElement('a');link.href=downloadUrl;link.download=result.filename;document.body.appendChild(link);link.click();link.remove();state.lastExport={filename:result.filename,generatedAt:new Date().toISOString()};persist();$('completion').innerHTML=completion();$('completion').hidden=false;}
    catch(error){$('export-error').textContent='PDF maken is mislukt. Je antwoorden blijven bewaard. Probeer opnieuw of vraag je leerkracht om hulp. '+error.message;}
    finally{exporting=false;document.querySelectorAll('[data-export-locked]').forEach(control=>{control.disabled=false;delete control.dataset.exportLocked;});const currentButton=$('export-pdf');if(currentButton){currentButton.disabled=false;currentButton.textContent=state.lastExport?'PDF opnieuw downloaden':'Download mijn volledige toets';}}
  }
  function updateTimer(){
    if(!state)return;const remaining=Math.max(0,state.expiresAt-Date.now()),seconds=Math.ceil(remaining/1000);$('timer-value').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    const warning=seconds===0?'expired':seconds<=60?'one':seconds<=300?'five':'';
    if(warning&&warning!==lastWarning){lastWarning=warning;$('timer-alert').hidden=false;$('timer-alert').textContent=warning==='expired'?'De toetstijd is voorbij. Steek je hand op en wacht op de docent.':warning==='one'?'Je hebt nog maximaal één minuut. Rond je antwoorden af.':'Je hebt nog maximaal vijf minuten. Controleer of je alle vragen hebt bekeken.';}
    if(!remaining&&!expired){persist();expired=true;practice?.close();render('review');}
  }
  function formatClass(){let value=$('student-class').value.trim().toUpperCase();if(/^[1-6]$/.test(value))value='1STEAM'+value;$('student-class').value=value;}
  $('student-class').addEventListener('blur',formatClass);
  $('start-form').addEventListener('submit',event=>{
    event.preventDefault();formatClass();if(!$('start-form').checkValidity()){$('start-form').reportValidity();return;}
    if($('start-password').value!==config.startPassword){$('gate-error').textContent='Het startwachtwoord is niet correct.';return;}
    const identity={name:$('student-name').value.trim(),className:$('student-class').value,number:$('student-number').value.trim()};if(!identity.name){$('gate-error').textContent='Vul je naam in.';return;}
    if(!$('new-attempt').checked){try{const active=localStorage.getItem(prefix+'active'),saved=active&&JSON.parse(localStorage.getItem(prefix+active));if(!valid(saved,identity))throw new Error();state=saved;}catch(error){$('gate-error').textContent='Geen passende opgeslagen poging gevonden voor deze naam, klas, versie en toetsrevisie. Kies een nieuwe poging of vraag je leerkracht om hulp.';return;}}
    else state=fresh(identity);
    $('gate').hidden=true;$('exam').hidden=false;$('exam-timer').hidden=false;$('review-top').hidden=false;$('identity-label').textContent=identity.name+' · '+identity.className;persist();render('q1',false);updateTimer();clearInterval(timer);timer=setInterval(updateTimer,1000);$('question-panel').focus();
  });
  document.addEventListener('input',event=>{
    const id=event.target.dataset.answer;if(!id||!state||expired||exporting)return;
    const value=event.target.value;
    if(/^q[467]-\d$/.test(id)){const [key,index]=id.split('-');state.answers[key][Number(index)]=value;}
    else if(/^q8-\d-(order|name|description)$/.test(id)){const [,index,key]=id.split('-');state.answers.q8[Number(index)][key]=value;}
    else if(/^q2[abc]-count$/.test(id))state.answers[id.split('-')[0]].count=value;
    else if(choiceEnabled&&modes.ids.includes(id))state.answers[id].code=value;
    else state.answers[id]=value;
    if(/^q3[ab]$/.test(id)&&state.previews?.[id])paintPreview(id);
    changed();
  });
  document.addEventListener('change',event=>{
    if(!state||expired||exporting)return;
    const {answerMode,choice}=event.target.dataset;
    if(answerMode&&choiceEnabled){
      captureBlocks();
      const mode=event.target.value;
      state.answers[answerMode].mode=mode;
      if(state.previews)delete state.previews[answerMode];
      changed();
      render('q3',false);
      document.querySelector(`[name="mode-${answerMode}"][value="${mode}"]`).focus({preventScroll:true});
    }else if(choice){
      state.answers[choice].choice=event.target.value;
      changed();
    }
  });
  function openPractice(options={}){
    return practice?.open({...options,include:item=>!item.answerMode||item.answerMode===(state.answers[item.taskId].mode||'code')});
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||!state)return;
    if(button.dataset.next){
      const destination=button.dataset.next;
      const proceed=()=>render(destination);
      if(!openPractice({groupId:current,trigger:button,proceed})) proceed();
      return;
    }
    if(button.dataset.go){render(button.dataset.go);return;}
    if(['review-top','review-side'].includes(button.id)){render('review');return;}
    if(button.id==='practice-examples'&&!exporting){openPractice();return;}
    if(button.id==='export-pdf'){download();return;}
    if(expired||exporting)return;
    if(button.dataset.run){const id=button.dataset.run;state.previews??={};captureBlocks();state.previews[id]=choiceEnabled?modes.selected(id,state.answers[id]):{source:state.answers[id]};paintPreview(id,true);persist();}
    else if(button.dataset.resetOutput){const id=button.dataset.resetOutput;if(state.previews)delete state.previews[id];paintPreview(id);$('result-'+id).textContent='Uitvoer gewist. Je antwoord blijft bewaard.';persist();}
    else if(button.dataset.clearChoice){const id=button.dataset.clearChoice;state.answers[id].choice='';document.querySelectorAll(`[name="${id}"]`).forEach(input=>input.checked=false);changed();}

  });
  window.addEventListener('beforeunload',persist);document.addEventListener('visibilitychange',()=>{if(state){persist();updateTimer();}});
  $('version-label').textContent='Versie '+config.version+(blocksPilot?' · Oefenversie':'');
  if(blocksPilot)$('review-top').textContent='Overzicht & oefen-PDF';
  window.Chapter2App={config,getState:()=>state,render,flush:persist,updateTimer,exportPDF:()=>{captureBlocks();return Chapter2PDF.create(config,JSON.parse(JSON.stringify(state)));}};
})();
