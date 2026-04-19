import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  // Obtener idioma de las cookies o usar inglés por defecto
  const cookieStore = await cookies()
  let locale = cookieStore.get('locale')?.value || 'en'
  
  // Validar que el idioma es soportado
  const supportedLocales = ['en', 'es', 'fr', 'it', 'pt']
  if (!supportedLocales.includes(locale)) {
    locale = 'en'
  }
  
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})