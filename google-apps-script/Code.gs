/* Ninaru 3D only. Deploy as the owner; install in a NEW Apps Script project. */
var STORE = 'ninaru3d';
var OWNER = 'ninaru3d@gmail.com';
var FOLDER = '1eGRyKqQ4x3waWR2mK4iuESxvJLIMTUHM';
var MAX_BYTES = 500000;

function setupNinaru() {
  if (Session.getEffectiveUser().getEmail().toLowerCase() !== OWNER) throw Error('Usa exclusivamente la cuenta ' + OWNER);
  var props = PropertiesService.getScriptProperties();
  var folder = DriveApp.getFolderById(FOLDER);
  if (folder.getOwner().getEmail().toLowerCase() !== OWNER) throw Error('La carpeta no pertenece a Ninaru.');
  if (props.getProperty('STORE_ID') && props.getProperty('STORE_ID') !== STORE) throw Error('Proyecto de otra tienda. No continuar.');
  props.setProperty('STORE_ID', STORE);
  props.setProperty('FOLDER_ID', FOLDER);
  if (!props.getProperty('SHEET_ID')) {
    var sheet = SpreadsheetApp.create('Ninaru 3D — Catálogo');
    DriveApp.getFileById(sheet.getId()).moveTo(folder);
    sheet.getSheets()[0].setName('Catalogo');
    sheet.getSheetByName('Catalogo').appendRow(['revision', 'parte', 'JSON (administrado por la tienda; no editar)']);
    sheet.insertSheet('Pedidos').appendRow(['ID','Fecha','Cliente','Contacto','Productos','Total acordado MXN','Estado','Notas']);
    props.setProperty('SHEET_ID', sheet.getId());
  }
  if (!props.getProperty('MEDIA_FOLDER_ID')) props.setProperty('MEDIA_FOLDER_ID', folder.createFolder('Ninaru — Imágenes').getId());
  if (!props.getProperty('ADMIN_KEY')) props.setProperty('ADMIN_KEY', Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,''));
  if (!props.getProperty('ACTIVE')) {
    var initial = {schemaVersion:1,layoutRevision:2,settings:{name:'Ninaru 3D',whatsapp:'',announcement:'Maquillaje e impresión 3D · Envíos por cotizar'},products:[],blocks:[]};
    appendSnapshot_(initial, 1);
  }
  console.log('Ninaru preparado. Sheet: https://docs.google.com/spreadsheets/d/' + props.getProperty('SHEET_ID'));
  // ADMIN_KEY is intentionally never logged. View it in Script properties yourself.
}

