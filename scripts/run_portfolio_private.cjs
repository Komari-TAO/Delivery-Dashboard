/* Explicit private-data gate. Never writes into the production/evidence tree. */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(process.env.CH005A_PRIVATE_ROOT||path.resolve(__dirname,'..'));
if(process.env.CH005A_PRIVATE_GATE!=='1'){console.error('BLOCKED: set CH005A_PRIVATE_GATE=1 only with authorized local production fixtures; public gates are separate.');process.exit(2);}
const required=['web/data.js','outputs/ch005a/before-results.json','outputs/ch005a/before-legacy-exports.json','outputs/ch005a/before/data.js','outputs/ch005a/before/index.html','outputs/ch005a/before/app.js','scripts/legacy/test_portfolio_accounts_private.cjs','scripts/legacy/verify_portfolio_accounts_private.cjs'];
const missing=required.filter(p=>!fs.existsSync(path.join(root,p)));if(missing.length){console.error('BLOCKED: required private inputs absent: '+missing.join(', '));process.exit(2);}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ch005a-private-'));fs.mkdirSync(path.join(temp,'scripts'));fs.mkdirSync(path.join(temp,'outputs'),{recursive:true});fs.cpSync(path.join(root,'web'),path.join(temp,'web'),{recursive:true});fs.cpSync(path.join(root,'outputs/ch005a'),path.join(temp,'outputs/ch005a'),{recursive:true});
for(const name of ['test_portfolio_accounts','verify_portfolio_accounts'])fs.copyFileSync(path.join(root,'scripts/legacy',name+'_private.cjs'),path.join(temp,'scripts',name+'.cjs'));
console.log('Private gate uses isolated OS temporary workspace; no original artifacts overwritten. Temporary private outputs require local retention policy.');
for(const name of ['test_portfolio_accounts','verify_portfolio_accounts']){const r=spawnSync(process.execPath,[path.join(temp,'scripts',name+'.cjs')],{stdio:'inherit',env:process.env});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
console.log('PASS isolated current-source private gates; 13 supplemental legacy cases and historical replay remain separate retained evidence, not claimed rerun.');
