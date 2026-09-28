import type { CatalogRepository } from '../domain/catalog'
// Empty development adapter. Replace with the public server API once Google is connected.
// Never import Google credentials or private order records into this module.
export const catalogRepository: CatalogRepository = {
  async listProducts() { return [] },
  async listHomeBlocks() { return [] },
}
