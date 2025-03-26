import { Card, Avatar, Typography, useTheme } from '@mui/material'
import { Team } from '../../pages/Team/ViewTeams'
import imageLocation from '../../utils/imageLocation'
import { useNavigate } from 'react-router-dom'

interface TeamsCardProps {
    team: Team
}

function TeamsCard({ team }: TeamsCardProps) {
    const theme = useTheme()

    const navigate = useNavigate()

    const handleCardClick = () => {
        navigate(`/teams/id/${team._id}`)
    }

    return (
        <Card onClick={handleCardClick}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                }
            }}>
            <Avatar
                src={imageLocation(team.image)}
                sx={{
                    width: 100,
                    height: 100,
                    mb: 2
                }}
            >
                {team.name.charAt(0)}
            </Avatar>
            <Typography variant='h6' align='center'>
                {team.name}
            </Typography>
            <Typography variant='subtitle2' color="text.secondary">
                Created by: {team.createBy.name}
            </Typography>
        </Card>
    )
}

export default TeamsCard