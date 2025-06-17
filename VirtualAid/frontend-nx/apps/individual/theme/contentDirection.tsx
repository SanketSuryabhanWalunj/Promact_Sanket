import { ReactNode, useEffect } from 'react';

// import { Direction } from '@mui/material';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

import stylisRTLPlugin from 'stylis-plugin-rtl';
import { Direction } from '@mui/material/styles';

const styleCache = () =>
  createCache({
    key: 'rtl',
    prepend: true,
    stylisPlugins: [stylisRTLPlugin],
  });

type DirectionProps = {
  children: ReactNode;
  direction: Direction;
};

const ContentDirection = (props: DirectionProps) => {
  const { children, direction } = props;

  useEffect(() => {
    document.dir = direction;
  }, [direction]);

  if (direction === 'rtl') {
    return <CacheProvider value={styleCache()}>{children}</CacheProvider>;
  }

  return <>{children}</>;
};

export default ContentDirection;
