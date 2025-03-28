import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { TeamMemberRes, TeamWithDetailed } from '../Team/TeamInfo';
import Loading from '../../components/Loading';
import { Container } from '@mui/material';
import Page from '../../components/Page';

function Buy() {
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [caller, setCaller] = useState<string>("")
    const [teamInfo, setTeamInfo] = useState<TeamWithDetailed>()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const getTeamInfo = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get<TeamMemberRes>(`/teams/id/${id}`);
                setCaller(res.data.caller.role)
                setTeamInfo(res.data.teamInfo)
                setError(null);
            } catch (err) {
                console.error('Error fetching team info:', err);
                setError('Failed to load team info');
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            getTeamInfo();
        }
    }, [id])

    if (isLoading) return <Loading />

    return (
        <Page header={'Buy data'}>
            <Container>Buying</Container>
        </Page>
    )
}

export default Buy