import 'react-i18next'
import ptBR from '../locales/pt-BR.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof ptBR
    }
  }
}
