import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { resolveImage } from '../data/googleScript'
export function useAsset(ref:string){const [source,setSource]=useState(ref.startsWith('drive:')?'':ref);useEffect(()=>{let live=true;setSource(ref.startsWith('drive:')?'':ref);if(ref.startsWith('drive:'))resolveImage(ref).then(s=>{if(live)setSource(s)}).catch(()=>{if(live)setSource('')});return()=>{live=false}},[ref]);return source}
export function AssetImage({src='',alt,...props}:ImgHTMLAttributes<HTMLImageElement>){const resolved=useAsset(src);return resolved?<img {...props} src={resolved} alt={alt}/>:<span className="asset-unavailable" role="img" aria-label={alt||'Imagen'}>Imagen en carga o no disponible</span>}
