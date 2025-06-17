import { createTheme } from '@mui/material/styles';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gradient: true;
    'fandango-contained': true;
    'fandango-outlined': true;
  }
}

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#5C00A8',
      light: '#8E32CA',
      dark: '#470090',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          height: '50px',
          borderRadius: '10px',
          '& .MuiOutlinedInput-root:not(.Mui-focused):hover': {
            '& > fieldset.MuiOutlinedInput-notchedOutline': {
              borderColor: '#808080',
            },
          },
          '& .css-1urz1lp-MuiFormLabel-root-MuiInputLabel-root': {
            left: '5px',
            top: '-2px',
          },
          '& .css-1lkr5rz-MuiInputBase-input-MuiOutlinedInput-input': {
            borderRadius: '10px !important',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderRadius: '10px !important',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          height: '50px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // '&:not(.MuiIconButton-root)': {
          borderRadius: '25px',
          fontSize: '16px',
          textTransform: 'capitalize',
          minWidth: '120px',
          // },
        },
      },
      variants: [
        {
          props: { variant: 'gradient' },
          style: {
            background: 'linear-gradient(to right, #950c8d, #2e0162)',
            color: '#fff',
          },
        },
        {
          props: { variant: 'gradient', disabled: true },
          style: {
            background: 'linear-gradient(to right, #950c8d80, #2e015b80)',
          },
        },
        {
          props: { variant: 'fandango-contained' },
          style: {
            backgroundColor: '#9F1B96',
            borderRadius: '7px',
            color: '#fff',

            '&:hover': {
              backgroundColor: '#9F1B96',
            },
          },
        },
        {
          props: { variant: 'fandango-contained', disabled: true },
          style: {
            backgroundColor: '#fc2bee',
            borderRadius: '7px',
            color: '#fff',
          },
        },
        {
          props: { variant: 'fandango-outlined' },
          style: {
            backgroundColor: '#fff',
            borderRadius: '7px',
            color: '#9F1B96',
            border: '1px solid #9F1B96',
          },
        },
        {
          props: { variant: 'fandango-outlined', disabled: true },
          style: {
            backgroundColor: '#fff',
            borderRadius: '7px',
            color: '#fc2bee',
            border: '1px solid #fc2bee',
          },
        },
      ],
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-scroller': {
            borderBottom: '1px solid #ddd',
          },
        },
      },
    },
  },
});

export default customTheme;
