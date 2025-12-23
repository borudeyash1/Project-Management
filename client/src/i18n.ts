import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import mr from './locales/mr.json';
import hi from './locales/hi.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import da from './locales/da.json';
import nl from './locales/nl.json';
import fi from './locales/fi.json';
import no from './locales/no.json';
import sv from './locales/sv.json';

const resources = {
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
    mr: { translation: mr },
    hi: { translation: hi },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    pt: { translation: pt },
    da: { translation: da },
    nl: { translation: nl },
    fi: { translation: fi },
    no: { translation: no },
    sv: { translation: sv }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

// Last updated: 2025-12-21 04:42

export default i18n;
