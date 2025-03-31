import React, { useRef } from 'react'
import { Project, ProjectStatus } from '../../pages/Team/TeamInfo'
import { Grid, Paper, TableCell, TableRow } from '@mui/material'
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../context/AuthProvider';
import { useAuth } from '../../hooks/useAuth';


interface ProjectProps {
    key: string | number,
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
    const dataInputRef = useRef<HTMLInputElement>(null);
    const teamIdInputRef = useRef<HTMLInputElement>(null);
    const tokenInputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuth()

    const submitForm = () => {
        if (dataInputRef.current && formRef.current && teamIdInputRef.current && tokenInputRef.current) {
            dataInputRef.current.value = props.id;
            teamIdInputRef.current.value = props.teamId;
            tokenInputRef.current.value = token || "";
            formRef.current.submit();
        }
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
        <>
            <TableRow key={props.key} sx={{
                cursor: 'pointer'
            }}
                hover
                onClick={submitForm}
            >
                <TableCell sx={{ width: '40%' }}>{props.name}</TableCell>
                <TableCell align='right' sx={{ width: '20%' }}><StatusChip status={props.status} /></TableCell>
                <TableCell align='right' sx={{ width: '20%' }}>{props.targets.length}</TableCell>
                <TableCell align='right' sx={{ width: '20%' }}>{formatCreateDate(props.createdAt)}</TableCell>

            </TableRow>
            <form
                ref={formRef}
                action={API_URL + "/view"}
                method="POST"
                target='_blank'
                id="dataForm"
            >
                <input type="hidden" name="projectId" ref={dataInputRef} />
                <input type="hidden" name="teamId" ref={teamIdInputRef} />
                <input type="hidden" name="token" ref={tokenInputRef} />
            </form>
        </>
    )
}

export default ProjectChip