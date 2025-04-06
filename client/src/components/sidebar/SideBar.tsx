import React, { ReactElement, useState, useEffect } from "react";
import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemButton,
    Paper,
    Tooltip,
    Typography,
    useTheme,
    IconButton,
    Avatar,
    useMediaQuery,
    Drawer,
    Fade
} from "@mui/material";
import { NavigateFunction, useLocation } from "react-router-dom";

import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import {Close} from '@mui/icons-material';
import Menu from '@mui/icons-material';
import SideBarItem from "./SideBarItem";
import AuthButton from "../Auth/AuthButton";
import ThemeToggle from "../ThemeToggle";

interface SideBarProps {
    navigate: NavigateFunction;
    options: SideBarItemProps[];
    isMobile?: boolean;
    onClose?: () => void;
}

export interface SideBarItemProps {
    name: string;
    path: string;
    icon?: ReactElement;
}

const SideBar: React.FC<SideBarProps> = ({ navigate, options, isMobile, onClose }) => {
    const [open, setOpen] = useState<boolean>(true);
    const location = useLocation();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    
    // Reset open state based on screen size
    useEffect(() => {
        setOpen(!isSmallScreen);
    }, [isSmallScreen]);
    
    const currentOption = options.find(option => option.path === location.pathname);
    
    const toggleSidebar = (): void => {
        setOpen(prev => !prev);
        if (isSmallScreen && !open && onClose) {
            onClose();
        }
    };

    // Determine if we should use a drawer for mobile or paper for desktop
    const SidebarContainer = isSmallScreen ? Drawer : Paper;
    const sidebarContainerProps = isSmallScreen ? {
        open: true,
        onClose,
        variant: "temporary",
        anchor: "left"
    } : {};
    
    const sidebarContent = (
        <Box
            sx={{
                height: '100vh',
                width: open ? '260px' : '72px',
                overflowX: 'hidden',
                transition: theme => theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
                boxShadow: isSmallScreen ? 0 : 3
            }}
        >
            <List sx={{ padding: 0 }}>
                {/* Header section */}
                <ListItem
                    disablePadding
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: theme.spacing(2),
                        height: '70px', // Slightly taller header
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
                    }}
                >
                    {open ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                                sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    mr: 1.5, 
                                    bgcolor: theme.palette.primary.main 
                                }}
                            >
                                PL
                            </Avatar>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    flexGrow: 1,
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Point Lab
                            </Typography>
                        </Box>
                    ) : (
                        <Avatar 
                            sx={{ 
                                width: 32, 
                                height: 32, 
                                mx: 'auto',
                                bgcolor: theme.palette.primary.main 
                            }}
                        >
                            PC
                        </Avatar>
                    )}

                    {isSmallScreen ? (
                        <IconButton onClick={onClose} edge="end" size="small">
                            <Close />
                        </IconButton>
                    ) : (
                        <Tooltip title={open ? "Collapse" : "Expand"} placement="right">
                            <IconButton 
                                onClick={toggleSidebar}
                                size="small"
                                sx={{
                                    ml: open ? 1 : 0,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                                    }
                                }}
                            >
                                <KeyboardDoubleArrowLeftIcon
                                    fontSize="small"
                                    sx={{
                                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                                        transition: theme.transitions.create('transform', {
                                            duration: theme.transitions.duration.shorter,
                                        }),
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    )}
                </ListItem>

                <Divider />

                {/* Current Page Indicator */}
                {open && currentOption && (
                    <Fade in={open}>
                        <Box 
                            sx={{ 
                                px: 2, 
                                py: 1.5, 
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'
                            }}
                        >
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.5px',
                                    fontWeight: 500
                                }}
                            >
                                Current Page
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'primary.main'
                                }}
                            >
                                {currentOption.name}
                            </Typography>
                        </Box>
                    </Fade>
                )}

                {/* Navigation items */}
                <Box 
                    sx={{ 
                        mt: 1.5,
                        pb: 2,
                        px: open ? 1 : 0.5
                    }}
                >
                    {options.map((option) => (
                        <SideBarItem
                            key={option.path}
                            name={option.name}
                            icon={option.icon}
                            navigate={(path: string) => {
                                navigate(path);
                                if (isSmallScreen && onClose) {
                                    onClose();
                                }
                            }}
                            path={option.path}
                            isActive={location.pathname === option.path}
                            open={open}
                        />
                    ))}
                </Box>
            </List>
            
            <Box sx={{ mt: 'auto' }}>
                <Divider />
                <Box 
                    sx={{ 
                        p: open ? 2 : 1, 
                        display: 'flex',
                        flexDirection: open ? 'row' : 'column',
                        justifyContent: open ? 'space-between' : 'center',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <AuthButton sidebar_open={open} />
                    {/* {open && <ThemeToggle />} */}
                </Box>
            </Box>
        </Box>
    );

    // For desktop, use Paper; for mobile, use Drawer
    if (isSmallScreen) {
        return (
            <Drawer
                open={true}
                onClose={onClose}
                variant="temporary"
                anchor="left"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: open ? '260px' : '72px',
                        boxSizing: 'border-box',
                    },
                }}
            >
                {sidebarContent}
            </Drawer>
        );
    }

    return (
        <Paper
            elevation={3}
            sx={{
                height: '100vh',
                width: open ? '260px' : '72px',
                overflowX: 'hidden',
                position: 'sticky',
                top: 0,
                alignSelf: 'flex-start',
                transition: theme => theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                borderRadius: 0,
                borderRight: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            {sidebarContent}
        </Paper>
    );
};

export default SideBar;