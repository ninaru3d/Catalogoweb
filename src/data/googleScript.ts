import type { StoreData } from '../domain/catalog'
const url = (import.meta.env.VITE_GOOGLE_SCRIPT_URL || '').trim()
export const googleConfigured = !!url
let token = ''
let verified = false
const imageCache = new Map<string, string>()
const imageRequests = new Map<string, Promise<string>>()
type Reply = { ok: boolean; store: string; message?: string; code?: string; data: StoreData; version: number; token?: string; dataUrl?: string; ref?: string }
export class ScriptError extends Error { code: string; constructor(message: string,code='ERROR'){super(message);this.code=code} }
async function request(action: string, body?: Record<string,unknown>): Promise<Reply> {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)) throw new Error('Configura la URL /exec del Apps Script exclusivo de Ninaru.')
  let response: Response
  try { response = await fetch(body ? url : `${url}?action=${encodeURIComponent(action)}`, body ? { method:'POST', redirect:'follow', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({store:'ninaru3d',action,token,...body}), signal:AbortSignal.timeout(60000) } : {redirect:'follow',signal:AbortSignal.timeout(60000)}) } catch { throw new Error('No se pudo contactar con Google. Revisa tu conexión y el despliegue de Apps Script.') }
  let result:Reply
  try {result=await response.json()} catch {throw new Error('Google no devolvió datos. Verifica la URL /exec y el acceso de la implementación.')}
  if (result.store!=='ninaru3d') throw new Error('Este script no pertenece a Ninaru 3D. No se usará.')
  if(!response.ok||!result.ok)throw new ScriptError(result.message||'No se pudo completar la operación.',result.code)
  return result
}
export async function loadCatalog(){const result=await request('catalog');verified=true;return result}
export async function loginScript(key:string){if(!verified)await loadCatalog();const result=await request('login',{key});if(!result.token)throw new Error('Sesión inválida.');token=result.token;return result}
export async function logoutScript(){try{await request('logout',{})}finally{token='';imageCache.clear();imageRequests.clear()}}
export async function saveCatalog(data:StoreData,version:number){return request('save',{data,version})}
export async function uploadImage(dataUrl:string){const result=await request('upload',{dataUrl});if(!result.ref)throw new Error('La imagen no fue guardada.');imageCache.set(result.ref,dataUrl);return result.ref}
export async function resolveImage(ref:string):Promise<string>{
  if(!ref.startsWith('drive:'))return ref
  if(imageCache.has(ref))return imageCache.get(ref)!
  if(imageRequests.has(ref))return imageRequests.get(ref)!
  // Public image reads also use POST when authenticated; private drafts never use public endpoints.
  const pending=(async()=>{
    let result:Reply
    if(token)result=await request('image',{id:ref.slice(6)})
    else {
      const response=await fetch(`${url}?action=image&id=${encodeURIComponent(ref.slice(6))}`,{signal:AbortSignal.timeout(60000)})
      result=await response.json()
      if(!result.ok||result.store!=='ninaru3d')throw new Error('Imagen no disponible.')
    }
    if(!result.dataUrl?.startsWith('data:image/'))throw new Error('Imagen inválida.')
    imageCache.set(ref,result.dataUrl);return result.dataUrl
  })()
  imageRequests.set(ref,pending)
  try{return await pending}finally{imageRequests.delete(ref)}
}
