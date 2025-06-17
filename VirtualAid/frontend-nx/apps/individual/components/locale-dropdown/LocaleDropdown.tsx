import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Direction } from '@mui/system/createTheme';

import styled, { createGlobalStyle } from 'styled-components';
import { useTranslation } from 'react-i18next';

// Global style for the body element to apply direction dynamically
const GlobalStyle = createGlobalStyle<{ direction: Direction | undefined }>`
  body,html {
    direction: ${(props) => props.direction || 'ltr'}; // Set the direction using dynamic props
  }
`;
const LocaleDropdown = () => {
  const [currentLocale, setCurrentLocale] = useState('');
  const [direction, setDirection] = useState<Direction | undefined>('ltr'); // Correctly typing direction
  const router = useRouter();

  const { pathname, asPath, query } = router;
  const { t, ready } = useTranslation(['common']);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (router.isReady) {
      setCurrentLocale(router.locale || '');
      // Determine direction based on locale
      const selectedLocale = router.locale
      if (router.locale === 'ar') {
        setDirection('rtl');
        document.documentElement.setAttribute('lang', selectedLocale as string);
        document.documentElement.dir = "rtl";
        document.body.classList.add('rtl-dir');
        
      } else {
        setDirection('ltr');
        document.documentElement.setAttribute('lang', selectedLocale as string);
        document.documentElement.dir = "ltr";
        document.body.classList.remove('rtl-dir');
      }
    }

  }, [router.isReady, router.locale]);

  const localeToLanguageMapper = (locale: string) => {
    
    switch (locale) {
      case 'nl':
        return 'Dutch';
      case 'en':
        return 'English';
      case 'ar':
        return 'Arabic';
      case 'uk':
        return 'Ukrainian';
      case 'de':
        return 'German'
      default:
        return locale;
    }
  };
  //handle local change dropdown
  //@param: event used to select event on select change event 
  const handleLocaleChange = (event: SelectChangeEvent) => {
    setCurrentLocale(event.target.value as string);
    router.push({ pathname, query }, asPath, {
      locale: event.target.value,
    });
  };

  return (
    <>
      <GlobalStyle direction={direction}/>
      {router && currentLocale && (
        <><label style={{fontWeight: 'bold', marginTop: '20px', display: 'block'}}>{t('selectLanguageText')}</label><Select id="demo-customized-select" value={currentLocale} fullWidth onChange={handleLocaleChange} inputRef={selectRef} MenuProps={{
          PaperProps: {
            style: {
              width: selectRef.current ? selectRef.current.clientWidth : undefined,
            },
          },
        }}>
          {router.locales?.map((item, index) => (

            <MenuItem value={item} key={index}>
              {localeToLanguageMapper(item)}
            </MenuItem>
          ))}
        </Select></>
      )}
    </>
  );
};

export default LocaleDropdown;
