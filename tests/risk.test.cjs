const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function app(){
  const html=fs.readFileSync(new URL('../index.html',`file://${__filename}`),'utf8');
  const code=html.match(/<script>([\s\S]*?)(?:<\/script>|$)/)[1].split("el('btnBackup').addEventListener")[0];
  const c=vm.createContext({console});vm.runInContext(code,c);
  c.cfg={accountSize:10000,targetBalance:11000,maxDD:.1,maxDaily:.05,maxRiskPct:.02,tradesToPass:2,tp1rr:1.5,tp2rr:2,tp1Rate:.5,tp2Rate:.5,tp1vol:.5,tp2vol:.5,profitTarget:.1,winRate:.5,trailing:false};
  c.balance=10000;c.hwm=10000;c.sessionPnl=0;
  return c;
}
test('horizon expiry is unfinished, not failure',()=>{const c=app();assert.equal(c.simulatePath(()=>.99,1).outcome,'unfinished');});
test('already passed account reports pass with no extra trades',()=>{const c=app();c.balance=11000;const r=c.simulatePath(()=>.99,500);assert.equal(r.outcome,'pass');assert.equal(r.trades,0);});
test('drawdown boundary reports breach',()=>{const c=app();c.balance=9000;assert.equal(c.simulatePath(()=>0,500).outcome,'blow');});
test('all-win path reaches target',()=>{const c=app();assert.equal(c.simulatePath(()=>0,500).outcome,'pass');});
test('risk respects hard cap, daily budget, drawdown and balance',()=>{const c=app();for(const bal of [9001,9500,10000,10990])for(const used of [0,400,499,500])for(const streak of [0,2,5]){const risk=c.simRiskCalc(bal,used,streak,10000);assert.ok(risk>=0);assert.ok(risk<=200);assert.ok(risk<=Math.max(0,500-used)*.95+1e-9);assert.ok(risk<=Math.max(0,c.getDDRemain(bal,10000))*.8+1e-9);}});
test('static and trailing drawdown use their respective reference',()=>{const c=app();assert.equal(c.getDDRemain(10000,10500),1000);c.cfg.trailing=true;assert.equal(c.getDDRemain(10000,10500),500);});
test('validated backup recomputes target and rejects malformed numbers',()=>{const c=app();const d={app:'goldenbullet',version:1,state:{cfg:{...c.cfg},trades:[]}};assert.equal(c.validateBackup(d).cfg.targetBalance,11000);d.state.cfg.maxDD=-1;assert.throws(()=>c.validateBackup(d));});
test('CSV quotes notes and neutralizes spreadsheet formulas',()=>{const c=app();assert.equal(c.csvCell('=HYPERLINK("x")'),'"\'=HYPERLINK(""x"")"');assert.equal(c.csvCell('a,b'),'"a,b"');});
