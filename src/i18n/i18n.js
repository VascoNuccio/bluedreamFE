import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './translate/en.json';
import it from './translate/it.json';
import es from './translate/es.json';
import zh from './translate/zh.json';
import fr from './translate/fr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
      es: { translation: es },
      zh: { translation: zh },
      fr: { translation: fr },
    },
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
