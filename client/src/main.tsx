import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material'


const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Set the theme mode to dark
    primary: {
      main: '#1976d2', // Dark blue color for primary
    },
    secondary: {
      main: '#00bcd4', // Teal color for secondary
    },
    background: {
      default: '#121212', // Dark background for main area
      paper: '#1d1d1d', // Slightly lighter background for paper-like components
    },
    text: {
      primary: '#ffffff', // White text for readability
      secondary: '#b0b0b0', // Lighter grey for secondary text
    },
    error: {
      main: '#f44336', // Red for error messages
    },
    divider: '#757575', // Divider color for elements
    action: {
      active: '#ffffff', // Active icons and buttons will be white
      hover: '#444444', // Slight hover effect for actions
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Set a clean font for readability
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 400,
    },
  },
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
