import React, { useRef } from 'react'
import { ProjectStatus } from '../../pages/Team/TeamInfo'
import { TableCell, TableRow } from '@mui/material'
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../context/AuthProvider';
import { useAuth } from '../../hooks/useAuth';

interface ProjectProps {
    name: string,
    createdAt: string,
    status: ProjectStatus,
    targets: Number[],
    id: string,
    teamId: string,
}

interface StatusChipProps {
    status: ProjectStatus
}

const StatusChip = ({ status }: StatusChipProps) => {
    // Determine color based on status
    let color: 'warning' | 'success' | 'error' | 'default' | 'primary' | 'secondary' | 'info';

    switch (status) {
        case 'waiting':
            color = 'warning'; // yellow
            break;
        case 'paid':
            color = 'success'; // green
            break;
        case 'cancel':
            color = 'error'; // red
            break;
        default:
            color = 'default';
    }

    return <Chip label={status} color={color} />;
}

function ProjectChip(props: ProjectProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleClick = () => {
        if (props.status === 'waiting') {
            navigate(`/teams/id/${props.teamId}/projects/${props.id}/payment`);
        } else {
            submitForm();
        }
    };

    const submitForm = () => {
        // Create and submit a form programmatically instead of using a ref
        const form = document.createElement('form');
        form.action = API_URL + "/view";
        form.method = "POST";
        form.target = "_blank";

        // Create and append project ID input
        const projectIdInput = document.createElement('input');
        projectIdInput.type = "hidden";
        projectIdInput.name = "projectId";
        projectIdInput.value = props.id;
        form.appendChild(projectIdInput);

        // Create and append team ID input
        const teamIdInput = document.createElement('input');
        teamIdInput.type = "hidden";
        teamIdInput.name = "teamId";
        teamIdInput.value = props.teamId;
        form.appendChild(teamIdInput);

        // Create and append token input
        const tokenInput = document.createElement('input');
        tokenInput.type = "hidden";
        tokenInput.name = "token";
        tokenInput.value = token || "";
        form.appendChild(tokenInput);

        // Append form to body, submit it, and remove it
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const formatCreateDate = (dateString?: string) => {
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
        <TableRow
            sx={{
                cursor: 'pointer'
            }}
            hover
            onClick={handleClick}
        >
            <TableCell sx={{ width: '40%' }}>{props.name}</TableCell>
            <TableCell align='right' sx={{ width: '20%' }}><StatusChip status={props.status} /></TableCell>
            <TableCell align='right' sx={{ width: '20%' }}>{props.targets.length}</TableCell>
            <TableCell align='right' sx={{ width: '20%' }}>{formatCreateDate(props.createdAt)}</TableCell>
        </TableRow>
    );
}

export default ProjectChip