const baseUrl = import.meta.env.BASE_URL || './'

/** Resuelve una ruta dentro de /public respetando el base path del hosting. */
export function asset(path: string): string {
  return `${baseUrl}${path.replace(/^\/+/, '')}`
}
