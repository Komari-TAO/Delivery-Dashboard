/* Current public gate: domain assertions followed by real-UI synthetic assertions. */
const {spawnSync}=require('node:child_process');const path=require('node:path');
for(const name of ['test_portfolio_accounts.cjs','test_capacity_public.cjs','verify_portfolio_accounts.cjs']){const r=spawnSync(process.execPath,[path.join(__dirname,name)],{stdio:'inherit',env:process.env});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
