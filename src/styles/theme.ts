import { createTheme, responsiveFontSizes } from '@mui/material';
import { red, blue, green } from '@mui/material/colors';

export const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInput-underline:before': {
            borderBottomColor: 'white', // Inactive state border color
          },
          '& .MuiInput-underline:after': {
            borderBottomColor: 'white', // Active state border color
          },
          '& .Mui-focused .MuiInput-underline:after': {
            borderBottomColor: 'white', // Active state border color (focused)
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'inherit',
        },
        outlined: {
          border: '1px solid #7000FF',
          color: '#7000FF',
          textTransform: 'inherit',
          fontWeight: 500,
        },
      },
    },
  },

  palette: {
    primary: {
      main: '#43ecd4',
    },
    secondary: {
      main: '#8F41D2',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#0F1A2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#00FFAA',
    },
  },
  typography: {
    fontFamily: ['DM Sans', 'sans-serif', 'Arial'].join(','),
  },
});
