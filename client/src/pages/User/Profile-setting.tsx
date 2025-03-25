import { useEffect, useState } from 'react'
import {
    Avatar,
    Box,
    Button,
    Card,
    Container,
    Divider,
    Grid,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
    useTheme
} from '@mui/material'
import Page from '../../components/Page'
import EmailIcon from '@mui/icons-material/Email'
import { AdminPanelSettings } from '@mui/icons-material'
import PersonIcon from '@mui/icons-material/Person'
import { useAuth } from '../../hooks/useAuth'
import axios from "../../utils/axios"
import Loading from '../../components/Loading'
import { User } from '../../context/AuthProvider'


interface UpdateRes {
    user: User
}


function ProfileSetting() {
    const theme = useTheme();
    const { user, setUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [newImage, setNewImage] = useState<File | null>(null)
    const [newName, setNewName] = useState<string>(user?.name || "");
    const [imagePreview, setImagePreview] = useState<string | null>(user?.avatarPath || null);

    const handleCancel = () => {
        setNewImage(null)
        setNewName(user?.name || "")
    }
    const handleSave = async () => {
        if (!newImage) {
            const res = await axios.post<UpdateRes>(`auth/update`, {
                name: newName
            })
            console.log(res?.data)
            setUser(res?.data.user)
        } else {
            const formData = new FormData();
            formData.append('image', newImage);

            try {
                const response = await axios.post<User>(`/upload/image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log(response.data);  // Logs the response from server

            } catch (error) {
                console.error(error);
            }
        }


    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewImage(file);
            setImagePreview(URL.createObjectURL(file)); // Preview image
        }
    };

    useEffect(() => {
        if (user?.name) {
            setNewName(user.name);
        }
        setLoading(false)
    }, [user]);


    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <Page header={"แก้ไข ข้อมูลผู้ใช้"}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Snackbar
                    open={(user?.name !== newName && newName !== "")}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{ minWidth: '450px' }}
                >
                    {/* <Alert sx={{ width: '100%',backgroundColor:theme.palette.primary.main  }}> */}
                    <Box
                        sx={{
                            width: '100%',
                            backgroundColor: theme.palette.primary.main,
                            padding: '5px',
                            borderRadius: '5px',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Typography >Save Change?</Typography>
                        <Stack direction='row' gap={1}>
                            <Button
                                sx={{ backgroundColor: theme.palette.success.main, color: 'white', '&:hover': { backgroundColor: theme.palette.success.dark } }}
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                            <Button
                                sx={{ backgroundColor: theme.palette.error.main, color: 'white', '&:hover': { backgroundColor: theme.palette.error.dark } }}
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                    {/* </Alert> */}
                </Snackbar>
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            height: 120,
                            position: 'relative'
                        }}
                    />

                    {/* User info */}
                    <Box sx={{ position: 'relative', px: 3, pb: 3, mt: -6 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={imagePreview || ""}
                                    variant="rounded"
                                    sx={{
                                        width: 140,
                                        height: 140,
                                        border: '4px solid white',
                                        boxShadow: 2,
                                        backgroundColor: 'grey.300'
                                    }}
                                />
                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    id="avatar-upload"
                                />
                                {/* Upload Button */}
                                <Button
                                    variant="contained"
                                    component="label"
                                    htmlFor="avatar-upload"
                                    sx={{ mt: 2 }}
                                >
                                    เปลี่ยนรูปโปรไฟล์
                                </Button>
                            </Box>

                            <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                                {/* <Typography variant="h4" fontWeight="bold">{user?.name || "ไม่พบชื่อผู้ใช้"}</Typography> */}
                                <TextField value={newName} onChange={(prev) => setNewName(prev.target.value)} />
                                <Typography
                                    variant="subtitle1"
                                    color="text.secondary"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                    {user?.role === 'admin' ? (
                                        <AdminPanelSettings fontSize="small" color="primary" />
                                    ) : (
                                        <PersonIcon fontSize="small" color="primary" />
                                    )}
                                    {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Divider />

                    {/* User Details */}
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>รายละเอียดผู้ใช้</Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                                    <Stack spacing={3}>
                                        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Badge color="primary" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">รหัสผู้ใช้</Typography>
                                                <Typography variant="body1" fontWeight="medium">{user?.userId || "ไม่พบข้อมูล"}</Typography>
                                            </Box>
                                        </Box> */}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <EmailIcon color="primary" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">อีเมล</Typography>
                                                <Typography variant="body1" fontWeight="medium">{user?.email || "ไม่พบข้อมูล"}</Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                                    <Stack spacing={3}>
                                        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <PhoneIcon color="primary" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">หมายเลขโทรศัพท์</Typography>
                                                <Typography variant="body1" fontWeight="medium">{user?. || "ไม่พบข้อมูล"}</Typography>
                                            </Box>
                                        </Box> */}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <AdminPanelSettings color="primary" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">สิทธิ์การใช้งาน</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {user?.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้ทั่วไป (User)'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </Page>
    )
}

export default ProfileSetting