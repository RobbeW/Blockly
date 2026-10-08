/* © 2026 Robbe Wulgaert · AI in de Klas · robbewulgaert.be */
(function () {
  'use strict';
  const config = window.ASSESSMENT_CONFIG;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const points = n => Number(n).toLocaleString('nl-BE', {maximumFractionDigits:2});
  const pointText = n => `${points(n)} ${Number(n)===1?'punt':'punten'}`;
  const taalzorg = '<p class="taalzorg"><strong>Taalzorg</strong> · Gebruik hoofdletters en leestekens. Schrijf je uitleg in duidelijke, volledige zinnen.</p>';
  const durationMs = (config.durationMinutes||45)*60*1000;
  const prefix = `blockly-assessment:${config.id}:${config.version}:`;
  let state = null, runtime = null, activeExercise = null, rendering = false, saveTimer = null;
  let currentGroup = 'q1', mazeIndex = 0, markIndex = 0, exporting = false;
  let preparedPDF=null;
  let timerInterval=null, timerPhase='';
  const emptyExercise = () => ({choice:null, drafts:{blocks:{workspace:null,markings:{},explanation:''}, code:{code:'',markings:[],explanation:''}}, results:{blocks:null,code:null}, needsReview:false});
  function fresh(identity) {
    return {schemaVersion:config.schemaVersion, examId:config.id, version:config.version,
      attemptId:crypto.randomUUID(), identity, startedAt:new Date().toISOString(), updatedAt:null,
      answers:Object.fromEntries(config.groups.filter(g=>g.rows).map(g=>[g.id,g.rows.map(()=> '')])),
      boundaries:Object.fromEntries(config.groups.filter(g=>g.type==='loop-boundary').map(g=>[g.id,{workspace:null,markings:{},result:null}])),
      exercises:Object.fromEntries(config.exercises.map(e=>[e.id,emptyExercise()]))};
  }
  function validState(value) {
    return value && value.schemaVersion === config.schemaVersion && value.examId === config.id && value.version === config.version && value.identity && value.answers && value.exercises && config.exercises.every(e=>value.exercises[e.id]?.drafts?.blocks && value.exercises[e.id]?.drafts?.code);
  }
  function readSaved(identity) {
    try {
      const active = localStorage.getItem(prefix+'active');
      if (!active) return null;
      const saved = JSON.parse(localStorage.getItem(prefix+active));
      if (!validState(saved)) { $('gate-error').textContent = 'De opgeslagen poging heeft een onbekend formaat. Start een nieuwe poging of vraag je leerkracht om hulp.'; return null; }
      if (JSON.stringify(saved.identity) !== JSON.stringify(identity)) return null;
      if(!saved.boundaries){saved.boundaries={};saved.lastExport=null;}
      for(const group of config.groups.filter(g=>g.type==='loop-boundary'))saved.boundaries[group.id]??={workspace:null,markings:{},result:null};
      if(config.groups.some(g=>g.rows&&saved.answers[g.id]?.length!==g.rows.length)||config.exercises.some(e=>e.explanationPrompt&&['blocks','code'].some(branch=>saved.exercises[e.id].drafts[branch].explanation===undefined)))saved.lastExport=null;
      for(const group of config.groups.filter(g=>g.rows))saved.answers[group.id]=group.rows.map((_,i)=>saved.answers[group.id]?.[i]??'');
      for(const exercise of config.exercises)for(const branch of ['blocks','code'])saved.exercises[exercise.id].drafts[branch].explanation??='';
      return saved;
    } catch (_) { return null; }
  }
  function storageStatus(message, failed=false) {
    $('save-status').textContent = message; $('save-status').classList.toggle('failed',failed);
  }
  function updateTimer() {
    if(!state)return;
    const seconds=Math.max(0,Math.ceil((state.deadlineAt-Date.now())/1000));
    const timer=$('exam-timer'),urgency=1-Math.min(1,seconds/(durationMs/1000));
    $('timer-value').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    timer.style.setProperty('--timer-colour',`${Math.round(82+108*urgency)}, ${Math.round(20*urgency)}, ${Math.round(255-225*urgency)}`);
    timer.style.setProperty('--pulse-scale',String(1.015+urgency*0.045));
    timer.style.setProperty('--pulse-duration',`${3-urgency*2.1}s`);
    timer.classList.toggle('pulsing',seconds>0&&seconds<=15*60);
    timer.classList.toggle('expired',seconds===0);
    const phase=seconds===0?'expired':seconds<=300?'warning':'normal';
    if(phase!==timerPhase){
      timerPhase=phase;$('timer-warning').hidden=phase==='normal';
      $('timer-warning-message').textContent=phase==='expired'?'De toetstijd is voorbij. Download nu je volledige toets als PDF en upload die in Smartschool. Controleer daar je indiening.':phase==='warning'?'Nog maximaal 5 minuten! Rond je antwoorden af en begin nu met indienen: download je volledige toets als PDF, upload die in Smartschool en controleer je indiening.':'';
      $('timer-warning').classList.toggle('expired',phase==='expired');
    }
    if(seconds<=300&&!state.timerWarningShown){state.timerWarningShown=true;persist();}
    if(!seconds){clearInterval(timerInterval);timerInterval=null;}
  }
  function startTimer() {
    clearInterval(timerInterval);timerPhase='';
    if(!Number.isFinite(state.deadlineAt))state.deadlineAt=(Date.parse(state.startedAt)||Date.now())+durationMs;
    $('exam-timer').hidden=false;persist();updateTimer();
    if(state.deadlineAt>Date.now())timerInterval=setInterval(updateTimer,1000);
  }
  function persist() {
    clearTimeout(saveTimer);
    if (!state) return;
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(prefix+state.attemptId,JSON.stringify(state));
      localStorage.setItem(prefix+'active',state.attemptId);
      storageStatus('Opgeslagen op dit toestel');
    } catch (_) { storageStatus('Opslaan mislukt · download je PDF',true); }
  }
  function changed() {
    if (rendering) return;
    storageStatus('Bezig met opslaan…'); clearTimeout(saveTimer); saveTimer=setTimeout(persist,200); updateNav(); updateMazeIndicators();
  }
  function selectedExercise() { return activeExercise && state.exercises[activeExercise.id]; }
  function invalidate(exercise, branch) {
    exercise.results[branch] = null;
    const draft = exercise.drafts[branch];
    const hasMarks = branch === 'blocks' ? Object.keys(draft.markings||{}).length : (draft.markings||[]).length;
    if (hasMarks) { draft.markings = branch === 'blocks' ? {} : []; exercise.needsReview = true; }
    state.lastExport = null;
  }
  function captureRuntime() {
    if (!runtime || !activeExercise) return;
    if(activeExercise.boundary){const captured=runtime.capture(),answer=state.boundaries[activeExercise.id];answer.workspace=captured.workspace;answer.markings=captured.markings;return;}
    const ex = selectedExercise(), captured = runtime.capture();
    if (runtime.mode === 'blocks') {
      ex.drafts.blocks.workspace = captured.workspace; ex.drafts.blocks.markings = captured.markings;
    } else if (runtime.mode === 'code' && $('code-answer')) ex.drafts.code.code = $('code-answer').value;
  }
  function flush() { captureRuntime(); persist(); }
  function disposeRuntime() { captureRuntime(); runtime?.dispose(); runtime=null; activeExercise=null; }
  function hasBlocks(workspace) { return Boolean(workspace?.blocks?.blocks?.length); }
  function boundaryActions(workspace){const blocks=[];function visit(node){if(!node||typeof node!=='object')return;if(['assessment_maze_move_forward','assessment_maze_turn_left','assessment_maze_turn_right'].includes(node.type)&&node.id)blocks.push(node);for(const value of Object.values(node))if(value&&typeof value==='object')visit(value);}visit(workspace);return blocks;}
  function updateBoundaryMarks(){
    const answer=state.boundaries[currentGroup],actions=boundaryActions(answer.workspace);
    if(!$('boundary-marks'))return;
    const labels={assessment_maze_move_forward:'stap vooruit',assessment_maze_turn_left:'draai links',assessment_maze_turn_right:'draai rechts'};
    $('boundary-marks').innerHTML=`<p>${actions.filter(b=>answer.markings[b.id]).length} van ${actions.length} actieblokken gemarkeerd. Je leerkracht beoordeelt de indeling.</p>`+actions.map((b,i)=>`<p>${i+1}. ${labels[b.type]}: <strong>${answer.markings[b.id]?.kind==='once'?'1× · Eén keer':answer.markings[b.id]?.kind==='repeated'?'L · In de lus':'Nog niet gemarkeerd'}</strong></p>`).join('');
  }
  function renderBoundary(group){
    const answer=state.boundaries[group.id];
    $('question-panel').innerHTML=heading(group)+`<div class="callout"><strong>Alleen blokken · 1 punt</strong><p>Dit is een inzichtvraag over de lus: je kunt hier het volledige punt behalen met blokken. De markeringen worden niet automatisch nagekeken.</p></div><div class="editor-layout"><section class="card editor-card"><div class="editor-tools"><button type="button" class="primary" data-run>▶ Uitvoeren</button><button type="button" data-stop>Stop</button><button type="button" data-reset>Maze herstellen</button></div><div id="blockly-host" class="blockly-host"></div><div class="mark-tools"><button type="button" data-boundary-tool="once" aria-pressed="false">1× · Eén keer</button><button type="button" data-boundary-tool="repeated" aria-pressed="false">L · In de lus</button><button type="button" data-boundary-tool="erase" aria-pressed="false">Markering verwijderen</button><button type="button" data-clear-boundary>Alle markeringen wissen</button></div><p class="editor-note">Kies een markering en klik op een actieblok. Gebruik de wis-knop of een andere markering om je keuze te wijzigen. Als je je algoritme wijzigt, controleer je alle markeringen opnieuw.</p><div id="boundary-marks" aria-live="polite"></div></section><section class="card editor-card"><h3>Maze level 5</h3><canvas id="maze-canvas" class="maze-canvas" width="420" height="420" aria-label="${esc(group.assetAlt)}"></canvas><p id="runtime-status" class="runtime-status" role="status"></p></section></div>`+footer(group);
    activeExercise={id:group.id,boundary:true};
    runtime=new window.AssessmentMaze({blocklyElement:$('blockly-host'),canvas:$('maze-canvas'),statusElement:$('runtime-status'),onChange(captured){
      if(rendering)return;
      if(JSON.stringify(answer.workspace)!==JSON.stringify(captured.workspace)){answer.result=null;captured.markings={};runtime.markings={};runtime._applyMarkingClasses();}
      answer.workspace=captured.workspace;answer.markings=captured.markings;state.lastExport=null;changed();updateBoundaryMarks();
    },onResult(result){answer.result={...result,executedAt:new Date().toISOString()};state.lastExport=null;changed();}});
    runtime.mount({...group.referenceMaze,mode:'blocks',workspace:answer.workspace,markings:answer.markings});
    if(answer.result)$('runtime-status').textContent=answer.result.status==='reached'?'Laatste uitvoering: doel bereikt.':'Controleer de laatste uitvoering van jouw algoritme.';
    updateBoundaryMarks();
  }
  function exerciseStatus(exercise) {
    const ex=state.exercises[exercise.id],branch=ex.choice;
    const filled=branch==='code'?Boolean(ex.drafts.code.code.trim()):branch==='blocks'&&hasBlocks(ex.drafts.blocks.workspace);
    if(!filled)return {kind:'empty',label:'Nog leeg',complete:false};
    const result=ex.results[branch];
    if(!result)return {kind:'pending',label:'Nog niet getest',complete:false};
    if(result.status==='reached')return exercise.explanationPrompt&&!ex.drafts[branch].explanation?.trim()?{kind:'pending',label:'Doel bereikt · uitleg ontbreekt',complete:false}:{kind:'complete',label:'Doel bereikt',complete:true};
    return {kind:'pending',label:result.status==='error'?'Uitvoering nakijken':'Doel nog niet bereikt',complete:false};
  }
  function updateMazeIndicators() {
    if(!state)return;
    document.querySelectorAll('[data-maze]').forEach(button=>{
      const exercise=config.exercises[Number(button.dataset.maze)],status=exerciseStatus(exercise);
      button.dataset.status=status.kind;
      const label=button.querySelector('.maze-state');if(label)label.textContent=status.label;
    });
    if($('coding-progress')) {
      const complete=config.exercises.filter(e=>exerciseStatus(e).complete).length;
      $('coding-progress').textContent=`${complete} van de ${config.exercises.length} mazes: doel bereikt. Bekijk alle vier de oefeningen.`;
    }
  }
  function answered(group) {
    if(group.type==='loop-boundary'){const answer=state.boundaries[group.id],actions=boundaryActions(answer.workspace);return actions.length>0&&actions.every(b=>answer.markings[b.id]);}
    if (group.id === 'q4') return config.exercises.every(e=>{const ex=state.exercises[e.id];const filled=ex.choice==='code'?ex.drafts.code.code.trim():ex.choice==='blocks'&&hasBlocks(ex.drafts.blocks.workspace);return filled&&(!e.explanationPrompt||ex.drafts[ex.choice].explanation?.trim());});
    if (group.id === 'q5') return config.exercises.every(e=>{const ex=state.exercises[e.id];return !ex.needsReview && (ex.choice==='blocks' ? Object.keys(ex.drafts.blocks.markings).length : ex.choice==='code' && ex.drafts.code.markings.length);});
    return state.answers[group.id]?.every(value=>String(value).trim());
  }
  function updateNav() {
    if (!state) return;
    $('question-nav').innerHTML = config.groups.map((g,i)=>`<button type="button" class="nav-button" data-group="${g.id}" ${currentGroup===g.id?'aria-current="step"':''}><span class="nav-number">${i+1}</span><span>${esc(g.title)}</span>${answered(g)?'<span class="done" aria-label="Ingevuld">✓</span>':''}</button>`).join('');
    $('progress-label').textContent = `${config.groups.filter(answered).length} / ${config.groups.length} onderdelen ingevuld`;
  }
  function heading(group,{instructions=true}={}) {
    return `<div class="question-heading"><div><span class="eyebrow">VRAAG ${config.groups.indexOf(group)+1} VAN ${config.groups.length}</span><h1>${esc(group.title)}</h1></div><span class="points">${pointText(group.points)}</span></div>${instructions?`<p class="instructions">${esc(group.prompt)}</p>`:''}`;
  }
  function footer(group) {
    const i=config.groups.indexOf(group);
    return `<div class="question-footer">${i?`<button data-group="${config.groups[i-1].id}" type="button">← Vorige vraag</button>`:'<span></span>'}${i<config.groups.length-1?`<button class="primary" data-group="${config.groups[i+1].id}" ${group.type==='coding'?'data-coding-next':''} type="button">Volgende vraag →</button>`:'<button class="primary" data-review type="button">Overzicht & PDF →</button>'}</div>`;
  }
  function renderFields(group) {
    const answers=state.answers[group.id]; let html=heading(group);
    if (group.asset) html+=`<img class="reference-program" src="${group.asset}" alt="${esc(group.assetAlt||'Blockly-algoritme uit de toets: lees de blokken en beschrijf het gedrag.')}">`;
    if (group.codeSample) html+=`<section class="card answer-card"><h2>Gegeven programma</h2><pre class="reference-code">${esc(group.codeSample)}</pre></section>`;
    if(group.type==='short'&&group.parts) {
      html+=group.parts.map(part=>`<section class="card answer-card"><h2>${esc(part.title)}</h2>${part.layout==='sentence'?part.indices.map(i=>`<label for="answer-${group.id}-${i}">${esc(group.rows[i][1])}<input id="answer-${group.id}-${i}" data-answer="${group.id}" data-index="${i}" value="${esc(answers[i])}" autocomplete="off"></label>`).join(''):`<table class="answer-table"><thead><tr><th scope="col">${esc(part.givenLanguage)}</th><th scope="col">${esc(part.answerLanguage)}</th></tr></thead><tbody>${part.indices.map(i=>`<tr><td><label for="answer-${group.id}-${i}">${esc(group.rows[i][1])}</label></td><td><input id="answer-${group.id}-${i}" data-answer="${group.id}" data-index="${i}" value="${esc(answers[i])}" autocomplete="off"></td></tr>`).join('')}</tbody></table>`}</section>`).join('');
    } else if (group.type==='short' || group.type==='correction' || group.type==='ordering') {
      html+='<section class="card answer-card"><table class="answer-table"><thead><tr><th scope="col">'+(group.type==='ordering'?'Stap':group.type==='correction'?'Gegeven code':'Gegeven term')+'</th><th scope="col">Jouw antwoord</th></tr></thead><tbody>';
      group.rows.forEach((row,i)=> {
        const id=`answer-${group.id}-${i}`;
        html+=`<tr><td><label for="${id}">${group.type==='correction'?`<pre>${esc(row[1])}</pre>`:esc(row[1])}</label>${group.type==='short'?`<small>${esc(row[0])}</small>`:''}</td><td>`;
        if(group.type==='ordering') html+=`<select id="${id}" data-answer="${group.id}" data-index="${i}"><option value="">Kies…</option>${[1,2,3,4,5].map(n=>`<option ${String(answers[i])===String(n)?'selected':''}>${n}</option>`).join('')}</select>`;
        else if(group.type==='correction') html+=`<textarea id="${id}" data-answer="${group.id}" data-index="${i}" spellcheck="false">${esc(answers[i])}</textarea>`;
        else html+=`<input id="${id}" data-answer="${group.id}" data-index="${i}" value="${esc(answers[i])}" autocomplete="off">`;
        html+='</td></tr>';
      });
      html+='</tbody></table><p id="ordering-error" class="error" role="status"></p></section>';
    } else html+=group.rows.map((row,i)=>`<section class="card answer-card">${taalzorg}<label for="answer-${group.id}-${i}">${esc(row[1])}<textarea id="answer-${group.id}-${i}" data-answer="${group.id}" data-index="${i}">${esc(answers[i])}</textarea></label></section>`).join('');
    $('question-panel').innerHTML=html+footer(group); checkOrdering();
  }
  function checkOrdering() {
    if (!$('ordering-error')) return;
    const values=(state.answers.q7||[]).filter(Boolean);
    $('ordering-error').textContent= new Set(values).size<values.length ? 'Je hebt een nummer meerdere keren gekozen. Gebruik elk nummer eenmaal.' : '';
  }
  function mazeTabs(index,marking=false) {
    return `<div class="maze-tabs" role="group" aria-label="Alle vier de codingoefeningen">${config.exercises.map((e,i)=>{const status=exerciseStatus(e);return `<button type="button" data-maze="${i}" data-marking="${marking}" data-status="${status.kind}" aria-pressed="${index===i}"><span>${e.title} · ${pointText(e.points)}</span><small class="maze-state">${status.label}</small></button>`;}).join('')}</div>${!marking?'<p id="coding-progress" class="coding-progress" role="status"></p>':''}`;
  }
  function checkCodingBeforeNext() {
    flush();const unfinished=config.exercises.filter(e=>!exerciseStatus(e).complete);
    if(!unfinished.length)return false;
    let dialog=$('coding-review-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='coding-review-dialog';dialog.className='coding-review-dialog';document.body.appendChild(dialog);}
    dialog.setAttribute('aria-labelledby','coding-review-title');
    dialog.innerHTML=`<h2 id="coding-review-title">Controleer de vier mazes</h2><p>Deze oefeningen zijn nog niet afgewerkt. Je kunt eraan verder werken of bewust met een gedeeltelijk antwoord doorgaan.</p><div class="unfinished-list">${unfinished.map(e=>`<button type="button" data-resume-maze="${config.exercises.indexOf(e)}"><strong>${e.title}</strong><span>${exerciseStatus(e).label}</span></button>`).join('')}</div><div class="completion-actions"><button type="button" class="primary" data-close-coding>Verder werken</button><button type="button" data-continue-coding>Toch naar vraag 5</button></div>`;
    dialog.showModal();return true;
  }
  function choiceHtml(exercise,ex) {
    return `<section class="card"><h2>Kies hoe je deze oefening oplost</h2><p>Je kunt beide vormen uitproberen. Je keuze hieronder is het antwoord dat in je PDF wordt ingediend. Je andere ontwerp blijft apart bewaard.</p><div class="branch-options"><button type="button" data-branch="blocks" aria-pressed="${ex.choice==='blocks'}">Blokken<small>Maximaal ${points(exercise.points/2)} van de ${points(exercise.points)} punten</small></button><button type="button" data-branch="code" aria-pressed="${ex.choice==='code'}">JavaScript<small>Maximaal ${points(exercise.points)} van de ${points(exercise.points)} punten</small></button></div></section>`;
  }
  function renderCoding(group) {
    const exercise=config.exercises[mazeIndex],ex=state.exercises[exercise.id];
    $('question-panel').innerHTML=heading(group,{instructions:false})+mazeTabs(mazeIndex)+choiceHtml(exercise,ex)+(ex.choice?`<p class="ceiling"><strong>Definitief antwoord: ${ex.choice==='blocks'?'Blokken':'JavaScript'}</strong> · maximaal ${points(ex.choice==='blocks'?exercise.points/2:exercise.points)} / ${points(exercise.points)} punten. Je leerkracht beoordeelt de kwaliteit van je oplossing.</p><div class="editor-layout"><section class="card editor-card"><div class="editor-tools"><button class="primary" type="button" data-run>▶ Uitvoeren</button><button type="button" data-stop>Stop</button><button type="button" data-reset>Maze herstellen</button></div><div id="blockly-host" class="blockly-host" ${ex.choice==='code'?'hidden':''}></div>${ex.choice==='code'?`<label for="code-answer">Jouw JavaScript</label><textarea id="code-answer" class="code-editor" spellcheck="false" autocomplete="off" autocapitalize="off">${esc(ex.drafts.code.code)}</textarea>`:''}<p class="editor-note">${ex.choice==='blocks'?'Bouw je eigen programma. De gegenereerde JavaScript wordt niet getoond.':'Schrijf je eigen programma. Blokken worden niet omgezet naar dit antwoord.'}</p></section><section class="card editor-card"><h3>${exercise.title}</h3><canvas id="maze-canvas" class="maze-canvas" width="420" height="420" aria-label="Interactieve maze. Pegman: jouw positie en richting. Rode marker: doel."></canvas><p id="runtime-status" class="runtime-status" role="status"></p></section></div>`:`<section class="card answer-card"><img class="reference-program" src="${exercise.asset}" alt="Oorspronkelijke figuur ${exercise.title}"><p>Kies hierboven blokken of JavaScript om te beginnen.</p></section>`)+footer(group);
    if(ex.choice&&exercise.explanationPrompt)$('question-panel').querySelector('.question-footer').insertAdjacentHTML('beforebegin',`<section class="card answer-card">${taalzorg}<label for="maze-explanation">${esc(exercise.explanationPrompt)}<textarea id="maze-explanation" data-explanation="${exercise.id}">${esc(ex.drafts[ex.choice].explanation||'')}</textarea></label></section>`);
    if(ex.choice) mountRuntime(exercise,ex,false);
  }
  function mountRuntime(exercise,ex,marking) {
    try {
      activeExercise=exercise;
      const branch=ex.choice, draft=ex.drafts[branch];
      runtime=new window.AssessmentMaze({blocklyElement:$('blockly-host'),canvas:$('maze-canvas'),statusElement:$('runtime-status'),
        onChange(captured) {
          if(rendering) return;
          if(branch==='blocks') {
            const before=JSON.stringify(ex.drafts.blocks.workspace), after=JSON.stringify(captured.workspace);
            if(before!==after && !marking) { invalidate(ex,'blocks'); captured.markings={}; runtime.markings={}; }
            ex.drafts.blocks.workspace=captured.workspace; ex.drafts.blocks.markings=captured.markings;
          }
          state.lastExport=null; changed();
          if(marking) renderMarkList(ex);
        },
        onResult(result) { ex.results[branch]={...result,executedAt:new Date().toISOString()}; state.lastExport=null; changed(); }
      });
      runtime.mount({...exercise,mode:branch,workspace:branch==='blocks'?draft.workspace:null,code:branch==='code'?draft.code:'',markings:branch==='blocks'?draft.markings:{}});
      if(marking && runtime.workspace) {
        runtime.workspace.options.readOnly=true;
        runtime.workspace.getAllBlocks(false).forEach(b=>{b.setMovable(false);b.setDeletable(false);b.setEditable(false);});
        runtime.workspace.updateToolbox({kind:'categoryToolbox',contents:[]});
      }
      if(ex.results[branch]) $('runtime-status').textContent=ex.results[branch].message || (ex.results[branch].status==='reached'?'Laatste uitvoering: doel bereikt.':'Laatste uitvoering: doel nog niet bereikt.');
    } catch(error) {
      $('runtime-status').textContent='Editor kon niet geladen worden. Vraag je leerkracht om hulp. '+error.message;
      storageStatus('Editor niet beschikbaar',true);
    }
  }
  function markedCode(code,marks) {
    let cursor=0,html='';
    [...marks].sort((a,b)=>a.start-b.start).forEach(m=>{html+=esc(code.slice(cursor,m.start))+`<mark class="mark-${m.kind}" title="${m.kind==='action'?'Actie':'Voorwaarde'}">${esc(code.slice(m.start,m.end))}</mark>`;cursor=m.end;});
    return html+esc(code.slice(cursor));
  }
  function renderMarking(group) {
    const exercise=config.exercises[markIndex],ex=state.exercises[exercise.id];
    let html=heading(group)+mazeTabs(markIndex,true);
    if(!ex.choice) {
      $('question-panel').innerHTML=html+`<section class="card"><p>Kies eerst een antwoordtype voor ${exercise.title} in vraag 4.</p><button type="button" data-open-coding="${markIndex}">Ga naar ${exercise.title}</button></section>`+footer(group);return;
    }
    html+=`<section class="card"><h2>${exercise.title} · ${ex.choice==='blocks'?'Blokken':'JavaScript'}</h2><p>${ex.choice==='code'?'Selecteer tekst in je antwoord en klik daarna op Actie of Voorwaarde.':'Kies Actie of Voorwaarde en klik daarna op een blok in je antwoord.'}</p><div class="mark-tools"><button type="button" data-tool="action" aria-pressed="false">Geel · Actie</button><button type="button" data-tool="condition" aria-pressed="false">Groen · Voorwaarde</button><button type="button" data-clear-marks>Alle markeringen wissen</button></div>${ex.needsReview?'<p class="error" id="mark-warning">Je antwoord of antwoordtype is gewijzigd. Controleer je markeringen opnieuw.</p><button type="button" data-mark-reviewed>Markeringen gecontroleerd</button>':''}`;
    if(ex.choice==='code') html+=`<label for="mark-source">Selecteer een deel van je antwoord<textarea id="mark-source" class="code-editor mark-source" readonly spellcheck="false">${esc(ex.drafts.code.code)}</textarea></label><p class="editor-note">Met het toetsenbord: selecteer tekst met Shift + pijltjes en Tab naar Actie of Voorwaarde.</p><h3>Jouw markeringen</h3><pre id="mark-code" class="marked-preview">${markedCode(ex.drafts.code.code,ex.drafts.code.markings)}</pre>`;
    else html+='<div id="blockly-host" class="blockly-host"></div><canvas id="maze-canvas" hidden width="420" height="420"></canvas><p id="runtime-status" role="status"></p>';
    html+='<p id="mark-error" class="error" role="status"></p><div id="mark-list" class="mark-list"></div></section>';
    $('question-panel').innerHTML=html+footer(group);
    if(ex.choice==='blocks') mountRuntime(exercise,ex,true);
    renderMarkList(ex);
  }
  function renderMarkList(ex) {
    const list=$('mark-list'); if(!list) return;
    const marks=ex.choice==='code'?ex.drafts.code.markings:Object.entries(ex.drafts.blocks.markings).map(([id,m])=>({...m,id}));
    list.innerHTML=marks.length?marks.map((m,i)=>`<div class="mark-row"><span>${m.kind==='action'?'Geel · Actie':'Groen · Voorwaarde'}: ${esc(ex.choice==='code'?ex.drafts.code.code.slice(m.start,m.end):runtime?.workspace?.getBlockById(m.id)?.toString()||m.id)}</span><button type="button" data-remove-mark="${i}">Verwijder<span class="sr-only"> markering ${i+1}</span></button></div>`).join(''):'<p>Nog geen onderdelen gemarkeerd.</p>';
  }
  let codeSelection=null;
  function rememberSelection() {
    const source=$('mark-source');
    if(source && document.activeElement===source && source.selectionStart!==source.selectionEnd){codeSelection={start:source.selectionStart,end:source.selectionEnd};return;}
    const preview=$('mark-code'),selection=window.getSelection();
    if(!preview || !selection?.rangeCount || selection.isCollapsed) return;
    const range=selection.getRangeAt(0);
    if(!preview.contains(range.startContainer) || !preview.contains(range.endContainer)) return;
    const before=range.cloneRange();before.selectNodeContents(preview);before.setEnd(range.startContainer,range.startOffset);
    codeSelection={start:before.toString().length,end:before.toString().length+range.toString().length};
  }
  document.addEventListener('selectionchange',rememberSelection);
  function render(groupId,focus=true) {
    if(!state) return;
    rendering=true; disposeRuntime(); currentGroup=groupId;codeSelection=null;
    const group=config.groups.find(g=>g.id===groupId);
    if(group.type==='coding') renderCoding(group);
    else if(group.type==='marking') renderMarking(group);
    else if(group.type==='loop-boundary')renderBoundary(group);
    else renderFields(group);
    rendering=false; updateNav();updateMazeIndicators();persist();
    if(focus){$('question-panel').focus();window.scrollTo({top:0,behavior:'instant'});}
  }
  function renderReview() {
    rendering=true;disposeRuntime();currentGroup='review';rendering=false;flush();updateNav();
    const missing=config.groups.filter(g=>!answered(g));
    const ceiling=config.totalPoints-config.exercises.reduce((n,e)=>n+(state.exercises[e.id].choice==='blocks'?e.points/2:0),0);
    $('question-panel').innerHTML=`<div class="question-heading"><div><span class="eyebrow">OVERZICHT & INDIENEN</span><h1>Controleer je antwoorden</h1></div><span class="points">Toets op ${points(config.totalPoints)}</span></div><p>De vinkjes geven aan of je iets hebt ingevuld. Ze zeggen niet of je antwoord correct is.</p><div class="callout mint"><strong>Maximum met je huidige keuzes: ${points(ceiling)} / ${points(config.totalPoints)}</strong><p>${config.exercises.map(e=>{const ex=state.exercises[e.id];return `${e.title}: ${ex.choice==='blocks'?'blokken':ex.choice==='code'?'JavaScript':'nog geen keuze'} (max. ${points(ex.choice==='blocks'?e.points/2:e.points)} p.)`;}).join(' · ')}</p></div>${missing.length?`<p class="error">Nog niet volledig ingevuld: ${missing.map(g=>config.groups.indexOf(g)+1).join(', ')}. Je mag bewust een antwoord leeg laten.</p>`:''}<div class="review-list">${config.groups.map((g,i)=>`<div class="review-row"><div><strong>${i+1}. ${esc(g.title)}</strong><p>${answered(g)?'Ingevuld':'Nog nakijken'} · ${pointText(g.points)}</p></div><button type="button" data-group="${g.id}">Nakijken</button></div>`).join('')}</div><section class="card"><h2>1. Download je toets als PDF</h2><p>Je PDF bevat je antwoorden en je definitieve keuze per maze. Je andere ontwerp wordt niet ingediend.</p><button class="primary" type="button" id="export-pdf">${state.lastExport?'PDF opnieuw downloaden':'Download mijn volledige toets'}</button><p id="export-error" class="error" role="alert"></p><div id="completion" ${state.lastExport?'':'hidden'}></div></section>`;
    if(state.lastExport) renderCompletion();$('question-panel').focus();window.scrollTo(0,0);
    preparePDF();
  }
  function safeUrl(url) { try {const u=new URL(url);return /^https:$/.test(u.protocol)?u.href:null;} catch(_){return null;} }
  function renderCompletion() {
    const url=safeUrl(config.smartschoolUrl)||safeUrl(config.smartschoolFallbackUrl);
    const fallback=safeUrl(config.smartschoolFallbackUrl);
    $('completion').hidden=false;
    $('completion').innerHTML=`<div class="callout mint"><strong>PDF aangemaakt</strong><p>Controleer of het bestand op je toestel is gedownload. Het is nog niet ingediend.</p></div><p class="download-name">${esc(state.lastExport.filename)}</p><h2>2. Dien je PDF in via Smartschool</h2><p>Smartschool opent in dit venster. Controleer eerst of je PDF is gedownload. Meld je daarna aan en upload dit bestand bij de juiste toetsopdracht. Controleer in Smartschool of je bestand werd ingediend.</p>${url?'<div class="completion-actions"><button id="smartschool-open" class="primary" type="button">Open Smartschool →</button></div>':'<p class="error">De Smartschool-link is nog niet ingesteld. Vraag je leerkracht om hulp; je PDF en antwoorden blijven bewaard.</p>'}${fallback&&fallback!==url?'<p><button id="smartschool-fallback" type="button">Open de schoolaanmelding</button></p>':''}<h2>3. Sluit Safe Exam Browser</h2><p>Na het indienen sluit je Safe Exam Browser met het afsluitwachtwoord van je leerkracht. Vul dat wachtwoord in het afsluitvenster van SEB in.</p><p class="editor-note">Deze toets kan niet controleren of je PDF in Smartschool is ingediend.</p>`;
  }
  // Prepare before the download click: SEB must receive the download while the
  // student's click is still active, without awaiting fonts/images/Blockly.
  async function preparePDF() {
    if(exporting)return;
    flush();exporting=true;
    const controls=[...document.querySelectorAll('button')].map(button=>({button,disabled:button.disabled}));
    controls.forEach(({button})=>button.disabled=true);
    if(preparedPDF){URL.revokeObjectURL(preparedPDF.url);preparedPDF=null;}
    const button=$('export-pdf');button.textContent='PDF wordt klaargezet…';$('export-error').textContent='';
    try {
      const snapshot=JSON.parse(JSON.stringify(state));
      const result=await window.AssessmentPDF.create(config,snapshot);
      preparedPDF={filename:result.filename,url:URL.createObjectURL(result.blob)};
      button.textContent=state.lastExport?'PDF opnieuw downloaden':'Download mijn volledige toets';
    } catch(error) { $('export-error').textContent='PDF klaarzetten is mislukt. Je antwoorden blijven bewaard. Probeer opnieuw of vraag je leerkracht om hulp. '+error.message;button.textContent='Opnieuw PDF klaarzetten'; }
    finally {exporting=false;controls.forEach(({button,disabled})=>button.disabled=disabled);}
  }
  function exportPDF() {
    if(exporting)return;
    if(!preparedPDF){preparePDF();return;}
    try {
      const link=document.createElement('a');link.href=preparedPDF.url;link.download=preparedPDF.filename;
      document.body.appendChild(link);
      try {link.click();} finally {link.remove();}
      state.lastExport={filename:preparedPDF.filename,generatedAt:new Date().toISOString()};
      persist();renderCompletion();$('export-pdf').textContent='PDF opnieuw downloaden';
    } catch(error) {$('export-error').textContent='Download starten is mislukt. Probeer opnieuw of vraag je leerkracht om hulp. '+error.message;}
  }
  function openSmartschool(url) {
    const destination=safeUrl(url);
    if(!destination)return;
    flush();window.location.assign(destination);
  }
  function formatClass(){
    const field=$('student-class');
    field.value=field.value.toUpperCase().replace(/\s+/g,'');
    if(/^[1-6]$/.test(field.value))field.value='1STEAM'+field.value;
  }
  $('student-class').addEventListener('input',event=>{event.target.value=event.target.value.toUpperCase().replace(/\s+/g,'');});
  $('student-class').addEventListener('blur',formatClass);
  $('start-form').addEventListener('submit',event=>{
    event.preventDefault();$('gate-error').textContent='';
    formatClass();
    if($('start-password').value!==config.startPassword){$('gate-error').textContent='Het startwachtwoord is niet correct.';return;}
    if(!window.Blockly || !window.AssessmentMaze || !window.jspdf){$('gate-error').textContent='De toetsbestanden zijn niet volledig geladen. Vraag je leerkracht om hulp.';return;}
    const identity={name:$('student-name').value.trim(),className:$('student-class').value.trim(),number:$('student-number').value.trim()};
    if(Object.values(identity).some(v=>!v)){ $('gate-error').textContent='Vul je naam, klas en klasnummer in.';return; }
    state=(!$('new-attempt').checked&&readSaved(identity))||fresh(identity);$('start-password').value='';
    $('gate').hidden=true;$('exam').hidden=false;$('review-top').hidden=false;$('identity-label').textContent=`${identity.name} · ${identity.className} · nr. ${identity.number}`;
    render(config.groups[0].id);
    startTimer();
  });
  document.addEventListener('input',event=>{
    const target=event.target;
    if(target.dataset.explanation){const ex=state.exercises[target.dataset.explanation];ex.drafts[ex.choice].explanation=target.value;state.lastExport=null;changed();}
    if(target.dataset.answer){state.answers[target.dataset.answer][Number(target.dataset.index)]=target.value;state.lastExport=null;checkOrdering();changed();}
    if(target.id==='code-answer') {const ex=selectedExercise();if(ex.drafts.code.code!==target.value){invalidate(ex,'code');ex.drafts.code.code=target.value;runtime?.setCode(target.value);changed();}}
  });
  document.addEventListener('keydown',event=>{
    if(event.target.id==='code-answer' && event.key==='Tab' && !event.shiftKey){event.preventDefault();const input=event.target,start=input.selectionStart,end=input.selectionEnd;input.setRangeText('  ',start,end,'end');input.dispatchEvent(new Event('input',{bubbles:true}));}
    if(event.key==='Escape') runtime?.stop();
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||!state||exporting)return;
    if(button.dataset.resumeMaze!==undefined){$('coding-review-dialog').close();mazeIndex=Number(button.dataset.resumeMaze);render('q4');}
    else if(button.hasAttribute('data-close-coding'))$('coding-review-dialog').close();
    else if(button.hasAttribute('data-continue-coding')){$('coding-review-dialog').close();render('q5');}
    else if(button.id==='dismiss-timer-warning')$('timer-warning').hidden=true;
    else if(button.dataset.group){if(button.hasAttribute('data-coding-next')&&checkCodingBeforeNext())return;flush();render(button.dataset.group);}
    else if(button.matches('[data-review],#review-top,#review-side')) renderReview();
    else if(button.dataset.maze!==undefined){flush();if(button.dataset.marking==='true'){markIndex=Number(button.dataset.maze);render('q5');}else{mazeIndex=Number(button.dataset.maze);render('q4');}}
    else if(button.dataset.openCoding!==undefined){mazeIndex=Number(button.dataset.openCoding);render('q4');}
    else if(button.dataset.branch){flush();const ex=state.exercises[config.exercises[mazeIndex].id];if(ex.choice!==button.dataset.branch){ex.choice=button.dataset.branch;ex.needsReview=Boolean(Object.keys(ex.drafts.blocks.markings).length||ex.drafts.code.markings.length);state.lastExport=null;}render('q4');}
    else if(button.hasAttribute('data-run')){captureRuntime();runtime?.run(activeExercise?.boundary?undefined:selectedExercise().choice==='code'?$('code-answer').value:undefined);}
    else if(button.dataset.boundaryTool){runtime?.setMarkingTool(button.dataset.boundaryTool);document.querySelectorAll('[data-boundary-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}
    else if(button.hasAttribute('data-clear-boundary')){const answer=state.boundaries[currentGroup];answer.markings={};runtime.markings={};runtime._applyMarkingClasses();state.lastExport=null;changed();updateBoundaryMarks();}
    else if(button.hasAttribute('data-stop')){runtime?.stop();$('runtime-status').textContent='Uitvoering gestopt.';}
    else if(button.hasAttribute('data-reset')) runtime?.reset();
    else if(button.id==='export-pdf') exportPDF();
    else if(button.id==='smartschool-open') openSmartschool(safeUrl(config.smartschoolUrl)||safeUrl(config.smartschoolFallbackUrl));
    else if(button.id==='smartschool-fallback') openSmartschool(config.smartschoolFallbackUrl);
    else if(button.dataset.tool){
      const ex=state.exercises[config.exercises[markIndex].id];
      if(ex.choice==='blocks'){runtime?.setMarkingTool(button.dataset.tool);document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}
      else {
        const selection=codeSelection,code=ex.drafts.code.code;
        if(!selection||selection.start===selection.end){$('mark-error').textContent='Selecteer eerst tekst in je JavaScript-antwoord.';return;}
        ex.drafts.code.markings=ex.drafts.code.markings.filter(m=>m.end<=selection.start||m.start>=selection.end);
        ex.drafts.code.markings.push({...selection,kind:button.dataset.tool});ex.needsReview=false;state.lastExport=null;render('q5');
      }
    }
    else if(button.hasAttribute('data-clear-marks')){const ex=state.exercises[config.exercises[markIndex].id];ex.drafts[ex.choice].markings=ex.choice==='blocks'?{}:[];if(runtime)runtime.markings={};state.lastExport=null;render('q5');}
    else if(button.hasAttribute('data-mark-reviewed')){state.exercises[config.exercises[markIndex].id].needsReview=false;state.lastExport=null;render('q5');}
    else if(button.dataset.removeMark!==undefined){const ex=state.exercises[config.exercises[markIndex].id];const i=Number(button.dataset.removeMark);if(ex.choice==='code')ex.drafts.code.markings.splice(i,1);else {const id=Object.keys(ex.drafts.blocks.markings)[i];delete ex.drafts.blocks.markings[id];if(runtime)delete runtime.markings[id];}state.lastExport=null;render('q5');}
  });
  window.addEventListener('pagehide',()=>{if(state)flush();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state)flush();else if(state)updateTimer();});
  $('gate-title').textContent=config.title;$('exam-subtitle').textContent=config.subtitle;$('version-label').textContent=`Versie ${config.version}`;
  document.title=`${config.title} · Versie ${config.version}`;
  // Small read-only hooks for focused regression checks and alternate entry pages.
  window.AssessmentApp={getState:()=>state?JSON.parse(JSON.stringify(state)):null,flush,config};
})();
