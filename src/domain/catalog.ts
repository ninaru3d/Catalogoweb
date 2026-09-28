export const categories = [
  { id: 'maquillaje', name: 'Maquillaje' },
  { id: 'impresion-3d', name: 'Impresión 3D' },
] as const
export type CategoryId = typeof categories[number]['id']
export type ImageAsset = { id: string; url: string; alt: string; order: number }
export type Variant = {
  id: string; attributes: Record<string, string>; priceCents: number | null;
  availability: 'available' | 'made-to-order' | 'unavailable'
}
export type Product = {
  id: string; slug: string; categoryId: CategoryId; name: string; description: string;
  status: 'draft' | 'published' | 'inactive'; images: ImageAsset[]; variants: Variant[];
  order: number; personalizationAllowed: boolean; leadTime?: string; relatedIds: string[];
  version: number
}
export type BannerSlide = { id: string; title: string; text: string; label: string; href: string; image: string; mobileImage: string; alt: string }
export type HomeBlock = { id: string; type: 'hero' | 'banner' | 'product-carousel' | 'cards'; order: number; visible: boolean; title: string; text: string; label: string; href: string; image: string; mobileImage: string; categoryId: CategoryId | ''; productIds: string[]; cards: { title: string; text: string; href: string; productId: string }[]; slides?: [BannerSlide, BannerSlide, BannerSlide]; gallery?: [ImageAsset, ImageAsset, ImageAsset]; whatsappMessage?: string }
export type StoreData = { schemaVersion: 1; layoutRevision?: 2; settings: { name: string; whatsapp: string; announcement: string }; products: Product[]; blocks: HomeBlock[] }
export interface CatalogRepository {
  listProducts(): Promise<Product[]>
  listHomeBlocks(): Promise<HomeBlock[]>
}
