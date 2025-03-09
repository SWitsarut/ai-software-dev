import { useContext } from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import {Brightness4,Brightness7} from '@mui/icons-material'
import { ColorModeContext } from '../context/ThemeProvider';

interface ThemeToggleProps {
  sidebar?: boolean;
}

const ThemeToggle = ({ sidebar = false }: ThemeToggleProps) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  
  return (
    <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={colorMode.toggleColorMode}
        color="inherit"
        aria-label="toggle theme"
        size={sidebar ? "small" : "medium"}
        sx={{ 
          ml: sidebar ? 0 : 1,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
          },
          flexShrink: 0, // Prevent shrinking
          width: sidebar ? 40 : 'auto',
          height: sidebar ? 40 : 'auto',
        }}
      >
        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;