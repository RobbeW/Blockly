/* Render assessment reference mazes and version B/C question-3 diagrams from native Blockly/canvas. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const {pathToFileURL}=require('url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const configs=['a','b','c'].map(version=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,`assessment/maze-version-${version}.js`),'utf8'),context);return context.window.ASSESSMENT_CONFIG;});
async function main(){
  const browser=await chromium.launch({headless:true,...(process.env.ASSESSMENT_BROWSER?{executablePath:process.env.ASSESSMENT_BROWSER}:{})});
  try{
    const page=await browser.newPage({viewport:{width:1200,height:900}});
    await page.goto(pathToFileURL(path.join(root,'test_maze_version_A.html')).href);
    const images=await page.evaluate(async configs=>{
      const result={};
      const host=document.createElement('div');host.style.cssText='position:absolute;left:0;top:0;width:900px;height:650px;background:white;';document.body.appendChild(host);
      const blockly=document.createElement('div');blockly.style.cssText='width:900px;height:650px;';host.appendChild(blockly);
      const canvas=document.createElement('canvas');canvas.width=420;canvas.height=420;host.appendChild(canvas);
      for(const config of configs){
        const version=config.version.toLowerCase();
        for(const group of config.groups.filter(group=>group.referenceMaze)){
          const runtime=new AssessmentMaze({blocklyElement:blockly,canvas});runtime.mount({...group.referenceMaze,mode:'code'});await runtime.ready();result[group.asset]=runtime.snapshot();runtime.dispose();
        }
        if(version==='a')continue;
        for(const exercise of config.exercises){
          const runtime=new AssessmentMaze({blocklyElement:blockly,canvas});runtime.mount({...exercise,mode:'code'});await runtime.ready();
          result[exercise.asset]=runtime.snapshot();runtime.dispose();
        }
        const runtime=new AssessmentMaze({blocklyElement:blockly,canvas});runtime.mount({...config.exercises[0],mode:'blocks'});await runtime.ready();
        const workspace=runtime.workspace;
        const make=(type,extra)=>{const block=workspace.newBlock(type);if(extra)block.loadExtraState(extra);block.initSvg();block.render();return block;};
        const chain=types=>{const blocks=types.map(type=>make(type));for(let i=1;i<blocks.length;i++)blocks[i-1].nextConnection.connect(blocks[i].previousConnection);return blocks[0];};
        const loop=make('controls_whileUntil'),done=make('assessment_maze_not_done');loop.getInput('BOOL').connection.connect(done.outputConnection);
        const selection=make('controls_if',{hasElse:true}),ahead=make('assessment_maze_path_ahead');selection.getInput('IF0').connection.connect(ahead.outputConnection);
        selection.getInput('DO0').connection.connect(chain(['assessment_maze_move_forward']).previousConnection);
        selection.getInput('ELSE').connection.connect(chain(['assessment_maze_turn_right','assessment_maze_move_forward']).previousConnection);
        const next=make('controls_if'),side=make(version==='b'?'assessment_maze_path_right':'assessment_maze_path_left');next.getInput('IF0').connection.connect(side.outputConnection);
        next.getInput('DO0').connection.connect(chain(['assessment_maze_turn_left','assessment_maze_move_forward']).previousConnection);
        selection.nextConnection.connect(next.previousConnection);loop.getInput('DO').connection.connect(selection.previousConnection);
        workspace.render();
        // Blockly batches connected-block layout; wait for those renders before taking evidence.
        await new Promise(resolve=>setTimeout(resolve,150));
        if(Blockly.renderManagement?.finishQueuedRenders)await Blockly.renderManagement.finishQueuedRenders();
        result[`assessment/assets/program-${version}.png`]=await runtime.getBlockEvidence({includeLegend:false});runtime.dispose();
      }
      host.remove();return result;
    },configs);
    for(const [file,data] of Object.entries(images)){if(!data?.startsWith('data:image/png;base64,'))throw new Error('Could not render '+file);fs.writeFileSync(path.join(root,file),Buffer.from(data.split(',')[1],'base64'));console.log('Rendered '+file);}
  }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
