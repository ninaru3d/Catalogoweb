import type { HomeBlock, StoreData } from '../domain/catalog'

export const mascotIcons = ['/brand/mascot-makeup.png', '/brand/mascot-creation.png', '/brand/mascot-custom.png']
export function prepareHero(b: HomeBlock): HomeBlock {
  if (b.slides) return b
  return { ...b, slides: [
    { id: 'makeup', title: b.title, text: b.text, label: b.label || 'Explorar maquillaje', href: b.href || '/categoria/maquillaje', image: b.image, mobileImage: b.mobileImage, alt: 'Ninaru 3D: maquillaje' },
    { id: '3d', title: 'Ideas que toman\nforma contigo.', text: 'Objetos para tu espacio, detalles para regalar y posibilidades por descubrir.', label: 'Explorar impresión 3D', href: '/categoria/impresion-3d', image: mascotIcons[1], mobileImage: '', alt: 'Personaje Ninaru creando una pieza 3D' },
    { id: 'promotions', title: 'Algo especial\nte espera.', text: 'Descubre aquí nuestras novedades y próximas promociones.', label: '', href: '', image: mascotIcons[2], mobileImage: '', alt: 'Personaje Ninaru con un regalo. Espacio de promociones.' },
  ] }
}
export function prepareCustom(b: HomeBlock): HomeBlock {
  return { ...b, whatsappMessage: b.whatsappMessage ?? 'Hola, me gustaría cotizar una impresión 3D personalizada. Mi idea es: ', gallery: b.gallery ?? [
    { id: 'idea', url: mascotIcons[0], alt: 'Comparte tu idea: ilustración de Ninaru', order: 0 },
    { id: 'create', url: mascotIcons[1], alt: 'Damos forma a tu proyecto: ilustración de Ninaru', order: 1 },
    { id: 'gift', url: mascotIcons[2], alt: 'Un detalle hecho para ti: ilustración de Ninaru', order: 2 },
  ] }
}
// Idempotent migration: keeps existing products, images, section order and custom text.
export function migrateHome(data: StoreData): StoreData {
  if (data.layoutRevision === 2) return data
  let blocks = [...data.blocks].sort((a,b) => a.order-b.order).map(b => b.type === 'hero' ? prepareHero(b) : b.type === 'banner' ? prepareCustom({ ...b, label: 'Cotizar por WhatsApp', text: b.id === 'banner' ? '¿Tienes una idea en mente? Cuéntanos qué quieres crear y cotizamos tu impresión 3D personalizada.' : b.text }) : b)
  if (!blocks.some(b => b.type === 'product-carousel' && b.categoryId === 'impresion-3d')) {
    const index = blocks.findIndex(b => b.id === 'makeup')
    blocks.splice(index >= 0 ? index+1 : blocks.length, 0, { id: 'collection-3d', type: 'product-carousel', order: 0, visible: true, title: 'Impresiones con personalidad', text: 'Encuentra tu próxima pieza favorita.', label: '', href: '', image: '', mobileImage: '', categoryId: 'impresion-3d', productIds: [], cards: [] })
  }
  blocks = blocks.map((b,order) => ({ ...b, order }))
  return { ...data, layoutRevision: 2, blocks }
}
