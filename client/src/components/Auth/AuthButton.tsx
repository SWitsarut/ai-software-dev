import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  Slide,
  ListItemButton,
  ListItemIcon,
  Avatar,
  ListItemText
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
  const { token, setToken } = useAuth()
  const [isSigned, setIsSigned] = useState(localStorage.getItem('authToken'))


  console.log('token', token)
  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const onAuthSuccess = (accessToken: string) => {
    if (accessToken) {
      localStorage.setItem("authToken", accessToken); // Store token in local storage
      console.log("JWT Token stored:", accessToken);
      setOpen(false);
      setIsSigned(accessToken)
      setToken(accessToken)
    } else {
      console.error("Invalid token received.");
    }
  };


  return (
    <>
      {!isSigned ? (<ListItemButton
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
          borderRadius: sidebar_open ? `0 24px 24px 0` : 0, // Rounded corner when open
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
          primary="Hello"
          sx={{
            opacity: sidebar_open ? 1 : 0,
          }}
        />
      </ListItemButton>) : (
        "hello"
      )}


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
      </Dialog >
    </>
  );
};

export default AuthButton;