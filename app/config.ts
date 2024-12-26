export const dynamic = 'force-dynamic'
export const dynamicParams = true

export const revalidate = 0

// Diese Konfiguration verhindert das statische Generieren während des Builds
export const generateStaticParams = () => {
  return []
}
