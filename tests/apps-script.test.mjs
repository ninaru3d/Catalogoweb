import {test} from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFile} from 'node:fs/promises'
const code=await readFile(new URL('../google-apps-script/Code.gs',import.meta.url),'utf8')
function harness(){
  const props=new Map([['STORE_ID','ninaru3d'],['FOLDER_ID','1eGRyKqQ4x3waWR2mK4iuESxvJLIMTUHM'],['SHEET_ID','sheet'],['ADMIN_KEY','a'.repeat(64)],['ACTIVE',JSON.stringify({version:1,row:2,count:1})]])
  const initial={schemaVersion:1,layoutRevision:2,settings:{name:'Ninaru 3D',whatsapp:'',announcement:''},products:[],blocks:[]}
  const rows=[['revision','parte','json'],[1,0,'~'+JSON.stringify(initial)]]
  const cache=new Map();let failFlush=false,reads=0
  const sheet={getLastRow:()=>rows.length,getMaxRows:()=>1000,insertRowsAfter:()=>{},getRange:(row,col,count,width)=>({getValues:()=>rows.slice(row-1,row-1+count).map(r=>r.slice(col-1,col-1+width)),setValues:(values)=>values.forEach((r,i)=>{rows[row-1+i]=r})})}
  const c=vm.createContext({console,PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},SpreadsheetApp:{openById:()=>{reads++;return{getSheetByName:()=>sheet}},flush:()=>{if(failFlush)throw Error('Transient failure')}},CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v),remove:k=>cache.delete(k)})},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},Utilities:{getUuid:()=> '12345678-1234-1234-1234-123456789abc'},ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>s})}})
  vm.runInContext(code,c)
  return {c,props,cache,rows,initial,setFail:()=>{failFlush=true},reads:()=>reads}
}
test('Apps Script rejects unauthenticated writes before reading or mutating the catalog',()=>{const h=harness();const result=JSON.parse(h.c.doPost({postData:{contents:JSON.stringify({store:'ninaru3d',action:'save',token:'bad',data:h.initial,version:1})}}));assert.equal(result.code,'AUTH');assert.equal(h.reads(),0);assert.equal(h.rows.length,2)})
test('other store identifiers fail closed',()=>{const h=harness();const result=JSON.parse(h.c.doPost({postData:{contents:JSON.stringify({store:'etm',action:'login',key:'a'.repeat(64)})}}));assert.equal(result.code,'STORE');assert.equal(h.reads(),0)})
test('public catalog omits drafts and hidden sections',()=>{const h=harness();const data={...h.initial,products:[{id:'p',status:'published'},{id:'d',status:'draft'}],blocks:[{id:'yes',visible:true},{id:'no',visible:false}]};const result=h.c.publicData_(data);assert.deepEqual(Array.from(result.products,p=>p.id),['p']);assert.deepEqual(Array.from(result.blocks,b=>b.id),['yes'])})
test('conflict does not append a snapshot',()=>{const h=harness();assert.throws(()=>h.c.save_({data:h.initial,version:0}),e=>e.code==='CONFLICT');assert.equal(h.rows.length,2)})
test('failed snapshot write retains active revision; retry remains readable',()=>{const h=harness();h.setFail();assert.throws(()=>h.c.save_({data:h.initial,version:1}));assert.equal(JSON.parse(h.props.get('ACTIVE')).version,1);assert.equal(h.c.readSnapshot_().version,1)})
test('successful save appends literal chunks and advances version',()=>{const h=harness();const next={...h.initial,settings:{...h.initial.settings,announcement:'=IMPORTXML("untrusted")'}};const result=h.c.save_({data:next,version:1});assert.equal(result.version,2);assert.equal(h.rows[2][2][0],'~');assert.equal(h.c.readSnapshot_().data.settings.announcement,next.settings.announcement)})
test('login rejects invalid key and returns a limited server session for valid key',()=>{const h=harness();assert.throws(()=>h.c.login_('incorrect'),e=>e.code==='AUTH');const login=h.c.login_('a'.repeat(64));assert.equal(login.token.length,64);assert.equal(h.cache.get('session:'+login.token),'ninaru');h.c.authenticate_(login.token)})
test('server rejects unsafe links and inline image persistence',()=>{const h=harness();assert.throws(()=>h.c.safeLink_('javascript:alert(1)'),e=>e.code==='VALIDATION');assert.throws(()=>h.c.imageRef_('data:image/png;base64,AAAA'),e=>e.code==='VALIDATION');h.c.imageRef_('drive:test-image');h.c.imageRef_('/brand/ninaru-brandboard.png')})
