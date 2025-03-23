import React, { ReactElement, useState } from "react";
import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemButton,
    Paper,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import { NavigateFunction, useLocation } from "react-router-dom";

import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import SideBarItem from "./SideBarItem";
// import { options } from "../../App";
import AuthButton from "../Auth/AuthButton";
import ThemeToggle from "../ThemeToggle";

interface SideBarProps {
    navigate: NavigateFunction;
    options: SideBarItemProps[];
}

export interface SideBarItemProps {
    name: string;
    path: string;
    icon?: ReactElement;
}



const SideBar: React.FC<SideBarProps> = ({ navigate,options }) => {
    const [open, setOpen] = useState<boolean>(true);
    const location = useLocation();
    const theme = useTheme();

    const currentOption = options.find(option => option.path === location.pathname);
    const toggleSidebar = (): void => setOpen(prev => !prev);

    return (
        <Paper
            elevation={2}
            sx={{
                height: '100vh',
                width: open ? '240px' : '64px',
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
            <List sx={{ padding: 0 }}>
                {/* Header section */}
                <ListItem
                    disablePadding
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: theme.spacing(2),
                        height: '64px', // Fixed header height
                    }}
                >
                    {open ? (
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 'bold',
                                flexGrow: 1,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {currentOption ? currentOption.name : 'Dashboard'}
                        </Typography>
                    ) : (
                        <Box sx={{ width: '100%', height: '24px' }} /> // Placeholder when closed
                    )}

                    <Tooltip title={open ? "Collapse" : "Expand"}>
                        <ListItemButton
                            onClick={toggleSidebar}
                            sx={{
                                minWidth: 'auto',
                                padding: theme.spacing(1),
                                // borderRadius: '50%',
                                justifyContent: 'center',
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                }
                            }}
                        >
                            <KeyboardDoubleArrowLeftIcon
                                sx={{
                                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: theme.transitions.create('transform', {
                                        duration: theme.transitions.duration.shorter,
                                    }),
                                }}
                            />
                        </ListItemButton>
                    </Tooltip>
                </ListItem>

                <Divider />

                {/* Navigation items */}
                <Box sx={{ mt: 1 }}>
                    {options.map((option) => (
                        <SideBarItem
                            key={option.path}
                            name={option.name}
                            icon={option.icon}
                            navigate={navigate}
                            path={option.path}
                            isActive={location.pathname === option.path}
                            open={open}
                        />
                    ))}
                </Box>


            </List>
            <List sx={{ padding: 0 }}>
                <Box sx={{ mt: 1 }} display={'flex'} >
                    <AuthButton sidebar_open={open} />
                </Box>
            </List>
        </Paper >
    );
};

export default SideBar;