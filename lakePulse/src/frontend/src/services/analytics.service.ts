import { APP_STRINGS } from '../constants/strings';
import ReactGA from 'react-ga4';

export const initGA = (measurementId: string) => {
  try {
    ReactGA.initialize(measurementId, {
      testMode: process.env.NODE_ENV !== 'production',
     
    });
  } catch (error) {
    console.warn(APP_STRINGS.ERROR_INITIALIZING_GA, error);
  }
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label
  });
};

export const logError = (error: Error, componentStack: string) => {
  ReactGA.event({
    category: 'Error',
    action: error.message,
    label: componentStack
  });
}; 