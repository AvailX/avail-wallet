import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLanguage } from './services/storage/persistent';

// Import translation files
import translationEN from '../public/locales/en/translation.json';
import translationDE from '../public/locales/de/translation.json';
import translationES from '../public/locales/es/translation.json';
import translationET from '../public/locales/et/translation.json';
import translationIT from '../public/locales/it/translation.json';
import translationJA from '../public/locales/ja/translation.json';
import translationLT from '../public/locales/lt/translation.json';
import translationLV from '../public/locales/lv/translation.json';
import translationNL from '../public/locales/nl/translation.json';
import translationRU from '../public/locales/ru/translation.json';
import translationTR from '../public/locales/tr/translation.json';
import translationZH_CN from '../public/locales/zh-CN/translation.json';
import translationZH_TW from '../public/locales/zh-TW/translation.json';


// Define your resources type for TypeScript
type Resources = {
    en: {
        translation: typeof translationEN;
    },
    de: {
        translation: typeof translationDE;
    },
    es: {
        translation: typeof translationES;
    },
    et: {
        translation: typeof translationET;
    },
    it: {
        translation: typeof translationIT;
    },
    ja: {
        translation: typeof translationJA;
    },
    lt: {
        translation: typeof translationLT;
    },
    lv: {
        translation: typeof translationLV;
    },
    nl: {
        translation: typeof translationNL;
    },
    ru: {
        translation: typeof translationRU;
    },
    tr: {
        translation: typeof translationTR;
    },
    zh_cn: {
        translation: typeof translationZH_CN;
    },
    zh_tw: {
        translation: typeof translationZH_TW;
    },

};

const resources: Resources = {
    en: {
        translation: translationEN,
    },
    de: {
        translation: translationDE,
    },
    es: {
        translation: translationES,
    },
    et: {
        translation: translationET,
    },
    it: {
        translation: translationIT,
    },
    ja: {
        translation: translationJA,
    },
    lt: {
        translation: translationLT,
    },
    lv: {
        translation: translationLV,
    },
    nl: {
        translation: translationNL,
    },
    ru: {
        translation: translationRU,
    },
    tr: {
        translation: translationTR,
    },
    zh_cn: {
        translation: translationZH_CN,
    },
    zh_tw: {
        translation: translationZH_TW,
    },
};



i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: true, // Set to false in production
        lng: "en", // if you're using a language detector, this is not needed
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
