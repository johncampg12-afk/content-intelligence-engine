import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

// Importar mensajes estáticamente para evitar problemas con import dinámico
import enMessages from '../messages/en.json'
import esMessages from '../messages/es.json'
import frMessages from '../messages/fr.json'
import itMessages from '../messages/it.json'
import ptMessages from '../messages/pt.json'

const messagesMap: Record<string, any> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  it: itMessages,
  pt: ptMessages
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  let locale = cookieStore.get('locale')?.value || 'en'
  
  const supportedLocales = ['en', 'es', 'fr', 'it', 'pt']
  if (!supportedLocales.includes(locale)) {
    locale = 'en'
  }
  
  return {
    locale,
    messages: messagesMap[locale] || enMessages
  }
})