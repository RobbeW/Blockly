/* Structural equivalence checks; no model answers are embedded in the exam configuration. */
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=version=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,`assessment/maze-version-${version.toLowerCase()}.js`),'utf8'),context);return JSON.parse(JSON.stringify(context.window.ASSESSMENT_CONFIG));};
const a=read('A');
const levelContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'maze/generated.js'),'utf8'),levelContext);
const level3=JSON.parse(JSON.stringify(levelContext.window.AIK_GENERATED.maze.levels.find(level=>level.id===3))),infinite=a.groups.find(group=>group.id==='q8');
assert.deepEqual(infinite.referenceMaze.map,level3.grid.map(row=>row.map(cell=>cell?'.':'#').join('')));assert.deepEqual(infinite.referenceMaze.start,{...level3.start,dir:1});assert.deepEqual(infinite.referenceMaze.goal,level3.goal);assert.ok(infinite.codeSample.includes('turnLeft();'));assert.ok(fs.existsSync(path.join(root,infinite.asset)));
const level5=JSON.parse(JSON.stringify(levelContext.window.AIK_GENERATED.maze.levels.find(level=>level.id===5))),boundary=a.groups.find(g=>g.id==='q9');assert.equal(boundary.type,'loop-boundary');assert.deepEqual(boundary.referenceMaze.map,level5.grid.map(row=>row.map(cell=>cell?'.':'#').join('')));assert.deepEqual(boundary.referenceMaze.start,{...level5.start,dir:1});assert.deepEqual(boundary.referenceMaze.goal,level5.goal);
function distances(exercise){const queue=[[exercise.start.x,exercise.start.y,0]],seen=new Set();while(queue.length){const [x,y,d]=queue.shift(),key=x+','+y;if(seen.has(key))continue;seen.add(key);if(x===exercise.goal.x&&y===exercise.goal.y)return d;for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]])if(exercise.map[y+dy]?.[x+dx]==='.')queue.push([x+dx,y+dy,d+1]);}throw new Error('Unreachable goal: '+exercise.id);}
for(const version of ['B','C']){
  const variant=read(version);assert.equal(variant.version,version);assert.equal(variant.id,a.id);assert.equal(variant.totalPoints,25);assert.equal(variant.durationMinutes,45);assert.equal(variant.startPassword,'Charles');
  const boundaryVariant=variant.groups.find(g=>g.id==='q9'),boundaryMap=boundary.referenceMaze.map.map(row=>[...row].reverse().join(''));if(version==='C')boundaryMap.reverse();assert.deepEqual(boundaryVariant.referenceMaze.map,boundaryMap);assert.equal(distances(boundaryVariant.referenceMaze),distances(boundary.referenceMaze));assert.ok(fs.existsSync(path.join(root,boundaryVariant.asset)));
  assert.deepEqual(variant.groups.map(g=>[g.id,g.type,g.points]),a.groups.map(g=>[g.id,g.type,g.points]));
  for(const id of ['q1','q2','q6','q7','q8','q9'])assert.notDeepEqual(variant.groups.find(g=>g.id===id),a.groups.find(g=>g.id===id),'Question must vary: '+id);
  assert.equal(variant.groups.reduce((s,g)=>s+g.points,0),25);assert.equal(variant.exercises.reduce((s,e)=>s+e.points,0),9);
  for(const [i,exercise] of variant.exercises.entries()){
    const original=a.exercises[i],width=original.map[0].length,height=original.map.length;
    const map=original.map.map(row=>[...row].reverse().join(''));if(version==='C')map.reverse();
    assert.deepEqual(exercise.map,map);assert.deepEqual(exercise.start,{x:width-1-original.start.x,y:version==='B'?original.start.y:height-1-original.start.y,dir:version==='B'?[0,3,2,1][original.start.dir]:(original.start.dir+2)%4});
    assert.deepEqual(exercise.goal,{x:width-1-original.goal.x,y:version==='B'?original.goal.y:height-1-original.goal.y});assert.equal(distances(exercise),distances(original));
    assert.equal(exercise.points,original.points);assert.deepEqual(exercise.requirements,original.requirements);assert.equal(Boolean(exercise.explanationPrompt),Boolean(original.explanationPrompt));
    assert.ok(fs.existsSync(path.join(root,exercise.asset)),'Missing image '+exercise.asset);
  }
  const html=fs.readFileSync(path.join(root,`test_maze_version_${version}.html`),'utf8');assert.ok(html.includes(`maze-version-${version.toLowerCase()}.js`));assert.ok(!html.includes('maze-version-a.js'));assert.ok(fs.existsSync(path.join(root,variant.groups.find(g=>g.id==='q3').asset)));
  console.log(`PASS ${version}: same skills/points, distinct questions, equal maze paths, independent entry and matching assets.`);
}
