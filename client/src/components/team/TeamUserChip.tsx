import React, { useState } from 'react'
import {
    Avatar,
    Chip,
    Typography,
    Box,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    Card,
    CardContent,
    CardMedia,
    Divider,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material'
import { Clear } from '@mui/icons-material';
import { TeamMemberUser } from '../../pages/Team/TeamInfo'
import imageLocation from '../../utils/imageLocation'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

interface UserChipProps {
    user: TeamMemberUser;
    onDelete?: () => void;
    isAdmin: boolean,
    size?: 'small' | 'medium';
    additionalInfo?: {
        email?: string;
        role?: string;
        joinedDate?: string;
    };
    onRoleChange?: (newRole: string) => void;
}

function UserChip({
    user,
    onDelete,
    size = 'medium',
    additionalInfo,
    onRoleChange,
    isAdmin
}: UserChipProps) {
    const theme = useTheme()
    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false)
    const [currentRole, setCurrentRole] = useState(additionalInfo?.role || 'User')

    const handleOpenUserInfo = () => {
        setIsUserInfoOpen(true)
    }

    const handleCloseUserInfo = () => {
        setIsUserInfoOpen(false)
    }

    const handleRoleChange = (event: any) => {
        const newRole = event.target.value;
        setCurrentRole(newRole);
        onRoleChange?.(newRole);
    }

    const formatJoinedDate = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    return (
        <>
            <Chip
                avatar={
                    <Avatar
                        src={imageLocation(user.avatar)}
                        alt={user.name}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                }
                label={
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%'
                        }}
                    >
                        <Typography variant="subtitle2">
                            {user.name}
                        </Typography>
                        {additionalInfo?.role === "Admin" && (
                            <SupervisorAccountIcon
                                sx={{
                                    color: 'green',
                                    marginLeft: 'auto'
                                }}
                            />
                        )}
                    </Box>
                }

                onClick={handleOpenUserInfo}
                onDelete={onDelete}
                size={size}
                sx={{
                    '& .MuiChip-label': {
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: "space-between",
                        gap: theme.spacing(1),
                        width: '100%'
                    },
                    width: '100%'

                }}
            />

            <Dialog
                open={isUserInfoOpen}
                onClose={handleCloseUserInfo}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    User Information
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseUserInfo}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500]
                        }}
                    >
                        <Clear />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Card>
                        <CardMedia
                            component="img"
                            height="200"
                            image={imageLocation(user.avatar)}
                            alt={user.name}
                            sx={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                                filter: 'brightness(0.8)'
                            }}
                        />
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {user.name}
                            </Typography>

                            {(additionalInfo?.role && isAdmin) ? (
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={currentRole}
                                        label="Role"
                                        onChange={handleRoleChange}
                                    >
                                        <MenuItem value="Admin">Admin</MenuItem>
                                        <MenuItem value="User">User</MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (<Typography variant="body2">
                                <strong>Role:</strong> {currentRole}
                            </Typography>)}

                            <Divider sx={{ my: 2 }} />

                            {additionalInfo?.email && (
                                <Typography variant="body2">
                                    <strong>Email:</strong> {additionalInfo.email}
                                </Typography>
                            )}

                            {additionalInfo?.joinedDate && (
                                <Typography variant="body2">
                                    <strong>Joined:</strong> {formatJoinedDate(additionalInfo.joinedDate)}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default UserChip