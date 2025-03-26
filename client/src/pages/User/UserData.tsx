import { useEffect, useState } from 'react'
import {
    Avatar,
    Box,
    Card,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { User } from '../../context/AuthProvider'
import Page from '../../components/Page'
import axios from "../../utils/axios"
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { AdminPanelSettings, Badge } from '@mui/icons-material'
import PersonIcon from '@mui/icons-material/Person'
import imageLocation from '../../utils/imageLocation'

interface ViewUser extends User {
    UserId: string
}

function UserData() {
    const { id } = useParams()
    const [user, setUser] = useState<User>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUserData = async (id: string) => {
            try {
                setLoading(true)
                const response = await axios.get<ViewUser>(`/user/${id}`)
                setUser(response.data)
                console.log(response.data)
            } catch (error) {
                console.error("Error fetching user data:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            getUserData(id)
        }
    }, [id])

    if (loading) {
        return (
            <Page header="กำลังโหลดข้อมูล...">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Typography>กำลังโหลดข้อมูลผู้ใช้...</Typography>
                </Box>
            </Page>
        )
    }

    return (
        <Page header={user?.name ? `ข้อมูลผู้ใช้: ${user.name}` : "ข้อมูลผู้ใช้"}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    {/* Header Background */}
                    <Box
                        sx={{
                            height: 120,
                            position: 'relative'
                        }}
                    />

                    {/* User info */}
                    <Box sx={{ position: 'relative', px: 3, pb: 3, mt: -6 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                            <Avatar
                                src={imageLocation(user?.avatar || user?.name.charAt(0) || "")}
                                variant="rounded"
                                sx={{
                                    width: 140,
                                    height: 140,
                                    border: '4px solid white',
                                    boxShadow: 2,
                                    backgroundColor: 'grey.300'
                                }}
                            />

                            <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                                <Typography variant="h4" fontWeight="bold">{user?.name || "ไม่พบชื่อผู้ใช้"}</Typography>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Badge color="primary" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">รหัสผู้ใช้</Typography>
                                                <Typography variant="body1" fontWeight="medium">{user?.userId || "ไม่พบข้อมูล"}</Typography>
                                            </Box>
                                        </Box>

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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <PhoneIcon color="primary" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">หมายเลขโทรศัพท์</Typography>
                                                {/* <Typography variant="body1" fontWeight="medium">{user?.phoneNumber || "ไม่พบข้อมูล"}</Typography> */}
                                            </Box>
                                        </Box>

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

export default UserData