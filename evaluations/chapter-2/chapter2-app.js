/* Chapter 2 student assessment. © 2026 Robbe Wulgaert · AI in de Klas. */
(function () {
  'use strict';
  const config=window.ASSESSMENT_CONFIG,$=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const points=n=>Number(n).toLocaleString('nl-BE');
  const prefix=`blockly-assessment:${config.id}:${config.version}:`;
  let state=null,current='q1',saveTimer,timer,expired=false,lastWarning='',exporting=false,downloadUrl=null;
  function blankAnswers(){return {q1:'',q2a:{choice:'',count:''},q2b:{choice:'',count:''},q2c:{choice:'',count:''},q3a:'',q3b:'',q4:Array(6).fill(''),q6:Array(3).fill(''),q7:Array(2).fill(''),q8:Array.from({length:5},()=>({order:'',name:'',description:''})),reflection:'',estimate:''};}
  function fresh(identity){const now=Date.now();return {schemaVersion:1,examId:config.id,version:config.version,revision:config.revision,sourceSha256:config.sourceSha256,configSha256:config.configSha256,attemptId:crypto.randomUUID(),identity,startedAt:new Date(now).toISOString(),expiresAt:now+config.durationMinutes*60000,answers:blankAnswers(),lastExport:null};}
  function valid(saved,identity){
    return saved&&saved.schemaVersion===1&&saved.examId===config.id&&saved.version===config.version&&saved.revision===config.revision&&saved.sourceSha256===config.sourceSha256&&saved.configSha256===config.configSha256&&saved.attemptId&&Number.isFinite(saved.expiresAt)&&JSON.stringify(saved.identity)===JSON.stringify(identity)&&saved.answers&&Object.keys(blankAnswers()).every(key=>Object.hasOwn(saved.answers,key))&&['q2a','q2b','q2c'].every(key=>['','A','B','C','D'].includes(saved.answers[key]?.choice)&&typeof saved.answers[key]?.count==='string')&&saved.answers.q4?.length===6&&saved.answers.q6?.length===3&&saved.answers.q7?.length===2&&saved.answers.q8?.length===5;
  }
  function persist(){
    if(!state)return;
    clearTimeout(saveTimer);
    try{localStorage.setItem(prefix+state.attemptId,JSON.stringify(state));localStorage.setItem(prefix+'active',state.attemptId);$('save-status').textContent='Opgeslagen op dit toestel';$('save-status').classList.remove('failed');}
    catch(error){$('save-status').textContent='Opslaan mislukt · download je PDF';$('save-status').classList.add('failed');}
  }
  function changed(){if(!state)return;state.lastExport=null;if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=null;}$('save-status').textContent='Bezig met opslaan…';clearTimeout(saveTimer);saveTimer=setTimeout(persist,200);updateNav();}
  function filled(value){return typeof value==='string'&&value.trim().length>0;}
  function answered(group){const a=state.answers;switch(group.id){case 'q1':return filled(a.q1);case 'q2':return ['q2a','q2b','q2c'].every(id=>filled(a[id].choice)&&filled(a[id].count));case 'q3':return filled(a.q3a)&&filled(a.q3b);case 'q4':case 'q6':case 'q7':return a[group.id].every(filled);case 'q8':return a.q8.every((row,i)=>filled(row.order)&&(group.rows[i].name||filled(row.name))&&(group.rows[i].description||filled(row.description)));default:return false;}}
  function updateNav(){if(!state)return;$('question-nav').innerHTML=config.groups.map((g,i)=>`<button type="button" class="nav-button" data-go="${g.id}" ${current===g.id?'aria-current="step"':''}><span class="nav-number">${i+1}</span><span>${esc(g.title)}</span>${answered(g)?'<span class="done" aria-label="Ingevuld">✓</span>':''}</button>`).join('');$('progress-label').textContent=`${config.groups.filter(answered).length} / ${config.groups.length} onderdelen ingevuld`;}
  function heading(group){return `<div class="question-heading"><div><span class="eyebrow">VRAAG ${config.groups.indexOf(group)+1} VAN ${config.groups.length}</span><h1>${esc(group.title)}</h1></div><span class="points">${points(group.points)} punten</span></div><p class="instructions">${esc(Chapter2Turtle.instructions(group))}</p>`;}
  function footer(group){const i=config.groups.indexOf(group);return `<div class="question-footer">${i?`<button type="button" data-go="${config.groups[i-1].id}">← Vorige vraag</button>`:'<span></span>'}<button type="button" class="primary" ${i===config.groups.length-1?'data-review':`data-go="${config.groups[i+1].id}"`}>${i===config.groups.length-1?'Overzicht & PDF':'Volgende vraag'} →</button></div>`;}
  const textarea=(id,value,label,classes='',rows=4)=>`<label for="${id}">${esc(label)}</label><textarea id="${id}" data-answer="${id}" class="${classes}" rows="${rows}" spellcheck="false" maxlength="40000">${esc(value)}</textarea>`;
  function algorithm(items){return items.map(item=>typeof item==='string'?`<div class="action-block">${esc(item)}</div>`:`<div class="repeat-block">herhaal ${item.repeat} keer<div class="repeat-body">${algorithm(item.body)}</div></div>`).join('');}
  function traceChoices(group){return group.traces.map(trace=>`<section class="card trace-card"><h2>${trace.label} · Lees het algoritme <small>(1 punt)</small></h2><div class="trace-layout"><div class="algorithm" aria-label="Gegeven algoritme voor ${trace.label}">${algorithm(trace.instructions)}</div><div><fieldset class="trace-options"><legend>Kies de passende figuur · 0,5 punt</legend><div class="figure-options">${trace.options.map(option=>`<label class="figure-option"><input type="radio" name="${trace.id}" data-choice="${trace.id}" value="${option.id}" aria-label="${trace.label}: optie ${option.id}" ${state.answers[trace.id].choice===option.id?'checked':''}><span>Optie ${option.id}</span><canvas id="figure-${trace.id}-${option.id}" width="400" height="280" role="img" aria-label="${esc(option.alt)}"></canvas></label>`).join('')}</div></fieldset><button type="button" data-clear-choice="${trace.id}">Wis mijn keuze</button><label class="trace-count">${esc(trace.countPrompt)} · 0,5 punt<input id="${trace.id}-count" data-answer="${trace.id}-count" inputmode="numeric" maxlength="30" value="${esc(state.answers[trace.id].count)}" aria-label="Aantal lijnstukken ${trace.label}"></label></div></div></section>`).join('');}
  function codeTasks(group){return `<p class="callout">Per figuur: 0,5 punt werking · 0,5 punt leesbaarheid · 1,5 punt voor de for-lus en de juiste parameters. Voer je code uit om jouw tekening te bekijken.</p>`+group.tasks.map(task=>`<section class="card turtle-task"><h2>${esc(task.label)} <small>(${points(task.points)} punten)</small></h2><p class="reference-summary">${esc(task.prompt)}</p><div class="code-workbench"><div class="editor-pane">${textarea(task.id,state.answers[task.id],'Jouw JavaScript voor '+task.label,'task-code',10)}<div class="button-row"><button type="button" class="primary" data-run="${task.id}" aria-controls="output-${task.id}" aria-label="Voer code van ${task.id==='q3a'?'3a':'3b'} uit">▶ Voer mijn code uit</button><button type="button" data-reset-output="${task.id}">Wis uitvoer</button></div><p id="result-${task.id}" class="runtime-result" role="status" aria-live="polite">Nog niet uitgevoerd. Schrijf code en klik op uitvoeren.</p></div><div class="preview-pane"><div class="target-pane"><h3>Doelfiguur</h3><canvas id="target-${task.id}" class="turtle-target" width="500" height="280" role="img" aria-label="${esc(task.alt)}"></canvas></div><div class="output-pane" id="preview-${task.id}"><h3>Jouw tekening</h3><canvas id="output-${task.id}" class="turtle-output" width="500" height="320" tabindex="-1" role="img" aria-label="Uitvoer van jouw Turtle-programma voor ${esc(task.label)}"></canvas><p class="field-note">Start is (0, 0), richting omhoog, pen omlaag. Vergelijk zelf met het doel; dit is geen score.</p></div></div></div></section>`).join('')+`<details class="card code-reference"><summary>Schrijfafspraken voor de Turtle-instructies</summary><p>Gebruik de functies uit de les. Vul afstanden, hoeken en kleuren zelf in.</p><ul><li><code>moveForward(afstand); moveBackward(afstand);</code></li><li><code>turnLeft(hoek); turnRight(hoek);</code></li><li><code>penUp(); penDown();</code></li><li><code>penColour("kleurcode");</code> of <code>setPenColour(rood, groen, blauw);</code></li></ul><p>Gebruik for-lussen met start, eindgrens en interval. De preview toont je uitvoering; je leerkracht beoordeelt je volledige antwoord.</p></details>`;}
  function paintPreview(id,scroll=false){
    const saved=state.previews?.[id],source=saved?.source;
    const blank={status:'empty',segments:[],turtle:{x:0,y:0,heading:90},message:'Schrijf eerst Turtle-code en klik op uitvoeren.'};
    const result=typeof source==='string'&&source.trim()?Chapter2Turtle.run(source):blank;
    Chapter2Turtle.draw($('output-'+id),result);
    const stale=typeof source==='string'&&source!==state.answers[id],status=$('result-'+id);
    status.dataset.status=stale?'stale':result.status;
    status.textContent=stale?'Je code is gewijzigd. Je ziet de laatste uitvoering; klik opnieuw op uitvoeren.':result.status==='ok'?`Uitgevoerd · ${result.segments.length} getekende lijnstukken · ${result.actions.length} acties. Vergelijk jouw tekening met het doel.`:result.status==='empty'?result.message:`Controleer je code: ${result.message}${result.segments.length?' Je ziet de tekening tot aan de fout.':''}`;
    if(scroll)$('preview-'+id).scrollIntoView({block:'nearest',behavior:'instant'});
  }
  function simple(group){
    if(group.id==='q1')return `<section class="card">${textarea('q1',state.answers.q1,'Jouw for-lus','code-input',6)}</section>`;
    if(group.id==='q4'||group.id==='q6'||group.id==='q7'){
      const terms=group.terms||group.rows;
      return `<section class="card">${terms.map((term,i)=>textarea(group.id+'-'+i,state.answers[group.id][i],term,group.id==='q6'?'code-input':'',group.id==='q7'?5:2)).join('')}</section>`;
    }
    if(group.id==='q8')return `<section class="card ct-scroll"><table class="answer-table ct-table"><thead><tr><th scope="col">Volgorde</th><th scope="col">Naam</th><th scope="col">Korte uitleg</th></tr></thead><tbody>${group.rows.map((row,i)=>`<tr><td><label class="sr-only" for="q8-${i}-order">Volgorde rij ${i+1}</label><select id="q8-${i}-order" data-answer="q8-${i}-order"><option value="">Kies…</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${state.answers.q8[i].order===String(n)?'selected':''}>${n}</option>`).join('')}</select></td><td ${row.name?'class="given-cell"':''}>${row.name?esc(row.name):textarea(`q8-${i}-name`,state.answers.q8[i].name,`Ontbrekende naam rij ${i+1}`,'',2)}</td><td ${row.description?'class="given-cell"':''}>${row.description?esc(row.description):textarea(`q8-${i}-description`,state.answers.q8[i].description,`Korte uitleg rij ${i+1}`,'',4)}</td></tr>`).join('')}</tbody></table></section><section class="card"><h2>Terugblik <small>(geen punten)</small></h2>${textarea('reflection',state.answers.reflection,'Wat vond je van de toets? Welke leerstrategie gebruikte je?', '',3)}<label for="estimate">Hoeveel denk je te halen op ${points(config.totalPoints)}?</label><input id="estimate" data-answer="estimate" class="estimate-input" inputmode="decimal" maxlength="10" value="${esc(state.answers.estimate)}"></section>`;
    return '';
  }
  function lock(){if(!expired)return;$('question-panel').querySelectorAll('input,select,textarea,[data-run],[data-reset-output],[data-clear-choice]').forEach(input=>input.disabled=true);}
  function render(id,focus=true){
    persist();current=id;if(id==='review'){renderReview(focus);return;}
    const group=config.groups.find(g=>g.id===id);if(!group)return;
    $('question-panel').innerHTML=(expired?'<p class="expired-banner">Je 45 minuten zijn voorbij. Je antwoorden zijn bewaard. Je kunt ze nakijken en je PDF downloaden.</p>':'')+heading(group)+(group.id==='q2'?traceChoices(group):group.id==='q3'?codeTasks(group):simple(group))+footer(group);
    if(group.id==='q2')group.traces.forEach(trace=>trace.options.forEach(option=>Chapter2Turtle.draw($('figure-'+trace.id+'-'+option.id),option.figure,{cursor:false})));
    if(group.id==='q3')group.tasks.forEach(task=>{Chapter2Turtle.draw($('target-'+task.id),task.figure,{cursor:false});paintPreview(task.id);});
    updateNav();lock();if(focus){$('question-panel').focus({preventScroll:true});$('question-panel').scrollIntoView({block:'start',behavior:'instant'});}
  }
  function renderReview(focus=true){
    const missing=config.groups.filter(g=>!answered(g));
    $('question-panel').innerHTML=`<div class="question-heading"><div><span class="eyebrow">OVERZICHT & INDIENEN</span><h1>Controleer je antwoorden</h1></div><span class="points">${points(config.totalPoints)} punten</span></div>${expired?'<p class="expired-banner">Je tijd is voorbij. Je antwoorden zijn bewaard en kunnen niet meer aangepast worden.</p>':''}<p>Een vinkje betekent dat je iets hebt ingevuld. Je leerkracht beoordeelt de werking, leesbaarheid en geleerde concepten.</p>${missing.length?`<p class="error">Nog niet volledig ingevuld: vraag ${missing.map(g=>config.groups.indexOf(g)+1).join(', ')}. Ook onvolledige antwoorden worden geëxporteerd.</p>`:''}<div class="review-list">${config.groups.map((g,i)=>`<div class="review-row"><div><strong>${i+1}. ${esc(g.title)}</strong><p>${answered(g)?'Ingevuld':'Nog nakijken'} · ${points(g.points)} punten</p></div><button type="button" data-go="${g.id}">Nakijken</button></div>`).join('')}</div><section class="card"><h2>Download je volledige toets</h2><p>De PDF bevat alle vragen, figuurkeuzes, lijnstukaantallen, code en uitvoer. Downloaden is nog geen indiening.</p><button type="button" class="primary" id="export-pdf">${state.lastExport?'PDF opnieuw downloaden':'Download mijn volledige toets'}</button><p id="export-error" class="error" role="alert"></p><div id="completion" ${state.lastExport?'':'hidden'}>${completion()}</div></section>`;
    updateNav();lockExportButtons();if(focus){$('question-panel').focus({preventScroll:true});$('question-panel').scrollIntoView({block:'start',behavior:'instant'});}
  }
  function completion(){return state.lastExport?`<p><strong>Download gestart:</strong> ${esc(state.lastExport.filename)}</p><p>Controleer het bestand in je downloadmap en dien het in via Smartschool.</p>${downloadUrl?`<p><a id="saved-pdf" href="${esc(downloadUrl)}" download="${esc(state.lastExport.filename)}">Bewaar deze PDF opnieuw</a></p>`:''}<a class="smartschool-link" href="${esc(config.smartschoolUrl)}" target="_blank" rel="noopener">Open Smartschool ↗</a><p class="review-info">Deze toets kan niet controleren of je PDF daar ontvangen is.</p>`:'';}
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
    if(warning&&warning!==lastWarning){lastWarning=warning;$('timer-alert').hidden=false;$('timer-alert').textContent=warning==='expired'?'De 45 minuten zijn voorbij. Download je volledige toets en dien die in.':warning==='one'?'Je hebt nog maximaal één minuut. Controleer je antwoorden en download je toets.':'Je hebt nog maximaal vijf minuten. Controleer of je alle vragen hebt bekeken.';}
    if(!remaining&&!expired){expired=true;persist();current='review';renderReview();}
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
    else state.answers[id]=value;
    if(/^q3[ab]$/.test(id)&&state.previews?.[id])paintPreview(id);
    changed();
  });
  document.addEventListener('change',event=>{const id=event.target.dataset.choice;if(!id||!state||expired||exporting)return;state.answers[id].choice=event.target.value;changed();});
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||!state)return;
    if(button.dataset.go){render(button.dataset.go);return;}
    if(button.hasAttribute('data-review')||['review-top','review-side'].includes(button.id)){render('review');return;}
    if(button.id==='export-pdf'){download();return;}
    if(expired||exporting)return;
    if(button.dataset.run){const id=button.dataset.run;state.previews??={};state.previews[id]={source:state.answers[id]};paintPreview(id,true);persist();}
    else if(button.dataset.resetOutput){const id=button.dataset.resetOutput;if(state.previews)delete state.previews[id];paintPreview(id);$('result-'+id).textContent='Uitvoer gewist. Je code blijft bewaard.';persist();}
    else if(button.dataset.clearChoice){const id=button.dataset.clearChoice;state.answers[id].choice='';document.querySelectorAll(`[name="${id}"]`).forEach(input=>input.checked=false);changed();}

  });
  window.addEventListener('beforeunload',persist);document.addEventListener('visibilitychange',()=>{if(state){persist();updateTimer();}});
  $('version-label').textContent='Versie '+config.version;
  window.Chapter2App={config,getState:()=>state,render,flush:persist,updateTimer,exportPDF:()=>Chapter2PDF.create(config,JSON.parse(JSON.stringify(state)))};
})();
