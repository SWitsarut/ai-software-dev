import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import UserChip from '../../components/team/TeamUserChip';
import {
    Box,
    Typography,
    Container,
    Grid,
    Avatar,
    Paper,
    Divider,
    Stack,
    Button
} from '@mui/material';
import Page from '../../components/Page';
import { Team } from './ViewTeams';
import imageLocation from '../../utils/imageLocation';

export interface TeamMemberUser {
    avatar: string;
    name: string;
    _id: string;
}

export interface TeamWithDetailed extends Team {
    createdAt: string
}

export interface TeamMemberRes {
    members: TeamMember[],
    caller: { role: string }
    teamInfo: TeamWithDetailed
}

export interface TeamMember {
    addedBy: string;
    createdAt: string;
    role: string;
    teamId: string;
    updatedAt: string;
    userId: TeamMemberUser;
    __v: number;
    _id: string;
}

function TeamInfo() {
    const navigate = useNavigate()
    const { isLoading: isAuthLoading } = useAuth()
    const { id } = useParams();
    const [users, setUsers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [caller, setCaller] = useState<string>("User")
    const [teamInfo, setTeamInfo] = useState<TeamWithDetailed>()

    const updateUserRole = async (id: string, newRole: string) => {
        try {
            const res = await axios.post('/teams/update/role', {
                target: id,
                targetRole: newRole,
                teamId: teamInfo?._id
            })
            console.log(res);
        } catch (error) {
            console.log(error)
        }
    }

    const formatCreateDate = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleString('en-UK', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    useEffect(() => {
        const getTeamInfo = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get<TeamMemberRes>(`/teams/id/${id}`);
                setUsers(res.data.members);
                setCaller(res.data.caller.role)
                setTeamInfo(res.data.teamInfo)
                setError(null);
            } catch (err) {
                console.error('Error fetching team info:', err);
                setError('Failed to load team members');
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            getTeamInfo();
        }
    }, [id])

    if (isAuthLoading || isLoading) return <Loading />

    if (error) {
        return (
            <Container>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                </Box>
            </Container>
        )
    }

    if (users.length === 0) {
        return (
            <Container>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6">
                        No team members found
                    </Typography>
                </Box>
            </Container>
        )
    }

    return (
        <Page header={`${teamInfo?.name}`}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 2
                        }}
                    >
                        <Avatar
                            src={imageLocation(teamInfo?.image || "")}
                            variant="rounded"
                            sx={{
                                width: '100%',
                                maxWidth: 300,
                                height: 300,
                                objectFit: 'cover',
                                border: '4px solid white',
                                boxShadow: 2,
                                backgroundColor: 'grey.300'
                            }}
                        />
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                {teamInfo?.name}
                            </Typography>
                            <Divider />
                            <Typography variant="body1" mt={1}>
                                โดย {teamInfo?.createBy.name} เมื่อ {formatCreateDate(teamInfo?.createdAt)}
                            </Typography>
                        </Box>

                    </Paper>
                </Grid>

                {/* Right Side - Team Members */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Team Members
                        </Typography>
                        <Grid container spacing={2}>
                            {users.map((member) => (
                                <Grid item xs={12} sm={6} key={member._id}>
                                    <UserChip
                                        user={member.userId}
                                        additionalInfo={{
                                            role: member.role,
                                            joinedDate: member.createdAt
                                        }}
                                        onRoleChange={(newRole) => updateUserRole(member._id, newRole)}
                                        isAdmin={caller === "Admin"}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Bottom Section */}
                <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Stack direction='row' mb={1} spacing={2} sx={{ justifyContent: "space-between", alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Additional Information
                            </Typography>
                            {
                                caller === "Admin" && (
                                    <Box display={'flex'} gap={1}>
                                        <Button onClick={() => navigate(`/teams/id/${teamInfo?._id}/buy`)} variant='contained'>ซื้อข้อมูล</Button>
                                        <Button onClick={()=> navigate(`/teams/id/${teamInfo?._id}/hire`)}variant='contained'>จ้างประมวลผล</Button>
                                    </Box>
                                )
                            }


                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        {/* Add any additional content or sections here */}
                        <Typography variant="body1">
                            You can add team statistics, recent activities, or other relevant information here.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Page >
    )
}

export default TeamInfo