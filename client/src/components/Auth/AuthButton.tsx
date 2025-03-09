import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  Slide,
  ListItemButton,
  ListItemIcon,
  Avatar,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import AuthContainer from './AuthContainer';
import { useAuth } from '../../hooks/useAuth';

// Slide transition for the dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface props { sidebar_open: boolean }

function AuthButton({ sidebar_open }: props) {
  const [open, setOpen] = useState<boolean>(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const onAuthSuccess = (accessToken: string) => {
    if (accessToken) {
      console.log("JWT Token received:", accessToken);
      setOpen(false);
    } else {
      console.error("Invalid token received.");
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <ListItemButton
          onClick={handleOpen}
          sx={{
            minHeight: 48,
            px: sidebar_open ? 2.5 : 2,
            justifyContent: sidebar_open ? 'initial' : 'center',
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main + '20', // Semi-transparent primary color
              borderRight: `3px solid ${theme.palette.primary.main}`,
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '30', // Slightly darker on hover
              }
            },
            mb: 0.5,
            mx: sidebar_open ? 1 : 0,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: sidebar_open ? 2 : 'auto',
              justifyContent: 'center',
            }}
          >
            <Avatar />
          </ListItemIcon>
          <ListItemText
            primary="Sign In"
            sx={{
              opacity: sidebar_open ? 1 : 0,
            }}
          />
        </ListItemButton>
      ) : (
        <ListItemButton
          onClick={handleMenuOpen}
          sx={{
            minHeight: 48,
            px: sidebar_open ? 2.5 : 2,
            justifyContent: sidebar_open ? 'initial' : 'center',
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main + '20',
              borderRight: `3px solid ${theme.palette.primary.main}`,
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '30',
              }
            },
            mb: 0.5,
            // borderRadius: sidebar_open ? `0 24px 24px 0` : 0,
            mx: sidebar_open ? 1 : 0,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: sidebar_open ? 2 : 'auto',
              justifyContent: 'center',
            }}
          >
            <Avatar src={undefined} />
          </ListItemIcon>
          <ListItemText
            primary={user?.name || "User"}
            sx={{
              opacity: sidebar_open ? 1 : 0,
            }}
          />
        </ListItemButton>
      )}

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        fullWidth={false}
        maxWidth="sm"
        TransitionComponent={Transition}
      >
        <DialogContent sx={{ p: 0 }}>
          <AuthContainer onAuthSuccess={onAuthSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthButton;