'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createHash}=require('node:crypto');
const turtle=require('../evaluations/chapter-2/turtle-engine.js'),root=path.resolve(__dirname,'..');
function ok(source){const result=turtle.run(source);assert.equal(result.status,'ok',result.message);return result;}
const square=ok('for (var teller = 0; teller < 4; teller++) {\n moveForward(30)\n turnRight(90)\n}');
assert.equal(square.segments.length,4);assert.ok(Math.hypot(square.turtle.x,square.turtle.y)<1e-8);
assert.equal(ok('for(let i=2;i<14;i+=3){moveForward(2)}').segments.length,4);
assert.equal(ok('for(let i=10;i>0;i-=2){moveForward(i)}').segments.length,5);
assert.equal(ok('for(var i=1;i<=4;i=i+1){moveForward(2)}').segments.length,4);
assert.equal(ok('for (var i=0;i<3;++i){for(let j=0;j<2;j++){moveForward(1)}penUp();moveForward(2);penDown()}').segments.length,6);
assert.equal(ok('penUp();moveForward(15);penDown();moveForward(20)').segments.length,1);
assert.equal(ok('penColour("#ff0000");moveBackward(25)').segments[0].color,'#ff0000');
assert.equal(ok('setPenColour(1,119,167);moveForward(10)').segments[0].color,'#0177a7');
assert.equal(ok('var i=0;for(i=0;i<2;i++){moveForward(1)}').segments.length,2);
assert.equal(ok('/* function is mentioned only in a comment */ for(var i=0;i<2;i++){moveForward((3+2)*2)}').segments.length,2);
for(const code of ['fetch("https://example.com")','constructor("return globalThis")','window.location="x"','moveForward.constructor("x")','while(true){}','if(1){}','for(var i=0;i<4;i++){moveForward(1)','penColour(#ff0000);','for(const i=0;i<2;i++){moveForward(1)}','moveForward(1/0)','__proto__(1)','for(var i=0;i<5;i--){moveForward(1)}','for(var i=0;i<5;i+=0){}'])assert.notEqual(turtle.run(code).status,'ok',`Unsafe/nonworking input accepted: ${code}`);
assert.notEqual(turtle.run('('.repeat(100)+'1'+')'.repeat(100)).status,'ok');
assert.notEqual(turtle.run('x'.repeat(40001)).status,'ok');
let skeleton;
for(const version of ['A','B','C']){
  const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,`evaluations/chapter-2/versions/${version}/config.js`),'utf8'),context);
  const config=JSON.parse(JSON.stringify(context.window.ASSESSMENT_CONFIG));
  const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
  const content=Object.fromEntries(Object.entries(config).filter(([key])=>!['configSha256','startPassword','smartschoolUrl','teacher'].includes(key)));
  assert.equal(config.configSha256,createHash('sha256').update(JSON.stringify(canonical(content))).digest('hex'),'Question edits must update their content binding');
  assert.equal(config.id,'chapter-2');assert.equal(config.version,version);assert.equal(config.durationMinutes,45);assert.equal(config.totalPoints,23);
  assert.equal(config.groups.reduce((sum,g)=>sum+g.points,0),23);assert.equal(config.groups.length,7);
  const structure=config.groups.map(g=>[g.id,g.type,g.points]);if(skeleton)assert.deepEqual(structure,skeleton);else skeleton=structure;
  assert.equal(config.groups[1].traces.length,3);assert.equal(config.groups[2].tasks.length,2);assert.equal(config.groups.some(group=>group.id==='q5'),false);
  assert.equal(config.groups[6].rows.filter(row=>!row.name).length,2);assert.equal(config.groups[6].rows.filter(row=>!row.description).length,4);
  assert.equal(config.revision,'20261029-turtle-v3');assert.equal(config.groups[1].type,'trace-choice');
  for(const trace of config.groups[1].traces){assert.deepEqual(trace.options.map(option=>option.id),['A','B','C','D']);assert.ok(trace.options.every(option=>option.figure.segments.length>0));}
  for(const task of config.groups[2].tasks){assert.ok(task.figure.segments.length>0);assert.ok(task.inspiration.includes('Blockly Turtle'));}
  console.log(`PASS ${version}: 45 minutes, 7 questions, /23, 3 figure/count pairs and 2 platform-inspired for/Turtle code tasks.`);
}
console.log('PASS safe Turtle interpreter: parameter variants, nesting, pen state, limits and disallowed JavaScript.');
