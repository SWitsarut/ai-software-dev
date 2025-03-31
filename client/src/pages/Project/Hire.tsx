import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import TeamInfo, { TeamMemberRes, TeamWithDetailed } from '../Team/TeamInfo';
import Loading from '../../components/Loading';
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, Paper, Stack, styled, TextField, Typography, useTheme } from '@mui/material';
import Page from '../../components/Page';
import { CloudUpload } from "@mui/icons-material"
import axios from '../../utils/axios';
import { labels } from '../../utils/avaiable_label';
import NearMeIcon from '@mui/icons-material/NearMe';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function Buy() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [caller, setCaller] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    const [dataName, setDataName] = useState<string>("")
    const [files, setFiles] = useState<FileList | null>(null);
    const [totalSize, setTotalSize] = useState<number>(0);
    const [selectedLabels, setSelectedLabels] = useState<number[]>([23, 24, 12, 1, 17]); // Default from server code
    const [teamId,setTeamId] =useState<string>("")

    const MAX_SIZE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB in bytes


    useEffect(() => {
        const getTeamInfo = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get<TeamMemberRes>(`/teams/id/${id}`);
                setCaller(res.data.caller.role)
                setTeamId(res.data.teamInfo._id)
                if (res.data.caller.role !== "Admin") navigate(`/teams/id/${id}`)
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

    const formatSize = (sizeInBytes: number) => {
        const KB = 1024;
        const MB = KB * 1024;
        const GB = MB * 1024;

        if (sizeInBytes >= GB) {
            return `${(sizeInBytes / GB).toFixed(2)} GB`;
        } else if (sizeInBytes >= MB) {
            return `${(sizeInBytes / MB).toFixed(2)} MB`;
        } else if (sizeInBytes >= KB) {
            return `${(sizeInBytes / KB).toFixed(2)} KB`;
        } else {
            return `${sizeInBytes} Bytes`;
        }
    };

    useEffect(() => {
        if (files) {
            let size = 0;
            for (let i = 0; i < files.length; i++) {
                size += files[i].size;
            }
            setTotalSize(size);

            // Check if size exceeds limit
            if (size > MAX_SIZE_LIMIT) {
                setError('Total file size exceeds 2GB limit');
            } else {
                setError(null);
            }
        } else {
            setTotalSize(0);
            setError(null);
        }
    }, [files]);

    const handleLabelToggle = (labelId: number) => {
        setSelectedLabels(prev => {
            if (prev.includes(labelId)) {
                return prev.filter(id => id !== labelId);
            } else {
                return [...prev, labelId];
            }
        });
    };


    const labelsArray = Object.entries(labels)
        .filter(([key]) => key !== "DEFAULT") // Filter out DEFAULT entry
        .map(([key, value]) => ({
            id: Number(key),
            ...value
        }))
        .filter(label => !isNaN(label.id)); // Ensure it's a valid number



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        // Calculate the size of new files
        let newFilesSize = 0;
        for (let i = 0; i < selectedFiles.length; i++) {
            newFilesSize += selectedFiles[i].size;
        }

        // Calculate potential total size
        const potentialTotalSize = totalSize + newFilesSize;

        // Check if adding these files would exceed the limit
        if (potentialTotalSize > MAX_SIZE_LIMIT) {
            setError('Adding these files would exceed the 2GB limit');
            return;
        }

        // Combine previous and new files
        const dataTransfer = new DataTransfer();

        // Add previous files if they exist
        if (files) {
            for (let i = 0; i < files.length; i++) {
                dataTransfer.items.add(files[i]);
            }
        }

        // Add new files
        for (let i = 0; i < selectedFiles.length; i++) {
            dataTransfer.items.add(selectedFiles[i]);
        }

        setFiles(dataTransfer.files);
        setError(null);
    };

    const handleResetFiles = () => {
        setFiles(null);
    };


    const handleUpload = async () => {
        if (!files || files.length === 0) {
            setError('Please select at least one file!');
            return;
        }
        if (dataName.length <= 3) {
            setError("Data name must be longer that 3 letters.")
            return
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        formData.append('selectedLabels', JSON.stringify(selectedLabels))
        formData.append('dataName', dataName)
        formData.append('teamId', id || "")
        try {
            axios.post(`/point_cloud/request`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setError('');
            navigate(`/teams/id/${teamId}`)
        } catch (error) {
            setError('File upload failed');
            console.error(error);
        }
    };




    if (isLoading) return <Loading />

    return (
        <Page header={'Hiring'}>
            <Grid container spacing={3}>

                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{
                        p: 2,
                        width: "100%",
                        height: "100%",
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <Box sx={{ height: '100%', width: '100%', display: 'flex', gap: 3, flexDirection: 'column' }}>
                            <Box sx={{ height: '100%' }}>
                                <Typography variant='body1' mb={1}>ข้อมูลที่ต้องการประมวลผล</Typography>
                                <Box sx={{
                                    width: '100%',
                                    maxHeight: '250px',
                                    overflowX: 'hidden',
                                    overflowY: 'auto',
                                    border: '1px solid gray',
                                    p: 2,
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                }}>
                                    {(files && files.length > 0) &&
                                        <Box>
                                            {
                                                Array.from(files).map((file, index) => (
                                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" >
                                                            {file.name}
                                                        </Typography>
                                                    </Box>
                                                ))
                                            }
                                        </Box>
                                    }
                                </Box>
                                {/* <Typography variant='body2'>total size:{totalSize} KB</Typography> */}
                                <Typography variant='body2'>
                                    Total size: {formatSize(totalSize)}
                                </Typography>
                            </Box>
                            <Stack direction={'row'} sx={{ width: '100%', justifyContent: 'space-between' }}>
                                <Button component="label" variant="contained" startIcon={<CloudUpload />}>
                                    Select Files
                                    <VisuallyHiddenInput type="file" multiple onChange={handleFileChange} />
                                </Button>
                                <Button disabled={files == null || files?.length === 0}
                                    variant='contained'
                                    onClick={handleResetFiles}
                                    color='error'
                                >
                                    Reset file</Button>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{
                        p: 2,
                        // m: 1,
                        // mb: 2,
                        width: "100%",
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Stack >
                            <TextField required value={dataName} variant='outlined' label="data name" onChange={e => setDataName(e.target.value)} />
                            <Grid container spacing={1} sx={{ mt: 1, mb: 1 }}>
                                {labelsArray.map((label) => (
                                    <Grid item xs={6} sm={4} md={3} key={label.id}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedLabels.includes(label.id)}
                                                    onChange={() => handleLabelToggle(label.id)}
                                                    sx={{
                                                        color: `rgba(${label.color[0] * 255}, ${label.color[1] * 255}, ${label.color[2] * 255}, ${label.color[3]})`,
                                                        '&.Mui-checked': {
                                                            color: `rgba(${label.color[0] * 255}, ${label.color[1] * 255}, ${label.color[2] * 255}, ${label.color[3]})`
                                                        }
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" noWrap>
                                                    {label.name}
                                                </Typography>
                                            }
                                            sx={{
                                                width: '100%',
                                                margin: 0
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            <Divider />
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setSelectedLabels([])}
                                >
                                    Clear All
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setSelectedLabels(labelsArray.map(label => label.id))}
                                >
                                    Select All
                                </Button>
                            </Box>
                        </Stack>
                    </Paper>

                </Grid>
                <Grid item sm={12}>
                    <Paper elevation={3} sx={{
                        p: 2,
                        width: "100%",
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'

                    }}>
                        <Typography variant='body1' color='error'>{error}</Typography>
                        <Button startIcon={<NearMeIcon />} variant='contained' onClick={handleUpload}>ส่ง</Button>
                    </Paper>
                </Grid>
            </Grid>
        </Page>
    )
}

export default Buy