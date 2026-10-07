/**
 * Reusable assessment Maze editor/runtime.
 * Requires Blockly blocks/core plus its JavaScript generator on window.Blockly
 * or window.javascript.
 * API: new AssessmentMaze({blocklyElement, canvas, statusElement, onChange})
 * then mount({map,start,goal,mode,workspace,code,markings}), capture(), run(code?),
 * stop(), reset(), dispose(), resize(), snapshot(), setMarkingTool(),
 * getBlockEvidence(). Map rows use # for walls and . for paths.
 */
(function (root) {
  'use strict';

  const ACTION_TYPES = new Set(['assessment_maze_move_forward', 'assessment_maze_turn_left', 'assessment_maze_turn_right']);
  const CONDITION_TYPES = new Set(['assessment_maze_path_ahead', 'assessment_maze_path_left', 'assessment_maze_path_right', 'assessment_maze_not_done']);
  const TILE_SHAPES = {
    '10010':[4,0], '10001':[3,3], '11000':[0,1], '10100':[0,2],
    '11010':[4,1], '10101':[3,2], '10110':[0,0], '10011':[2,0],
    '11001':[4,2], '11100':[2,3], '11110':[1,1], '10111':[1,0],
    '11011':[2,1], '11101':[1,2], '11111':[2,2],
    'null0':[4,3], 'null1':[3,0], 'null2':[3,1], 'null3':[0,3], 'null4':[1,3],
  };
  // Assessment directions are north/east/south/west. The original Pegman
  // sprite's base poses for those directions are 0/4/8/12 respectively.
  const DIR_TO_BASE_POSE = [0, 4, 8, 12];
  let mazeImagesPromise = null;

  function loadMazeImages() {
    if (mazeImagesPromise) return mazeImagesPromise;
    const supplied = root.ASSESSMENT_ASSETS || {};
    const sources = {
      tiles: supplied['assets/tiles_pegman.png'] || 'assets/tiles_pegman.png',
      sprite: supplied['assets/pegman.png'] || 'assets/pegman.png',
      marker: supplied['assets/marker.png'] || 'assets/marker.png',
    };
    mazeImagesPromise = Promise.all(Object.entries(sources).map(([key, src]) => new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve([key, image]);
      image.onerror = () => resolve([key, null]);
      image.src = src;
    }))).then(entries => Object.fromEntries(entries));
    return mazeImagesPromise;
  }
  const BLOCK_DEFS = [
    {type:'assessment_maze_move_forward', message0:'stap vooruit', previousStatement:null, nextStatement:null, colour:200},
    {type:'assessment_maze_turn_left', message0:'draai links', previousStatement:null, nextStatement:null, colour:200},
    {type:'assessment_maze_turn_right', message0:'draai rechts', previousStatement:null, nextStatement:null, colour:200},
    {type:'assessment_maze_path_ahead', message0:'pad voor mij?', output:'Boolean', colour:0},
    {type:'assessment_maze_path_left', message0:'pad links?', output:'Boolean', colour:0},
    {type:'assessment_maze_path_right', message0:'pad rechts?', output:'Boolean', colour:0},
    {type:'assessment_maze_not_done', message0:'niet klaar?', output:'Boolean', colour:0},
  ];

  function registerBlocks(B) {
    if (B.__assessmentMazeRegistered) return;
    if (typeof B.defineBlocksWithJsonArray === 'function') {
      B.defineBlocksWithJsonArray(BLOCK_DEFS.filter(d => !B.Blocks[d.type]));
    }
    const J = B.javascriptGenerator || root.javascript?.javascriptGenerator || B.JavaScript;
    if (J && J.forBlock) {
      J.forBlock.assessment_maze_move_forward = () => 'moveForward();\n';
      J.forBlock.assessment_maze_turn_left = () => 'turnLeft();\n';
      J.forBlock.assessment_maze_turn_right = () => 'turnRight();\n';
      J.forBlock.assessment_maze_path_ahead = () => ['isPathAhead()', J.ORDER_FUNCTION_CALL];
      J.forBlock.assessment_maze_path_left = () => ['isPathLeft()', J.ORDER_FUNCTION_CALL];
      J.forBlock.assessment_maze_path_right = () => ['isPathRight()', J.ORDER_FUNCTION_CALL];
      J.forBlock.assessment_maze_not_done = () => ['notDone()', J.ORDER_FUNCTION_CALL];
    } else if (J) {
      const order = J.ORDER_ATOMIC || 0;
      J.assessment_maze_move_forward = () => 'moveForward();\n';
      J.assessment_maze_turn_left = () => 'turnLeft();\n';
      J.assessment_maze_turn_right = () => 'turnRight();\n';
      J.assessment_maze_path_ahead = () => ['isPathAhead()', order];
      J.assessment_maze_path_left = () => ['isPathLeft()', order];
      J.assessment_maze_path_right = () => ['isPathRight()', order];
      J.assessment_maze_not_done = () => ['notDone()', order];
    }
    B.__assessmentMazeRegistered = true;
  }

  function defaultToolbox() {
    return {kind:'categoryToolbox', contents:[
      {kind:'category', name:'Acties', colour:'#4b63d3', contents:[
        {kind:'block', type:'assessment_maze_move_forward'}, {kind:'block', type:'assessment_maze_turn_left'}, {kind:'block', type:'assessment_maze_turn_right'}]},
      {kind:'category', name:'Voorwaarden', colour:'#15a99a', contents:[
        {kind:'block', type:'assessment_maze_path_ahead'}, {kind:'block', type:'assessment_maze_path_left'}, {kind:'block', type:'assessment_maze_path_right'}, {kind:'block', type:'assessment_maze_not_done'}]},
      {kind:'category', name:'Logica', colour:'#a86bd1', contents:[
        {kind:'block', type:'controls_if'}, {kind:'block', type:'controls_if', extraState:{hasElse:true}}]},
      {kind:'category', name:'Lussen', colour:'#a86bd1', contents:[
        {kind:'block', type:'controls_whileUntil', fields:{MODE:'WHILE'}}]},
    ]};
  }

  function workerSource() {
    return `self.onmessage = function (event) {
      const input = event.data, grid = input.map, rows = grid.length, cols = grid[0].length;
      let x = input.start.x, y = input.start.y, dir = input.start.dir || 0, ticks = 0;
      const frames = [{x,y,dir}], MAX = 2000;
      function tick(){ if (++ticks > MAX) throw new Error('Je programma heeft de staplimiet bereikt.'); }
      function open(px,py){ return py>=0 && py<rows && px>=0 && px<cols && grid[py][px] !== '#'; }
      function delta(d){ return [[0,-1],[1,0],[0,1],[-1,0]][d]; }
      function act(fn){ tick(); fn(); frames.push({x,y,dir}); }
      const api = {
        moveForward: function(){ act(function(){const d=delta(dir); if(open(x+d[0],y+d[1])){x+=d[0];y+=d[1];}}); },
        turnLeft: function(){ act(function(){dir=(dir+3)%4;}); },
        turnRight: function(){ act(function(){dir=(dir+1)%4;}); },
        isPathAhead: function(){ tick(); const d=delta(dir); return open(x+d[0],y+d[1]); },
        isPathLeft: function(){ tick(); const d=delta((dir+3)%4); return open(x+d[0],y+d[1]); },
        isPathRight: function(){ tick(); const d=delta((dir+1)%4); return open(x+d[0],y+d[1]); },
        isPathForward: function(){ return api.isPathAhead(); },
        notDone: function(){ tick(); return x!==input.goal.x || y!==input.goal.y; }
      };
      // Keep student code from using worker networking and child-worker APIs.
      ['fetch','XMLHttpRequest','WebSocket','EventSource','importScripts','Worker','SharedWorker','BroadcastChannel'].forEach(function(name){
        try { Object.defineProperty(self,name,{value:undefined,configurable:false,writable:false}); } catch (_) {}
      });
      try {
        const blocked = ['self','globalThis','postMessage','importScripts','fetch','XMLHttpRequest','WebSocket','EventSource','Worker','SharedWorker','BroadcastChannel','indexedDB','caches'];
        const names = Object.keys(api).concat(blocked), values = Object.keys(api).map(function(k){return api[k];}).concat(blocked.map(function(){return undefined;}));
        Function.apply(null, names.concat('"use strict";\\n'+input.code)).apply(null, values);
        self.postMessage({status:x===input.goal.x && y===input.goal.y?'reached':'not-reached',steps:ticks,position:{x:x,y:y,dir:dir},frames:frames});
      } catch (e) { self.postMessage({status:'error',steps:ticks,position:{x:x,y:y,dir:dir},message:String(e && e.message || e),frames:frames}); }
    };`;
  }

  class AssessmentMaze {
    constructor(options) {
      options = options || {};
      this.blocklyElement = options.blocklyElement;
      this.canvas = options.canvas;
      this.statusElement = options.statusElement || null;
      this.onChange = typeof options.onChange === 'function' ? options.onChange : function(){};
      this.onResult = typeof options.onResult === 'function' ? options.onResult : function(){};
      this.workspace = null; this.map = []; this.start = {x:0,y:0,dir:0}; this.goal = {x:0,y:0};
      this.mode = 'blocks'; this.code = ''; this.markings = {}; this.markingTool = null;
      this.frames = []; this.frameIndex = 0; this.timer = null; this.worker = null; this.timeout = null;
      this.runToken = 0; this.disposed = false; this._loading=false; this._displayPosition=null;
      this.images = null; this._readyPromise = null;
      if (!this.blocklyElement || !this.canvas) throw new Error('blocklyElement and canvas are required');
      this.ctx = this.canvas.getContext('2d');
      this._resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.resize()) : null;
      this._resizeObserver?.observe(this.canvas);
      this._resizeObserver?.observe(this.blocklyElement);
      if (!document.getElementById('assessment-maze-runtime-styles')) {
        const style=document.createElement('style'); style.id='assessment-maze-runtime-styles';
        style.textContent='.assessment-mark-action > .blocklyPath{stroke:#ffe45c!important;stroke-width:5px!important}.assessment-mark-condition > .blocklyPath{stroke:#00b874!important;stroke-width:5px!important}';
        document.head.appendChild(style);
      }
      this.ready();
    }

    mount(config) {
      config = config || {};
      this.stop();
      this.map = (config.map || ['###','#.#','###']).map(row => Array.isArray(row) ? row.join('') : String(row));
      if (!this.map.length || !this.map[0].length || this.map.some(row => row.length !== this.map[0].length)) throw new Error('map must be a non-empty rectangular array');
      this.start = Object.assign({x:0,y:0,dir:0}, config.start || {});
      this.goal = Object.assign({x:0,y:0}, config.goal || {});
      this.mode = config.mode || 'blocks'; this.code = String(config.code || '');
      this.markings = Object.assign({}, config.markings || {});
      const B = root.Blockly;
      if (!B) throw new Error('window.Blockly moet geladen zijn voordat de Maze-editor wordt gekoppeld.');
      registerBlocks(B);
      if (this.workspace && typeof this.workspace.dispose === 'function') this.workspace.dispose();
      this.workspace = B.inject(this.blocklyElement, {toolbox:defaultToolbox(), media:'assessment/vendor/blockly/media/', sounds:false, trashcan:true, move:{scrollbars:true,drag:true,wheel:true}, zoom:{controls:true,wheel:true,startScale:0.9,maxScale:1.5,minScale:0.5}, renderer:'zelos'});
      this._changeListener = event => {
        if (event && event.type === (B.Events && B.Events.SELECTED)) this._applySelectedMarking(event.newElementId);
        if (this._loading || (event && event.isUiEvent)) return;
        this._pruneMarkings(); this._applyMarkingClasses(); this._notifyChange();
      };
      this._loading = true;
      this.workspace.addChangeListener(this._changeListener);
      if (config.workspace) {
        try {
          const serialization = B.serialization && B.serialization.workspaces;
          if (serialization && serialization.load) serialization.load(config.workspace, this.workspace);
          else if (B.serialization && B.serialization.workspaces && B.serialization.workspaces.load) B.serialization.workspaces.load(config.workspace, this.workspace);
        } catch (e) { this._status('Blockly-werkruimte kon niet worden hersteld: ' + e.message); }
      }
      this._loading = false;
      this._pruneMarkings(); this._applyMarkingClasses(); this.reset(); this.resize();
      return this;
    }

    _notifyChange() { try { this.onChange(this.capture()); } catch (_) {} }
    _status(message) { if (this.statusElement) this.statusElement.textContent = message || ''; }
    _allBlocks() { return this.workspace && this.workspace.getAllBlocks ? this.workspace.getAllBlocks(false) : []; }
    _signature(block) { return [block.type, block.inputList?.map(i => i.name).join(',') || '', block.getFieldValue?.('MODE') || ''].join('|'); }
    _pruneMarkings() {
      const live = new Map(this._allBlocks().map(b => [b.id, this._signature(b)]));
      Object.keys(this.markings).forEach(id => { const mark=this.markings[id]; if (!live.has(id) || mark.signature !== live.get(id)) delete this.markings[id]; });
    }
    _applyMarkingClasses() {
      this._allBlocks().forEach(block => {
        const el = block.getSvgRoot && block.getSvgRoot(); if (!el) return;
        el.classList.remove('assessment-mark-action','assessment-mark-condition');
        const mark = this.markings[block.id]; if (mark) el.classList.add(mark.kind === 'condition' ? 'assessment-mark-condition' : 'assessment-mark-action');
      });
    }
    _applySelectedMarking(id) {
      if (!this.markingTool || !id) return;
      const block = this.workspace.getBlockById(id); if (!block) return;
      if (this.markingTool === 'erase') delete this.markings[id];
      else this.markings[id] = {kind:this.markingTool, signature:this._signature(block)};
      this._applyMarkingClasses(); this._notifyChange();
    }
    setMarkingTool(kind) { this.markingTool = kind === 'action' || kind === 'condition' || kind === 'erase' ? kind : null; }
    setCode(code) { this.code = String(code == null ? '' : code); this._notifyChange(); }

    capture() {
      const B = root.Blockly, serial = B && B.serialization && B.serialization.workspaces;
      let workspace = null;
      if (this.workspace && serial && serial.save) workspace = serial.save(this.workspace);
      else if (this.workspace && B && B.Xml) workspace = B.Xml.domToText(B.Xml.workspaceToDom(this.workspace));
      return {workspace, code:this.mode === 'code' ? this.code : this._generatedCode(), markings:JSON.parse(JSON.stringify(this.markings))};
    }
    _generatedCode() {
      const B = root.Blockly, generator = B && (B.javascriptGenerator || root.javascript?.javascriptGenerator || B.JavaScript);
      return generator && generator.workspaceToCode ? generator.workspaceToCode(this.workspace) : '';
    }

    async ready() {
      if (!this._readyPromise) this._readyPromise = loadMazeImages().then(images => {
        this.images = images;
        if (!this.disposed) this._draw(this._displayPosition || this.start);
        return images;
      });
      return this._readyPromise;
    }

    run(codeOverride) {
      this.stop();
      if (!this.map.length) throw new Error('mount() moet eerst worden aangeroepen.');
      const code = codeOverride == null ? (this.mode === 'code' ? this.code : this._generatedCode()) : String(codeOverride);
      this._displayPosition={...this.start}; this._status('Programma wordt uitgevoerd…');
      const token = ++this.runToken;
      const blob = new Blob([workerSource()], {type:'text/javascript'}), url = URL.createObjectURL(blob);
      const worker = new Worker(url); URL.revokeObjectURL(url); this.worker = worker;
      this.timeout = setTimeout(() => {
        if (this.worker === worker) {
          worker.terminate(); this.worker=null; this.timeout=null;
          const position={...(this._displayPosition || this.start)};
          const message='Maximale looptijd bereikt.';
          this._status('Uitvoering gestopt: maximale looptijd bereikt.');
          try { this.onResult({status:'error',steps:0,position,message}); } catch (_) {}
        }
      }, 1500);
      worker.onmessage = event => {
        if (token !== this.runToken) return;
        clearTimeout(this.timeout); this.timeout=null; worker.terminate(); this.worker=null;
        const data=event.data && typeof event.data==='object' ? event.data : {};
        this.frames = Array.isArray(data.frames) ? data.frames.slice(0,2001).map(f=>({x:Number.isInteger(f?.x)?f.x:this.start.x,y:Number.isInteger(f?.y)?f.y:this.start.y,dir:Number.isInteger(f?.dir)?((f.dir%4)+4)%4:this.start.dir})) : [];
        this.frameIndex=0;
        const last=this.frames[this.frames.length-1] || this.start;
        this._displayPosition={x:last.x,y:last.y,dir:last.dir};
        const status=['reached','not-reached','error'].includes(data.status) ? data.status : 'error';
        const result={status,steps:Number.isFinite(data.steps)?Math.max(0,Math.min(2000,Math.floor(data.steps))):0,position:{x:last.x,y:last.y,dir:last.dir},message:typeof data.message==='string'?data.message:''};
        if (status === 'error') this._status('Fout: ' + (result.message || 'ongeldige workerrespons'));
        else this._status(status === 'reached' ? 'Doel bereikt!' : 'Programma klaar. Het doel is nog niet bereikt.');
        try { this.onResult(result); } catch (_) {}
        this._animate(token);
      };
      worker.onerror = event => { if (token === this.runToken) { clearTimeout(this.timeout); this.timeout=null; worker.terminate(); this.worker=null; const message=event.message || 'onbekende fout'; this._status('Fout in programma: ' + message); try { this.onResult({status:'error',steps:0,position:{...(this._displayPosition || this.start)},message}); } catch (_) {} } };
      worker.postMessage({map:this.map,start:this.start,goal:this.goal,code});
    }
    _animate(token) {
      const show = () => {
        if (token !== this.runToken || this.frameIndex >= this.frames.length) { this.timer=null; return; }
        this._displayPosition=this.frames[this.frameIndex++]; this._draw(this._displayPosition); this.timer=setTimeout(show, 130);
      }; show();
    }
    stop() { this.runToken++; if (this.timer) clearTimeout(this.timer); this.timer=null; if (this.timeout) clearTimeout(this.timeout); this.timeout=null; if (this.worker) this.worker.terminate(); this.worker=null; }
    reset() { this.stop(); this.frames=[]; this.frameIndex=0; this._displayPosition={...this.start}; this._draw(this._displayPosition); this._status(''); }

    resize() {
      const rect = this.canvas.getBoundingClientRect(), dpr = Math.max(1, root.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(rect.width || this.canvas.width || 400)), h = Math.max(1, Math.floor(rect.height || w));
      if (this.canvas.width !== Math.round(w*dpr) || this.canvas.height !== Math.round(h*dpr)) { this.canvas.width=Math.round(w*dpr); this.canvas.height=Math.round(h*dpr); }
      this._draw(this._displayPosition || this.frames[this.frameIndex-1] || this.start);
      if (this.workspace) { const B=root.Blockly; (B.svgResize || B.common?.svgResize)?.(this.workspace); }
    }
    _draw(state) {
      if (!this.ctx || !this.map.length) return;
      const ctx=this.ctx, cw=this.canvas.width, ch=this.canvas.height, rows=this.map.length, cols=this.map[0].length;
      ctx.clearRect(0,0,cw,ch); const cell=Math.floor(Math.min(cw/cols,ch/rows)), ox=Math.floor((cw-cell*cols)/2), oy=Math.floor((ch-cell*rows)/2);
      const images=this.images;
      if(!images) return; // Avoid briefly showing the fallback while local images load.
      if (images?.tiles?.naturalWidth && images?.sprite?.naturalWidth && images?.marker?.naturalWidth) {
        ctx.imageSmoothingEnabled=false;
        const tileW=Math.floor(images.tiles.naturalWidth/5), tileH=Math.floor(images.tiles.naturalHeight/4);
        const frameW=Math.floor(images.sprite.naturalWidth/21), frameH=images.sprite.naturalHeight;
        const norm=(x,y)=>(x<0||x>=cols||y<0||y>=rows||this.map[y][x]==='#'?'0':'1');
        for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
          let key=norm(x,y)+norm(x,y-1)+norm(x+1,y)+norm(x,y+1)+norm(x-1,y);
          if(!TILE_SHAPES[key]) key=key==='00000'?'null0':'null'+(((x+y)%4)+1);
          const [ax,ay]=TILE_SHAPES[key];
          ctx.drawImage(images.tiles,ax*tileW,ay*tileH,tileW,tileH,ox+x*cell,oy+y*cell,cell,cell);
        }
        const markerScale=cell/tileW;
        for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) if(x===this.goal.x&&y===this.goal.y) {
          const w=Math.round(images.marker.naturalWidth*markerScale*.9),h=Math.round(images.marker.naturalHeight*markerScale*.9);
          ctx.drawImage(images.marker,ox+x*cell+Math.floor((cell-w)/2),oy+y*cell+Math.floor((cell-h)/2),w,h);
        }
        if(state) {
          const pegScale=cell/tileW,pegW=Math.round(frameW*pegScale),pegH=Math.round(frameH*pegScale);
          const pose=DIR_TO_BASE_POSE[((state.dir||0)%4+4)%4];
          const px=ox+(state.x+.5)*cell,py=oy+(state.y+.5)*cell;
          ctx.drawImage(images.sprite,pose*frameW,0,frameW,frameH,Math.floor(px-pegW/2),Math.floor(py-pegH/2),pegW,pegH);
        }
        if(state?.issue==='wall') { ctx.save();ctx.strokeStyle='#ef4444';ctx.lineWidth=Math.max(3,Math.floor(cell*.08));ctx.strokeRect(ox+state.x*cell+cell*.12,oy+state.y*cell+cell*.12,cell*.76,cell*.76);ctx.restore(); }
        return;
      }
      for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
        const wall=this.map[y][x]==='#'; ctx.fillStyle=wall?'#25304d':'#f3f6ff'; ctx.fillRect(ox+x*cell,oy+y*cell,cell,cell);
        ctx.strokeStyle='#d6dced'; ctx.lineWidth=Math.max(1,cell*0.025); ctx.strokeRect(ox+x*cell,oy+y*cell,cell,cell);
        if(x===this.goal.x&&y===this.goal.y){ ctx.fillStyle='#22c99a'; ctx.beginPath(); ctx.arc(ox+(x+.5)*cell,oy+(y+.5)*cell,cell*.27,0,Math.PI*2); ctx.fill(); }
      }
      if(state){ const cx=ox+(state.x+.5)*cell,cy=oy+(state.y+.5)*cell,a=(state.dir||0)*Math.PI/2; ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,-cell*.32);ctx.lineTo(cell*.25,cell*.23);ctx.lineTo(0,cell*.12);ctx.lineTo(-cell*.25,cell*.23);ctx.closePath();ctx.fillStyle='#5938df';ctx.fill();ctx.restore(); }
    }
    snapshot(position) {
      if (!position) return this.canvas.toDataURL('image/png');
      const previous=this._displayPosition; this._draw(position);
      const image=this.canvas.toDataURL('image/png'); this._draw(previous || this.start); return image;
    }
    async getBlockEvidence() {
      if (!this.workspace) return null;
      const B=root.Blockly;
      const wsSvg = this.workspace.getParentSvg ? this.workspace.getParentSvg() : this.blocklyElement.querySelector('svg');
      if (!wsSvg) return null;
      const liveCanvas=wsSvg.querySelector('.blocklyBlockCanvas'); if(!liveCanvas) return null;
      let bb; try { bb=liveCanvas.getBBox(); } catch (_) { return null; }
      if (!bb.width || !bb.height) return null;
      const ns='http://www.w3.org/2000/svg', pad=24, topPad=34;
      const width=Math.max(320,Math.ceil(bb.width+pad*2)), height=Math.ceil(bb.height+topPad+pad);
      const svg=document.createElementNS(ns,'svg'); svg.setAttribute('xmlns',ns);svg.setAttribute('width',width);svg.setAttribute('height',height);svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      const bg=document.createElementNS(ns,'rect');bg.setAttribute('width',width);bg.setAttribute('height',height);bg.setAttribute('fill','#fff');svg.appendChild(bg);
      const defs=wsSvg.querySelector('defs'); if(defs) {
        const safeDefs=defs.cloneNode(true);
        safeDefs.querySelectorAll('[href],[xlink\\:href]').forEach(el=>{
          for(const attr of ['href','xlink:href']) { const value=el.getAttribute(attr); if(value && !value.trim().startsWith('#')) el.removeAttribute(attr); }
        });
        svg.appendChild(safeDefs);
      }
      const layer=document.createElementNS(ns,'g');layer.setAttribute('transform',`translate(${pad-bb.x} ${topPad-bb.y})`);
      const blockLayer=liveCanvas.cloneNode(true);blockLayer.removeAttribute('transform');
      // Blockly styles normally come from page CSS; inline the resolved values so
      // this standalone SVG keeps labels, colours, outlines, and icons in exports.
      const styleProps=['fill','fill-opacity','fill-rule','stroke','stroke-opacity','stroke-width','stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-dashoffset','font-family','font-size','font-weight','text-anchor','opacity','filter','display','visibility','clip-path','clip-rule','mask','shape-rendering','vector-effect'];
      const originals=[liveCanvas,...liveCanvas.querySelectorAll('*')], copies=[blockLayer,...blockLayer.querySelectorAll('*')];
      originals.forEach((el,index)=>{ const copy=copies[index]; if(!copy)return; const computed=getComputedStyle(el); styleProps.forEach(prop=>{let value=computed.getPropertyValue(prop);if(!value)return;const externalRef=/url\((?:['"])?([^)'\"]+)/ig;let ref,hasExternal=false;while((ref=externalRef.exec(value)))if(!ref[1].trim().startsWith('#'))hasExternal=true;if(['filter','clip-path','mask'].includes(prop)&&hasExternal)value='none';copy.style.setProperty(prop,value);}); });
      blockLayer.querySelectorAll('.assessment-mark-action > .blocklyPath').forEach(el=>{el.style.setProperty('stroke','#ffe45c');el.style.setProperty('stroke-width','4px');});
      blockLayer.querySelectorAll('.assessment-mark-condition > .blocklyPath').forEach(el=>{el.style.setProperty('stroke','#00b874');el.style.setProperty('stroke-width','4px');});
      layer.appendChild(blockLayer); svg.appendChild(layer);
      // Add compact per-block badges and a key so markings remain legible in PDFs.
      const colors={action:'#ffe45c',condition:'#00b874'};
      const badgeCenters=[];
      for(const block of this._allBlocks()) {
        const mark=this.markings[block.id]; if(!mark || !colors[mark.kind]) continue;
        const xy=block.getRelativeToSurfaceXY?.(), size=block.getHeightWidth?.(); if(!xy||!size) continue;
        let cx=xy.x+size.width-2, cy=xy.y-2;
        const offsets=[[0,0],[14,-14],[-14,-14],[14,14],[-14,14],[28,0],[-28,0],[0,-28],[0,28],[28,-20],[-28,-20],[28,20],[-28,20]];
        for(const [dx,dy] of offsets){const tx=xy.x+size.width-2+dx,ty=xy.y-2+dy;if(badgeCenters.every(p=>Math.hypot(tx-p.x,ty-p.y)>=20)){cx=tx;cy=ty;break;}}
        badgeCenters.push({x:cx,y:cy});
        const badge=document.createElementNS(ns,'circle');badge.setAttribute('cx',cx);badge.setAttribute('cy',cy);badge.setAttribute('r','10');badge.setAttribute('fill',colors[mark.kind]);badge.setAttribute('stroke','#27324b');badge.setAttribute('stroke-width','1.5');layer.appendChild(badge);
        const label=document.createElementNS(ns,'text');label.setAttribute('x',cx);label.setAttribute('y',cy+4);label.setAttribute('text-anchor','middle');label.setAttribute('font-family','Arial,sans-serif');label.setAttribute('font-size','11');label.setAttribute('font-weight','700');label.setAttribute('fill','#172033');label.textContent=mark.kind==='action'?'A':'V';layer.appendChild(label);
      }
      const legend=document.createElementNS(ns,'text');legend.setAttribute('x',pad);legend.setAttribute('y','20');legend.setAttribute('font-family','Arial,sans-serif');legend.setAttribute('font-size','12');legend.setAttribute('font-weight','600');legend.setAttribute('fill','#27324b');legend.textContent='A = Actie     V = Voorwaarde';svg.appendChild(legend);
      const xml=new XMLSerializer().serializeToString(svg), image=new Image();
      await new Promise((resolve,reject)=>{ image.onload=resolve; image.onerror=()=>reject(new Error('Blockly-blokken konden niet als afbeelding worden gerenderd.')); image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml); });
      const rasterScale=3, canvas=document.createElement('canvas'); canvas.width=width*rasterScale; canvas.height=height*rasterScale; const ctx=canvas.getContext('2d'); ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.scale(rasterScale,rasterScale);ctx.drawImage(image,0,0,width,height);return canvas.toDataURL('image/png');
    }
    dispose() { this.stop(); this._resizeObserver?.disconnect(); if(this.workspace){this.workspace.dispose();this.workspace=null;} this.disposed=true; }
  }
  root.AssessmentMaze = AssessmentMaze;
})(window);
