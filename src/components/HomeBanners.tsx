import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { HomeBlock } from '../domain/catalog'
import { safeHref } from '../domain/helpers'
import { prepareCustom, prepareHero } from '../data/homeLayout'
import { useAsset } from './AssetImage'
import { useBannerMotion } from './useBannerMotion'

function Controls({ active, change, label }: { active: number; change: (i:number)=>void; label: string }) {
  return <div className="slide-controls" role="group" aria-label={label}>
    <button aria-label={`${label}: anterior`} onClick={()=>change((active+2)%3)}>←</button>
    <div className="slide-dots">{[0,1,2].map(i=><button key={i} aria-label={`${label}: ${i+1} de 3`} aria-pressed={active===i} onClick={()=>change(i)}><span /></button>)}</div>
    <span className="slide-count" aria-live="polite">{active+1} / 3</span>
    <button aria-label={`${label}: siguiente`} onClick={()=>change((active+1)%3)}>→</button>
  </div>
}
function Art({ image, mobileImage, alt, fallback }: {image:string;mobileImage?:string;alt:string;fallback?:boolean}) {
  const [failed,setFailed]=useState(false)
  const resolved=useAsset(image), mobileResolved=useAsset(mobileImage||image)
  return image&&!failed ? <picture className={image.startsWith('/brand/mascot-')?'mascot-picture':''}><source media="(max-width:600px)" srcSet={mobileResolved||resolved||undefined}/><img src={resolved||undefined} alt={alt} onError={()=>setFailed(true)}/></picture> : <div className="banner-type">{fallback?<><span className="brand-emblem" aria-hidden="true"/><span className="brand-motto">Beauty meets<br/>3D creativity</span></>:<span className="missing-art">Imagen pendiente</span>}</div>
}
export function HeroBanner({block}:{block:HomeBlock}) {
  const motion=useBannerMotion(3)
  const {active}=motion
  const slides=prepareHero(block).slides!
  const slide=slides[active]
  return <section className="hero-carousel" {...motion.events} aria-roledescription="carrusel" aria-label="Novedades Ninaru 3D">
    <div key={active} className={`hero hero-slide hero-slide-${active}`} role="group" aria-roledescription="tarjeta" aria-label={`${active+1} de 3`}>
      <div className="banner-copy"><p className="eyebrow">{['MAQUILLAJE A TU MANERA','CREATIVIDAD EN TRES DIMENSIONES','NOVEDADES Y PROMOCIONES'][active]}</p><h2>{slide.title}</h2>{slide.text&&<p>{slide.text}</p>}{safeHref(slide.href)&&<Link className="button" to={safeHref(slide.href)}>{slide.label||'Explorar'} <span>↗</span></Link>}</div>
      <Art key={`${active}-${slide.image}-${slide.mobileImage}`} image={slide.image} mobileImage={slide.mobileImage} alt={slide.alt} fallback={active===0}/>
    </div>
    <Controls active={active} change={motion.change} label="Banner principal"/>{!motion.reduced&&<button className="motion-toggle" onClick={motion.toggle}>{motion.paused?"Reanudar banners":"Pausar banners"}</button>}
  </section>
}
export function CustomBanner({block,phone}:{block:HomeBlock;phone:string}) {
  const motion=useBannerMotion(3)
  const {active}=motion
  const prepared=prepareCustom(block), image=prepared.gallery![active]
  const href=/^\d{10,15}$/.test(phone)?`https://wa.me/${phone}?text=${encodeURIComponent(prepared.whatsappMessage!)}`:null
  return <section className="banner custom-banner">
    <div className="banner-copy"><p className="eyebrow">IMPRESIONES 3D PERSONALIZADAS</p><h2>{block.title}</h2><p>{block.text}</p>{href?<a className="button" href={href} target="_blank" rel="noreferrer">{block.label||'Cotizar por WhatsApp'} ↗</a>:<><button className="button" disabled>{block.label||'Cotizar por WhatsApp'}</button><p className="contact-pending">WhatsApp pendiente de configurar.</p></>}</div>
    <div className="custom-gallery" {...motion.events} aria-roledescription="carrusel" aria-label="Ideas de impresión personalizada"><div key={active} className="custom-gallery-image"><Art key={image.url} image={image.url} alt={image.alt}/></div><p className="gallery-caption">{image.alt}</p><Controls active={active} change={motion.change} label="Imágenes de personalización"/>{!motion.reduced&&<button className="motion-toggle" onClick={motion.toggle}>{motion.paused?"Reanudar imágenes":"Pausar imágenes"}</button>}</div>
  </section>
}
