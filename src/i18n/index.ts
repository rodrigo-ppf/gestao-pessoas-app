import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar os arquivos de tradução
import enUS from './locales/en-US.json';
import ptBR from './locales/pt-BR.json';

const resources = {
  'pt-BR': {
    translation: ptBR,
  },
  'en-US': {
    translation: enUS,
  },
};

// Detectar idioma do dispositivo
const getDeviceLanguage = () => {
  // Para o protótipo, vamos forçar português brasileiro
  // TODO: Implementar seleção de idioma pelo usuário
  return 'pt-BR';
  
  /*
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    const deviceLanguage = locales[0].languageCode;
    const deviceCountry = locales[0].countryCode;
    const fullLocale = `${deviceLanguage}-${deviceCountry}`;
    
    // Verificar se temos suporte para o idioma completo
    if (resources[fullLocale as keyof typeof resources]) {
      return fullLocale;
    }
    
    // Verificar se temos suporte para o idioma base
    if (resources[deviceLanguage as keyof typeof resources]) {
      return deviceLanguage;
    }
  }
  
  // Fallback para português brasileiro
  return 'pt-BR';
  */
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'pt-BR',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
