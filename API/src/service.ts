import frData from './assets/french-formated.json';
import enData from './assets/english-formated.json';
import { Locale } from './types';

export const getWord = (locale: Locale): any => {
  if (locale === 'fr-FR') {
    const randomIndex = Math.floor(Math.random() * frData.length);
    return { word: frData[randomIndex] };
  }
  if (locale === 'en-GB' || !locale) {
    const randomIndex = Math.floor(Math.random() * enData.length);
    return { word: enData[randomIndex] };
  }
  return { error: 'The locale you provided does not exist' };
};
