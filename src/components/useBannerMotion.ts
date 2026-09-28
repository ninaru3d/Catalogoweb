import { useEffect, useState } from 'react'
export function useBannerMotion(count:number,delay=6000){
  const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[hover,setHover]=useState(false),[focused,setFocused]=useState(false),[reduced,setReduced]=useState(true)
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync)},[])
  useEffect(()=>{if(paused||hover||focused||reduced||count<2)return;const timer=setInterval(()=>{if(document.visibilityState==='visible')setActive(i=>(i+1)%count)},delay);return()=>clearInterval(timer)},[paused,hover,focused,reduced,count,delay])
  return {active,change:(i:number)=>{setActive(i);setPaused(true)},paused:paused||reduced,toggle:()=>setPaused(p=>!p),reduced,events:{onMouseEnter:()=>setHover(true),onMouseLeave:()=>setHover(false),onFocus:()=>setFocused(true),onBlur:(e:React.FocusEvent<HTMLElement>)=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}
}
}