function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function result_(fn) { try { configured_(); return json_({ok:true,store:STORE,...fn()}); } catch(e) { return json_({ok:false,store:STORE,code:e.code||'ERROR',message:e.publicMessage||'No se pudo completar la operación. Revisa la configuración de Ninaru.'}); } }
function fail_(code, message) { var e = Error(message); e.code=code; e.publicMessage=message; throw e; }
function configured_() { var p=PropertiesService.getScriptProperties(); if(p.getProperty('STORE_ID')!==STORE||p.getProperty('FOLDER_ID')!==FOLDER||!p.getProperty('ACTIVE'))fail_('SETUP','Ejecuta setupNinaru en el proyecto nuevo.'); }
function doGet(e) { return result_(function(){ var action=(e.parameter||{}).action||'catalog'; if(action==='catalog'){var snapshot=readSnapshot_();return {version:snapshot.version,data:publicData_(snapshot.data)};} if(action==='image')return image_((e.parameter||{}).id,false);fail_('ACTION','Operación no disponible.'); }); }
function doPost(e) { return result_(function(){ var raw=e.postData&&e.postData.contents||'';if(raw.length>2500000)fail_('SIZE','Solicitud demasiado grande.');var request;try{request=JSON.parse(raw);}catch(_){fail_('FORMAT','Solicitud inválida.');}if(request.store!==STORE)fail_('STORE','La solicitud no pertenece a Ninaru.');if(request.action==='login')return login_(request.key);authenticate_(request.token);if(request.action==='logout'){CacheService.getScriptCache().remove('session:'+request.token);return {};}if(request.action==='admin'){return readSnapshot_();}if(request.action==='image')return image_(request.id,true);if(request.action==='upload')return upload_(request);if(request.action==='save')return save_(request);fail_('ACTION','Operación no disponible.'); }); }
function constantEqual_(a,b){a=String(a||'');b=String(b||'');var diff=a.length^b.length;for(var i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
function login_(key) {
  var lock=LockService.getScriptLock();if(!lock.tryLock(10000))fail_('BUSY','Intenta nuevamente en unos segundos.');
  try{var cache=CacheService.getScriptCache(),count=Number(cache.get('login-window')||0);if(count>=20)fail_('RATE','Demasiados intentos. Espera un minuto.');cache.put('login-window',String(count+1),60);}finally{lock.releaseLock();}
  if(!constantEqual_(key,PropertiesService.getScriptProperties().getProperty('ADMIN_KEY')))fail_('AUTH','Clave incorrecta.');
  var token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');CacheService.getScriptCache().put('session:'+token,'ninaru',3600);
  return {token:token,...readSnapshot_()};
}
function authenticate_(token){if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||CacheService.getScriptCache().get('session:'+token)!=='ninaru')fail_('AUTH','La sesión venció. Ingresa de nuevo.');}
function appendSnapshot_(data,version){var props=PropertiesService.getScriptProperties(),sheet=SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName('Catalogo'),raw=JSON.stringify(data),rows=[];for(var i=0;i<raw.length;i+=35000)rows.push([version,rows.length,'~'+raw.slice(i,i+35000)]);var start=sheet.getLastRow()+1;if(sheet.getMaxRows()<start+rows.length)sheet.insertRowsAfter(sheet.getMaxRows(),start+rows.length-sheet.getMaxRows());sheet.getRange(start,1,rows.length,3).setValues(rows);SpreadsheetApp.flush();props.setProperty('ACTIVE',JSON.stringify({version:version,row:start,count:rows.length}));}
// Leading ~ forces Sheets to treat every JSON chunk as literal text (never a formula).
function readSnapshot_(){var props=PropertiesService.getScriptProperties(),active=JSON.parse(props.getProperty('ACTIVE'));var rows=SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName('Catalogo').getRange(active.row,3,active.count,1).getValues();return {version:active.version,data:JSON.parse(rows.map(function(r){return String(r[0]).slice(1);}).join(''))};}
function publicData_(data){var copy=JSON.parse(JSON.stringify(data));copy.products=copy.products.filter(function(p){return p.status==='published';});copy.blocks=copy.blocks.filter(function(b){return b.visible;});return copy;}

function text_(v,max){if(typeof v!=='string'||v.length>max)fail_('VALIDATION','Texto inválido o demasiado largo.');return v;}
function safeLink_(v){text_(v,2000);if(v&&!/^\/(?!\/)/.test(v)&&!/^https:\/\//.test(v))fail_('VALIDATION','Enlace inválido.');}
function imageRef_(v){text_(v,2000);if(v&&!/^\/brand\/[\w.-]+$/.test(v)&&!/^drive:[\w-]+$/.test(v))fail_('VALIDATION','Carga las imágenes desde el administrador.');}
function validate_(data){
  if(!data||data.schemaVersion!==1||data.layoutRevision!==2||!Array.isArray(data.products)||!Array.isArray(data.blocks)||data.products.length>500||data.blocks.length>40)fail_('VALIDATION','Catálogo inválido (máximo 500 productos y 40 bloques).');
  text_(data.settings.name,120);text_(data.settings.announcement,300);if(!data.settings.name.trim()||!/^(|\d{10,15})$/.test(data.settings.whatsapp))fail_('VALIDATION','Revisa nombre y WhatsApp.');
  var ids={},slugs={};data.products.forEach(function(p){text_(p.id,100);text_(p.slug,150);text_(p.name,200);text_(p.description,10000);if(!p.name.trim()||!p.id||ids[p.id]||slugs[p.slug]||!/^[-a-z0-9]+$/.test(p.slug)||['maquillaje','impresion-3d'].indexOf(p.categoryId)<0||['draft','published','inactive'].indexOf(p.status)<0)fail_('VALIDATION','Producto o URL inválidos/repetidos.');ids[p.id]=true;slugs[p.slug]=true;if(!Array.isArray(p.variants)||!p.variants.length||p.variants.length>100||!Array.isArray(p.images)||p.images.length>12)fail_('VALIDATION','Revisa variantes e imágenes.');var combos={};p.variants.forEach(function(v){text_(v.id,100);var keys=Object.keys(v.attributes||{}).sort();if(!keys.length||keys.length>8||keys.some(function(k){return !k.trim()||!text_(v.attributes[k],100).trim();})||['available','made-to-order','unavailable'].indexOf(v.availability)<0||!(v.priceCents===null||Number.isSafeInteger(v.priceCents)&&v.priceCents>=0))fail_('VALIDATION','Variante inválida.');var combo=JSON.stringify(keys.map(function(k){return [k,v.attributes[k]];}));if(combos[combo])fail_('VALIDATION','Variante repetida.');combos[combo]=true;});p.images.forEach(function(i){imageRef_(i.url);text_(i.alt,500);});if(!Array.isArray(p.relatedIds)||p.relatedIds.length>500)fail_('VALIDATION','Relacionados inválidos.');});
  var blockIds={};data.blocks.forEach(function(b){text_(b.id,100);if(blockIds[b.id]||['hero','banner','product-carousel','cards'].indexOf(b.type)<0||typeof b.visible!=='boolean')fail_('VALIDATION','Bloque inválido.');blockIds[b.id]=true;text_(b.title,300);text_(b.text,3000);text_(b.label,100);safeLink_(b.href);imageRef_(b.image);imageRef_(b.mobileImage);if(!Array.isArray(b.cards)||b.cards.length>20||!Array.isArray(b.productIds)||b.productIds.length>500)fail_('VALIDATION','Contenido de bloque inválido.');b.cards.forEach(function(c){text_(c.title,300);text_(c.text,2000);safeLink_(c.href);});if(b.type==='hero'){if(!b.slides||b.slides.length!==3)fail_('VALIDATION','El banner necesita tres tarjetas.');b.slides.forEach(function(s){text_(s.title,300);text_(s.text,3000);text_(s.label,100);text_(s.alt,500);safeLink_(s.href);imageRef_(s.image);imageRef_(s.mobileImage);});}if(b.type==='banner'){if(!b.gallery||b.gallery.length!==3)fail_('VALIDATION','Se requieren tres imágenes.');b.gallery.forEach(function(i){imageRef_(i.url);text_(i.alt,500);});text_(b.whatsappMessage||'',1500);}});
  if(JSON.stringify(data).length>1500000)fail_('SIZE','Catálogo demasiado grande.');
}
function save_(request){validate_(request.data);var lock=LockService.getScriptLock();if(!lock.tryLock(10000))fail_('BUSY','Otra operación está en curso.');try{var current=readSnapshot_();if(request.version!==current.version)fail_('CONFLICT','El catálogo cambió en otra sesión. Respalda tus cambios y vuelve a cargar.');var version=current.version+1;appendSnapshot_(request.data,version);return {version:version,data:request.data};}finally{lock.releaseLock();}}
function upload_(request){if(typeof request.dataUrl!=='string'||request.dataUrl.length>700000)fail_('SIZE','Imagen demasiado grande.');var match=request.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);if(!match)fail_('IMAGE','Formato de imagen inválido.');var bytes=Utilities.base64Decode(match[2]);if(bytes.length>MAX_BYTES)fail_('SIZE','La imagen debe pesar menos de 500 KB.');var isPng=(bytes[0]&255)===137&&(bytes[1]&255)===80;var isJpg=(bytes[0]&255)===255&&(bytes[1]&255)===216;var isWebp=String.fromCharCode.apply(null,bytes.slice(0,4))==='RIFF'&&String.fromCharCode.apply(null,bytes.slice(8,12))==='WEBP';if(!(match[1]==='image/png'&&isPng||match[1]==='image/jpeg'&&isJpg||match[1]==='image/webp'&&isWebp))fail_('IMAGE','El archivo no coincide con su formato.');var ext=match[1].split('/')[1];var file=DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('MEDIA_FOLDER_ID')).createFile(Utilities.newBlob(bytes,match[1],'ninaru-'+Utilities.getUuid()+'.'+ext));return {ref:'drive:'+file.getId()};}
function collectRefs_(data){var refs={};function visit(v){if(typeof v==='string'&&/^drive:[\w-]+$/.test(v))refs[v.slice(6)]=true;else if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')Object.keys(v).forEach(function(k){visit(v[k]);});}visit(data);return refs;}
function image_(id,admin){if(typeof id!=='string'||!/^[-\w]+$/.test(id))fail_('IMAGE','Imagen inválida.');if(!admin&&!collectRefs_(publicData_(readSnapshot_().data))[id])fail_('NOT_FOUND','Imagen no publicada.');var file=DriveApp.getFileById(id),parents=file.getParents(),expected=PropertiesService.getScriptProperties().getProperty('MEDIA_FOLDER_ID'),allowed=false;while(parents.hasNext())if(parents.next().getId()===expected)allowed=true;if(!allowed||!/^image\/(png|jpeg|webp)$/.test(file.getMimeType())||file.getSize()>MAX_BYTES)fail_('IMAGE','Imagen no disponible.');return {dataUrl:'data:'+file.getMimeType()+';base64,'+Utilities.base64Encode(file.getBlob().getBytes())};}
