'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {validateName,validateTree,noSymlinkComponents,prepare}=require('./prepare-github-upload.cjs');

test('private areas, teacher keys, credentials and personal exports are rejected',()=>{
  for(const name of ['grading/app/rubric-c.json','evaluations/chapter-2/source/original.pdf',
    'evaluations/chapter-2/grading/C/rubric.json','output/reviewer-state/record.json',
    'student.pdf','.harness/PROJECT.md','.codex/config.toml','.agents/policy.md',
    'docs/private.md','AGENTS.md','HARNESS_START_HERE.md','brand_motion.md',
    'syllabus/brand_motion_notes.md','.DS_Store','.env','class.csv','class.xlsx',
    'Vakantiecursus/exam.pdf','media/working.png','../outside.js','assets/../../outside.js'])
    assert.throws(()=>validateName(name),name);
});
test('required public syllabus and nested Blockly media remain permitted',()=>{
  for(const name of ['syllabus/syllabus_blockly_in_de_klas.pdf','assessment/vendor/blockly/media/1x1.gif',
    'evaluations/chapter-2/versions/A/index.html','teacher.html'])validateName(name);
});
test('a non-allowlisted file blocks upload without deleting it',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'blockly-public-check-'));
  try{
    fs.writeFileSync(path.join(temp,'index.html'),'<h1>Synthetic</h1>');
    fs.writeFileSync(path.join(temp,'student-record.json'),'{}');
    assert.throws(()=>validateTree(temp,['index.html']),/Unreviewed file/);
    assert.ok(fs.existsSync(path.join(temp,'student-record.json')));
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('symlink assets are rejected instead of followed',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'blockly-public-check-'));
  try{
    fs.writeFileSync(path.join(temp,'outside.txt'),'synthetic');
    fs.mkdirSync(path.join(temp,'site'));
    fs.symlinkSync(path.join(temp,'outside.txt'),path.join(temp,'site','linked.txt'));
    assert.throws(()=>validateTree(path.join(temp,'site'),['linked.txt']),/Symlink/);
    fs.symlinkSync(path.join(temp,'site'),path.join(temp,'alias'));
    assert.throws(()=>noSymlinkComponents(temp,'alias/linked.txt'),/Symlink/);
    noSymlinkComponents(temp,'not-created/site');
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('complete public bundle matches source bytes, references and exports',()=>{
  const manifest=prepare({checkOnly:true});
  assert.ok(manifest.files['index.html']);assert.ok(manifest.files['platform.html']);
  assert.ok(manifest.files['teacher.html']);
  for(const version of 'ABC'){
    assert.ok(manifest.files[`test_maze_version_${version}.html`]);
    assert.ok(manifest.files[`evaluations/chapter-2/versions/${version}/index.html`]);
  }
});
