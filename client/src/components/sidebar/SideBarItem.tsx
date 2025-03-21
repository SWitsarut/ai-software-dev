import React from "react";
import { 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Tooltip, 
  useTheme 
} from "@mui/material";
import { ReactElement } from "react";
import { NavigateFunction } from "react-router-dom";

interface SideBarItemProps {
  name: string;
  icon?: ReactElement;
  navigate: NavigateFunction;
  path: string;
  isActive: boolean;
  open: boolean;
}

const SideBarItem: React.FC<SideBarItemProps> = ({ 
  name, 
  icon, 
  navigate, 
  path, 
  isActive,
  open 
}) => {
  const theme = useTheme();
  
  const handleNavigation = (): void => {
    navigate(path);
  };
  
  const item = (
    <ListItemButton
      onClick={handleNavigation}
      selected={isActive}
      sx={{
        minHeight: 48,
        px: open ? 2.5 : 2,
        justifyContent: open ? 'initial' : 'center',
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.main + '20', // Semi-transparent primary color
          borderRight: `3px solid ${theme.palette.primary.main}`,
          '&:hover': {
            backgroundColor: theme.palette.primary.main + '30', // Slightly darker on hover
          }
        },
        mb: 0.5,
        // borderRadius: open ? `0 24px 24px 0` : 0, // Rounded corner when open
        mx: open ? 1 : 0,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: open ? 2 : 'auto',
          justifyContent: 'center',
          color: isActive ? theme.palette.primary.main : 'inherit'
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText 
        primary={name} 
        sx={{ 
          opacity: open ? 1 : 0,
          color: isActive ? theme.palette.primary.main : 'inherit',
          '& .MuiTypography-root': {
            fontWeight: isActive ? 'bold' : 'normal',
          }
        }} 
      />
    </ListItemButton>
  );

  return open ? item : (
    <Tooltip title={name} placement="right">
      {item}
    </Tooltip>
  );
};

export default SideBarItem;