import { useState } from 'react'
import type { BannerSlide, HomeBlock, ImageAsset } from '../domain/catalog'
import { prepareCustom, prepareHero } from '../data/homeLayout'
import { AssetImage } from '../components/AssetImage'

type Props={block:HomeBlock;update:(b:HomeBlock)=>void;readImage:(f:File)=>Promise<string>}
function Text({label,value,onChange,area=false}:{label:string;value:string;onChange:(s:string)=>void;area?:boolean}) { return <label>{label}{area?<textarea value={value} onChange={e=>onChange(e.target.value)}/>:<input value={value} onChange={e=>onChange(e.target.value)}/>}</label> }
function Upload({label,value,onChange,readImage}:{label:string;value:string;onChange:(s:string)=>void;readImage:Props['readImage']}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  return <div className="slide-upload"><label>{label}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async e=>{const input=e.currentTarget,file=input.files?.[0];if(!file)return;setBusy(true);setError('');try{onChange(await readImage(file))}catch(err){setError(err instanceof Error?err.message:'No se pudo cargar la imagen')}finally{setBusy(false);input.value=''}}}/></label>{busy&&<p role="status">Preparando imagen…</p>}{error&&<p role="alert">{error}</p>}{value&&<><AssetImage className="banner-preview" src={value} alt="Vista previa de la imagen"/><button onClick={()=>onChange('')}>Quitar imagen</button></>}</div>
}
export function BannerEditor({block,update,readImage}:Props) {
  const [active,setActive]=useState(0)
  if(block.type==='hero'){
    const prepared=prepareHero(block), slides=prepared.slides!,slide=slides[active]
    const change=(patch:Partial<BannerSlide>)=>update({...prepared,slides:slides.map((s,i)=>i===active?{...s,...patch}:s) as typeof slides})
    return <div className="banner-editor"><h3>Carrusel principal · 3 tarjetas</h3><p className="muted">Cada tarjeta conserva su texto, botón e imágenes. La tercera está destinada a promociones.</p><div className="editor-tabs" role="group" aria-label="Tarjetas del banner">{['1 · Maquillaje','2 · Impresión 3D','3 · Promociones'].map((label,i)=><button key={label} aria-pressed={i===active} className={i===active?'selected':''} onClick={()=>setActive(i)}>{label}</button>)}</div><Text label={`Título tarjeta ${active+1}`} value={slide.title} area onChange={title=>change({title})}/><Text label={`Texto tarjeta ${active+1}`} value={slide.text} area onChange={text=>change({text})}/><div className="form-grid"><Text label="Texto del botón" value={slide.label} onChange={label=>change({label})}/><Text label="Destino del botón (vacío para ocultarlo)" value={slide.href} onChange={href=>change({href})}/></div><Text label="Descripción de imagen" value={slide.alt} onChange={alt=>change({alt})}/><Upload key={`desktop-${active}`} label="Imagen de escritorio" value={slide.image} onChange={image=>change({image})} readImage={readImage}/><Upload key={`mobile-${active}`} label="Imagen de celular (opcional)" value={slide.mobileImage} onChange={mobileImage=>change({mobileImage})} readImage={readImage}/></div>
  }
  const prepared=prepareCustom(block),gallery=prepared.gallery!,item=gallery[active]
  const change=(patch:Partial<ImageAsset>)=>update({...prepared,gallery:gallery.map((g,i)=>i===active?{...g,...patch}:g) as typeof gallery})
  return <div className="banner-editor"><h3>Contacto para impresión personalizada</h3><Text label="Texto del botón de WhatsApp" value={block.label} onChange={label=>update({...prepared,label})}/><Text label="Mensaje inicial de WhatsApp" area value={prepared.whatsappMessage||''} onChange={whatsappMessage=>update({...prepared,whatsappMessage})}/><p className="muted">Usa el número guardado en Configuración. El botón no se activa si falta el número.</p><h3>Carrusel de imágenes · 3 espacios</h3><div className="editor-tabs" role="group" aria-label="Imágenes de personalización">{[0,1,2].map(i=><button key={i} className={i===active?'selected':''} aria-pressed={i===active} onClick={()=>setActive(i)}>Imagen {i+1}</button>)}</div><Text label={`Descripción imagen ${active+1}`} value={item.alt} onChange={alt=>change({alt})}/><Upload key={`custom-${active}`} label={`Imagen personalizada ${active+1}`} value={item.url} onChange={url=>change({url})} readImage={readImage}/></div>
}
