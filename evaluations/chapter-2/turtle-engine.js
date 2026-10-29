/* Bounded Turtle language interpreter. Student text is parsed as data, never evaluated. */
(function (root) {
  'use strict';
  class LanguageError extends Error {
    constructor(message, token, unsupported=false) { super(`${message}${token ? ` (regel ${token.line})` : ''}`); this.line=token?.line; this.unsupported=unsupported; }
  }
  function tokenize(source) {
    if (typeof source !== 'string' || source.length > 40000) throw new LanguageError('De code is te lang.');
    const out=[]; let i=0,line=1;
    const add=(value,type='symbol')=>{out.push({value,type,line}); if(out.length>12000)throw new LanguageError('Te veel code.');};
    while(i<source.length) {
      const c=source[i];
      if(/\s/.test(c)){if(c==='\n')line++;i++;continue;}
      if(source.slice(i,i+2)==='//'){while(i<source.length&&source[i]!=='\n')i++;continue;}
      if(source.slice(i,i+2)==='/*'){const end=source.indexOf('*/',i+2);if(end<0)throw new LanguageError('Sluit je commentaar af.',{line});line+=(source.slice(i,end).match(/\n/g)||[]).length;i=end+2;continue;}
      if(c==='"'||c==="'") {
        const quote=c,startLine=line; let value='',closed=false;i++;
        while(i<source.length){let ch=source[i++];if(ch===quote){closed=true;break;}if(ch==='\n')throw new LanguageError('Sluit de tekst af op dezelfde regel.',{line:startLine});if(ch==='\\'){ch=source[i++];if(!['\\',"'",'"'].includes(ch))throw new LanguageError('Deze tekstescape wordt niet ondersteund.',{line});}value+=ch;}
        if(!closed)throw new LanguageError('Sluit je tekst af met een aanhalingsteken.',{line:startLine});add(value,'string');continue;
      }
      const number=source.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
      if(number){add(Number(number[0]),'number');i+=number[0].length;continue;}
      const name=source.slice(i).match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
      if(name){add(name[0],'name');i+=name[0].length;continue;}
      const op=['<=','>=','++','--','+=','-=','==','!='].find(value=>source.startsWith(value,i));
      if(op){add(op);i+=op.length;continue;}
      if('(){};,+-*/%<>=.'.includes(c)){add(c);i++;continue;}
      throw new LanguageError(`Onverwacht teken '${c}'.`,{line});
    }
    out.push({value:'<eof>',type:'eof',line});return out;
  }
  function parse(source) {
    const tokens=tokenize(source);let pos=0,depth=0;
    const peek=()=>tokens[pos],take=()=>tokens[pos++];
    const is=value=>peek().value===value;
    const expect=value=>{if(!is(value))throw new LanguageError(`Verwacht '${value}', kreeg '${peek().value}'.`,peek());return take();};
    function name(){const t=take();if(t.type!=='name'||['for','var','let','const','while','if','else','return','function','new'].includes(t.value))throw new LanguageError('Verwacht een tellernaam.',t);return t.value;}
    const precedence={'==':1,'!=':1,'<':2,'<=':2,'>':2,'>=':2,'+':3,'-':3,'*':4,'/':4,'%':4};
    function primary() {
      if(++depth>64)throw new LanguageError('Te veel geneste haakjes.',peek());
      let node;const t=take();
      if(t.type==='number'||t.type==='string')node={type:'literal',value:t.value};
      else if(t.value==='('){node=expression();expect(')');}
      else if(['+','-'].includes(t.value))node={type:'unary',op:t.value,value:primary()};
      else if(t.type==='name')node={type:'name',name:t.value};
      else throw new LanguageError('Verwacht een getal, teller of tekst.',t);
      depth--;return node;
    }
    function expression(min=0){let left=primary();while(precedence[peek().value]>=min){const op=take().value;left={type:'binary',op,left,right:expression(precedence[op]+1)};}return left;}
    function declaration(){const kind=take().value,id=name();expect('=');return {type:'declare',kind,name:id,value:expression()};}
    function update(){let prefix=null;if(is('++')||is('--'))prefix=take().value;const id=name();if(prefix)return {type:'update',name:id,op:prefix};const op=take();if(['++','--'].includes(op.value))return {type:'update',name:id,op:op.value};if(['=','+=','-='].includes(op.value))return {type:'assign',name:id,op:op.value,value:expression()};throw new LanguageError('Gebruik =, ++, --, += of -= voor je teller.',op);}
    function semicolon(){if(is(';'))take();else if(!is('}')&&peek().type!=='eof'&&peek().line===tokens[pos-1]?.line)throw new LanguageError('Scheid instructies met een nieuwe regel of puntkomma.',peek());}
    function statement(){
      if(++depth>64)throw new LanguageError('Te veel geneste lussen.',peek());let node;
      if(is(';')){take();node={type:'empty'};}
      else if(is('{')){take();const body=[];while(!is('}')){if(peek().type==='eof')throw new LanguageError('Er ontbreekt een sluitaccolade }.',peek());body.push(statement());}take();node={type:'block',body};}
      else if(is('for')){take();expect('(');const init=['var','let','const'].includes(peek().value)?declaration():update();expect(';');const condition=expression();expect(';');const increment=update();expect(')');node={type:'for',init,condition,increment,body:statement()};}
      else if(['var','let','const'].includes(peek().value)){node=declaration();semicolon();}
      else if(['while','if','else','function','return','new','class','do','switch','try'].includes(peek().value))throw new LanguageError('Deze toets gebruikt Turtle-instructies en for-lussen.',peek(),true);
      else if(peek().type==='name'&&tokens[pos+1]?.value==='('){const id=take().value;expect('(');const args=[];if(!is(')')){do{args.push(expression());if(!is(','))break;take();}while(true);}expect(')');node={type:'call',name:id,args};semicolon();}
      else if(peek().type==='name'||is('++')||is('--')){node=update();semicolon();}
      else throw new LanguageError('Gebruik een Turtle-instructie of for-lus.',peek(),true);
      depth--;return node;
    }
    const body=[];while(peek().type!=='eof')body.push(statement());return {type:'program',body};
  }
  class Environment {
    constructor(parent=null){this.parent=parent;this.values=new Map();this.constants=new Set();}
    owner(name){return this.values.has(name)?this:this.parent?.owner(name);}
    get(name){const owner=this.owner(name);if(!owner)throw new LanguageError(`Onbekende teller '${name}'.`);return owner.values.get(name);}
    set(name,value){const owner=this.owner(name);if(!owner)throw new LanguageError(`Declareer '${name}' eerst met var of let.`);if(owner.constants.has(name))throw new LanguageError(`Je kunt const '${name}' niet veranderen.`);owner.values.set(name,value);return value;}
    declare(name,value,kind){let owner=this;if(kind==='var')while(owner.parent)owner=owner.parent;if(kind!=='var'&&owner.values.has(name))throw new LanguageError(`Teller '${name}' is al gedeclareerd.`);if(owner.constants.has(name))throw new LanguageError(`Je kunt const '${name}' niet veranderen.`);owner.values.set(name,value);if(kind==='const')owner.constants.add(name);}
  }
  function run(source, options={}) {
    const segments=[],actions=[],loops=[];let ticks=0,loopCount=0;
    const turtle={x:0,y:0,heading:options.heading??90,pen:true,color:'#5200ff'};
    const number=value=>{if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>100000)throw new LanguageError('Gebruik een eindig getal tussen -100000 en 100000.');return value;};
    const tick=()=>{if(++ticks>60000)throw new LanguageError('Staplimiet bereikt. Controleer start, eindgrens en interval.');};
    const movement=distance=>{number(distance);const rad=turtle.heading*Math.PI/180,nx=turtle.x+Math.cos(rad)*distance,ny=turtle.y+Math.sin(rad)*distance;number(nx);number(ny);if(turtle.pen&&Math.abs(distance)>1e-9)segments.push({x1:turtle.x,y1:turtle.y,x2:nx,y2:ny,color:turtle.color});turtle.x=nx;turtle.y=ny;};
    const colour=value=>{if(typeof value!=='string'||!/^#[\da-f]{6}$/i.test(value))throw new LanguageError('Gebruik een kleurcode tussen aanhalingstekens, bijvoorbeeld "#5200ff".');turtle.color=value.toLowerCase();};
    const api={
      moveForward:{argc:1,fn:d=>movement(d)},moveBackward:{argc:1,fn:d=>movement(-number(d))},
      turnLeft:{argc:1,fn:a=>{turtle.heading=(turtle.heading+number(a))%360;}},turnRight:{argc:1,fn:a=>{turtle.heading=(turtle.heading-number(a))%360;}},
      penUp:{argc:0,fn:()=>{turtle.pen=false;}},penDown:{argc:0,fn:()=>{turtle.pen=true;}},
      penColour:{argc:1,fn:colour},penColor:{argc:1,fn:colour},
      setPenColour:{argc:3,fn:(r,g,b)=>{const values=[r,g,b].map(n=>{number(n);if(n<0||n>255)throw new LanguageError('RGB-kleuren liggen tussen 0 en 255.');return Math.round(n).toString(16).padStart(2,'0');});colour('#'+values.join(''));}}
    };
    function value(node,env){tick();if(node.type==='literal')return node.value;if(node.type==='name')return env.get(node.name);if(node.type==='unary')return number(node.op==='-'?-number(value(node.value,env)):number(value(node.value,env)));const a=number(value(node.left,env)),b=number(value(node.right,env));switch(node.op){case '+':return number(a+b);case '-':return number(a-b);case '*':return number(a*b);case '/':return number(a/b);case '%':return number(a%b);case '<':return a<b;case '<=':return a<=b;case '>':return a>b;case '>=':return a>=b;case '==':return a===b;case '!=':return a!==b;default:throw new LanguageError('Onbekende bewerking.');}}
    function execute(node,env){
      tick();switch(node.type){
        case 'empty':break;
        case 'program':for(const item of node.body)execute(item,env);break;
        case 'block':{const child=new Environment(env);for(const item of node.body)execute(item,child);break;}
        case 'declare':env.declare(node.name,number(value(node.value,env)),node.kind);break;
        case 'assign':{const v=number(value(node.value,env));env.set(node.name,node.op==='='?v:number(env.get(node.name)+(node.op==='+='?v:-v)));break;}
        case 'update':env.set(node.name,number(env.get(node.name)+(node.op==='++'?1:-1)));break;
        case 'for':{
          const child=new Environment(env);execute(node.init,child);const record={name:node.init.name,start:child.get(node.init.name),iterations:0,increment:node.increment.op};loops.push(record);
          while(value(node.condition,child)){if(++loopCount>6000)throw new LanguageError('De lus blijft te lang doorgaan. Controleer je eindgrens en interval.');record.iterations++;execute(node.body,child);execute(node.increment,child);}record.end=child.get(node.init.name);break;
        }
        case 'call':{
          if(env.owner(node.name))throw new LanguageError(`'${node.name}' is een teller, geen Turtle-instructie.`);
          const command=api[node.name];if(!command||!Object.hasOwn(api,node.name))throw new LanguageError(`Onbekende Turtle-instructie '${node.name}'.`,null,true);
          if(node.args.length!==command.argc)throw new LanguageError(`'${node.name}' verwacht ${command.argc} parameter(s).`);
          const args=node.args.map(arg=>value(arg,env));command.fn(...args);actions.push({name:node.name,args});if(actions.length>12000)throw new LanguageError('Te veel tekenacties.');break;
        }
        default:throw new LanguageError('Niet-ondersteunde instructie.',null,true);
      }
    }
    try{const ast=parse(source);execute(ast,new Environment());return {status:'ok',segments,actions,loops,turtle,steps:ticks};}
    catch(error){return {status:error.unsupported?'unsupported':'error',message:error.message,line:error.line||null,segments,actions,loops,turtle,steps:ticks};}
  }
  function startMarker(ctx,x,y,{dark=false,scale=1,labelSide='auto'}={}) {
    const s=scale,colour=dark?'#d4c2ff':'#5200ff';
    ctx.save();ctx.strokeStyle=colour;ctx.fillStyle=colour;ctx.lineWidth=2*s;
    ctx.beginPath();ctx.moveTo(x,y-10*s);ctx.lineTo(x,y-32*s);ctx.moveTo(x-5*s,y-26*s);ctx.lineTo(x,y-32*s);ctx.lineTo(x+5*s,y-26*s);ctx.stroke();
    ctx.beginPath();ctx.arc(x,y,4*s,0,2*Math.PI);ctx.fill();
    ctx.font=`bold ${14*s}px sans-serif`;const label='Start (0, 0)',width=ctx.measureText(label).width;
    let left=labelSide==='left'?x-width-10*s:labelSide==='right'?x+10*s:x+width+18*s>ctx.canvas.width?x-width-10*s:x+10*s;
    left=Math.max(3*s,Math.min(ctx.canvas.width-width-3*s,left));
    ctx.fillStyle=dark?'#111111':'#ffffff';ctx.fillRect(left-3*s,y+5*s,width+6*s,18*s);
    ctx.fillStyle=colour;ctx.fillText(label,left,y+18*s);ctx.restore();
  }
  function drawingStart(direction){return {x:direction==='left'?0.75:0.25,y:0.9};}
  function referenceStart(id,parameters){
    if(id==='q3b'){const distance=parameters.distance/parameters.radius*125;return {x:250-distance*Math.cos(Math.PI/9)/2,y:210-distance*Math.sin(Math.PI/9)/2};}
    const side=parameters.side,points=[{x:0,y:0},{x:0,y:side*3}];let x=0,y=0,heading=90;
    for(let i=0;i<5;i++){x+=Math.cos(heading*Math.PI/180)*side;y+=Math.sin(heading*Math.PI/180)*side;points.push({x,y});heading+=parameters.direction==='left'?72:-72;}
    const xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min(340/(maxX-minX),340/(maxY-minY));
    return {x:250-(minX+maxX)/2*scale,y:215+(minY+maxY)/2*scale,labelSide:parameters.direction==='left'?'right':'left'};
  }
  function instructions(group){return group.prompt
    .replace('De turtle start met de pen omlaag en kijkt omhoog.', 'Begin bij Start (0, 0) en volg de pijl. De eerste beweging tekent meteen een lijn.')
    .replace('De startplaats op je blad is vrij.', 'Je mag je tekening verschuiven als je meer plaats nodig hebt.')
    .replace('Je turtle start omhoog.', 'Het startpunt (0, 0) en de startrichting staan op de gegeven figuur.');}
  function draw(canvas, result, {background='#ffffff',cursor=true,start=true}={}) {
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    ctx.fillStyle=background;ctx.fillRect(0,0,w,h);
    const xs=[0],ys=[0];for(const s of result.segments||[]){xs.push(s.x1,s.x2);ys.push(s.y1,s.y2);}if(cursor&&result.turtle){xs.push(result.turtle.x);ys.push(result.turtle.y);}
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min((w-65)/Math.max(100,maxX-minX),(h-65)/Math.max(100,maxY-minY));
    const point=(x,y)=>({x:w/2+(x-(minX+maxX)/2)*scale,y:h/2-(y-(minY+maxY)/2)*scale});
    ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2.5,Math.min(4,scale*1.5));
    for(const s of result.segments||[]){const a=point(s.x1,s.y1),b=point(s.x2,s.y2);ctx.strokeStyle=s.color;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    if(start){const origin=point(0,0);startMarker(ctx,origin.x,origin.y,{dark:background==='#111111'});}
    if(cursor&&result.turtle){const p=point(result.turtle.x,result.turtle.y);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-result.turtle.heading*Math.PI/180);ctx.fillStyle=background==='#111111'?'#ffffff':'#5200ff';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-6,-5);ctx.lineTo(-6,5);ctx.closePath();ctx.fill();ctx.restore();}
    return canvas;
  }
  const exported={parse,run,draw,startMarker,drawingStart,referenceStart,instructions};
  if(typeof module==='object'&&module.exports)module.exports=exported;
  else root.Chapter2Turtle=exported;
})(typeof globalThis==='object'?globalThis:this);
