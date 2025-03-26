import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Page from '../../components/Page'
import Loading from '../../components/Loading'
import axios from '../../utils/axios'
import { Box, Stack, Typography, Grid, Button } from '@mui/material'
import TeamsCard from '../../components/team/TeamCard'

export interface Team {
    _id: string,
    createBy: {
        name: string,
        _id: string
    }
    image: string,
    name: string
}

export interface TeamRes {
    teamId: Team
    role: string,
}


function ViewTeams() {
    const { isLoading } = useAuth()
    const [teams, setTeams] = useState<TeamRes[] | null | undefined>(undefined);

    useEffect(() => {
        const getTeams = async () => {
            try {
                const response = await axios.get<TeamRes[]>('/teams/list');
                console.log(response.data)
                setTeams(response?.data)
            } catch (error) {
                console.error('Error fetching teams:', error);
                setTeams([]);
            }
        }
        getTeams()
    }, [])

    if (isLoading || teams === undefined) {
        return <Loading />
    }

    if (!isLoading && teams?.length === 0) {
        return (
            <Page header="Teams">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Stack>
                        <Typography variant='h3'>You don't have any teams.</Typography>
                        <Button ></Button>
                    </Stack>

                </Box>
            </Page>
        )
    }

    return (
        <Page header='Teams'>
            <Grid container spacing={3}>
                {teams?.map((team, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <TeamsCard team={team.teamId} />
                    </Grid>
                ))}
            </Grid>
        </Page>
    )
}

export default ViewTeams