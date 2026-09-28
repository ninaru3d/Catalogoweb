import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { StoreData } from '../domain/catalog'
import { seed } from './seed'
import { migrateHome } from './homeLayout'
import { googleConfigured, loadCatalog, loginScript, logoutScript, saveCatalog, uploadImage } from './googleScript'
const key='tienda-catalogo-demo-v1'
const empty:StoreData={schemaVersion:1,layoutRevision:2,settings:{name:'Ninaru 3D',whatsapp:'',announcement:''},products:[],blocks:[]}
function localData():StoreData{try{const raw=localStorage.getItem(key);if(raw){const data=JSON.parse(raw);if(data.schemaVersion===1&&Array.isArray(data.products)&&Array.isArray(data.blocks)&&data.settings)return migrateHome({...data,settings:{...data.settings,name:data.settings.name==='Estudio'?'Ninaru 3D':data.settings.name}})}}catch{/* Recover invalid local demo data. */}return migrateHome(structuredClone(seed))}
type ContextValue={data:StoreData;remote:boolean;authenticated:boolean;loading:boolean;error:string;save:(next:StoreData)=>Promise<StoreData>;login:(key:string)=>Promise<void>;logout:()=>Promise<void>;upload:(dataUrl:string)=>Promise<string>;importLocal:()=>StoreData}
const Context=createContext<ContextValue>(null!)
export function StoreProvider({children}:{children:ReactNode}){
  const [data,setData]=useState<StoreData>(()=>googleConfigured?empty:localData()),[version,setVersion]=useState(0),[authenticated,setAuthenticated]=useState(false),[loading,setLoading]=useState(googleConfigured),[error,setError]=useState('')
  useEffect(()=>{if(!googleConfigured)return;let live=true;loadCatalog().then(r=>{if(live){setData(r.data);setVersion(r.version)}}).catch(e=>{if(live)setError(e.message)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[])
  // Refresh public visitors returning from another tab after the shop contact changes.
  // Never replace an authenticated administrator's working version or draft.
  useEffect(()=>{
    if(!googleConfigured||authenticated)return
    let live=true, pending=false
    async function refresh(){
      if(document.visibilityState!=='visible'||pending)return
      pending=true
      try{const r=await loadCatalog();if(live){setData(r.data);setVersion(r.version);setError('')}}
      catch{/* Keep the last successfully loaded catalog on a temporary network failure. */}
      finally{pending=false}
    }
    window.addEventListener('focus',refresh)
    document.addEventListener('visibilitychange',refresh)
    return()=>{live=false;window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh)}
  },[authenticated])
  async function save(next:StoreData){if(googleConfigured){if(!authenticated)throw Error('Inicia sesión para guardar.');const result=await saveCatalog(next,version);setData(result.data);setVersion(result.version);return result.data}localStorage.setItem(key,JSON.stringify(next));setData(next);return next}
  async function login(accessKey:string){const result=await loginScript(accessKey);setData(result.data);setVersion(result.version);setAuthenticated(true);setError('');setLoading(false)}
  async function logout(){try{await logoutScript()}finally{setAuthenticated(false);setData(empty);setLoading(true);try{const r=await loadCatalog();setData(r.data);setVersion(r.version)}catch(e){setError(e instanceof Error?e.message:'No se pudo cargar el catálogo')}finally{setLoading(false)}}}
  return <Context.Provider value={{data,remote:googleConfigured,authenticated,loading,error,save,login,logout,upload:googleConfigured?uploadImage:async s=>s,importLocal:localData}}>{children}</Context.Provider>
}
export const useStore=()=>useContext(Context)
