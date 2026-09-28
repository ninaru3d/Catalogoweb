import { useEffect, useRef, useState } from 'react'
import type { Product } from '../domain/catalog'
import { AssetImage } from './AssetImage'

export function ProductGallery({product}:{product:Product}) {
  const images=[...product.images].sort((a,b)=>a.order-b.order)
  const [index,setIndex]=useState(0)
  const start=useRef<{x:number;y:number}|null>(null)
  const active=Math.min(index,Math.max(0,images.length-1))
  const change=(offset:number)=>setIndex((active+offset+images.length)%images.length)
  useEffect(()=>setIndex(0),[product.id])
  if(!images.length)return <div className="pdp-image"><div className={`image-empty ${product.categoryId}`}><strong>{product.name}</strong><small>Fotografía pendiente</small></div></div>
  return <section className="product-gallery" aria-label={`Imágenes de ${product.name}`} aria-roledescription="carrusel" onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();change(1)}if(e.key==='ArrowLeft'){e.preventDefault();change(-1)}}}>
    <div className="gallery-stage" tabIndex={0} aria-label="Galería: usa las flechas del teclado" onTouchStart={e=>{start.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchCancel={()=>{start.current=null}} onTouchEnd={e=>{const origin=start.current;start.current=null;if(!origin)return;const dx=e.changedTouches[0].clientX-origin.x,dy=e.changedTouches[0].clientY-origin.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))change(dx<0?1:-1)}}>
      <div className="pdp-image gallery-frame" key={images[active].id}><AssetImage src={images[active].url} alt={images[active].alt||product.name}/></div>
      {images.length>1&&<><button className="gallery-arrow previous" aria-label="Imagen anterior" onClick={()=>change(-1)}>←</button><button className="gallery-arrow next" aria-label="Imagen siguiente" onClick={()=>change(1)}>→</button></>}
      <span className="gallery-counter" aria-live="polite">{active+1} / {images.length}</span>
    </div>
    {images.length>1&&<div className="thumbnails" aria-label="Seleccionar fotografía">{images.map((img,i)=><button key={img.id} aria-label={`Ver imagen ${i+1}`} aria-pressed={active===i} onClick={()=>setIndex(i)}><AssetImage src={img.url} alt={img.alt||`Referencia ${i+1}`} loading="lazy"/></button>)}</div>}
  </section>
}
