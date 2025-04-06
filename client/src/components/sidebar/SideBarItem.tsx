import React from "react";
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useTheme
} from "@mui/material";
import { NavigateFunction } from "react-router-dom";

interface SideBarItemProps {
    name: string;
    path: string;
    icon?: React.ReactNode;
    isActive: boolean;
    open: boolean;
    navigate: NavigateFunction | ((path: string) => void);
}

const SideBarItem: React.FC<SideBarItemProps> = ({
    name,
    path,
    icon,
    isActive,
    open,
    navigate
}) => {
    const theme = useTheme();
    
    const itemContent = (
        <ListItemButton
            onClick={() => navigate(path)}
            sx={{
                minHeight: 48,
                borderRadius: 1.5,
                mb: 0.5,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                bgcolor: isActive 
                    ? theme.palette.mode === 'dark' 
                        ? 'rgba(144, 202, 249, 0.16)' 
                        : 'rgba(33, 150, 243, 0.08)' 
                    : 'transparent',
                '&:hover': {
                    bgcolor: isActive 
                        ? theme.palette.mode === 'dark' 
                            ? 'rgba(144, 202, 249, 0.24)' 
                            : 'rgba(33, 150, 243, 0.16)'
                        : theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)' 
                            : 'rgba(0, 0, 0, 0.04)',
                },
                transition: 'background-color 0.2s ease-in-out'
            }}
        >
            {icon && (
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color: isActive 
                            ? 'primary.main' 
                            : 'text.secondary'
                    }}
                >
                    {icon}
                </ListItemIcon>
            )}
            {open && (
                <ListItemText 
                    primary={name} 
                    sx={{ 
                        opacity: open ? 1 : 0,
                        '& .MuiTypography-root': {
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'primary.main' : 'text.primary',
                        }
                    }} 
                />
            )}
        </ListItemButton>
    );

    return (
        <ListItem
            disablePadding
            sx={{
                display: 'block',
                px: open ? 1 : 0.5,
            }}
        >
            {open ? (
                itemContent
            ) : (
                <Tooltip title={name} placement="right">
                    {itemContent}
                </Tooltip>
            )}
        </ListItem>
    );
};

export default SideBarItem;