import React, { ChangeEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { TeamMemberRes, TeamWithDetailed } from '../Team/TeamInfo';
import Loading from '../../components/Loading';
import { Alert, Box, Button, Checkbox, Divider, FormControlLabel, Grid, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import Page from '../../components/Page';
import axios from '../../utils/axios';
import { labels } from '../../utils/avaiable_label';
import { cal_init_price } from '../../utils/cal_price';
import { API_URL } from '../../context/AuthProvider';
import PricingInfo from '../../components/PriceInfo';

interface DataOwner {
    name: string,
}

interface Data {
    _id: string,
    updatedAt: string,
    name: string,
    createBy: DataOwner,
    price: number,
}

interface DataDisplayProps extends Data {
    selectedLabels: number[]
    init_price: number,
    teamId: string,
    setNotifyOpen: React.Dispatch<React.SetStateAction<boolean>>
    dataName: string
}


interface DataDisplayProps extends Data {
    selectedLabels: number[]
    init_price: number,
    teamId: string,
    setNotifyOpen: React.Dispatch<React.SetStateAction<boolean>>
    dataName: string,
    setSelectedData: React.Dispatch<React.SetStateAction<Data | null>> // New prop to track selected data
}

const DataDisplay: React.FC<DataDisplayProps> = ({ dataName, setNotifyOpen, teamId, _id, price, updatedAt, name, createBy, selectedLabels, init_price, setSelectedData }) => {
    const [isClickable, setIsClickable] = useState(true)

    const submitForm = () => {
        // Create and submit a form programmatically instead of using a ref
        const form = document.createElement('form');
        form.action = API_URL + "/preview";
        form.method = "POST";
        form.target = "_blank";

        // Create and append project ID input
        const dataIdInput = document.createElement('input');
        dataIdInput.type = "hidden";
        dataIdInput.name = "dataId";
        dataIdInput.value = _id;
        form.appendChild(dataIdInput);

        // Create and append team ID input
        const teamIdInput = document.createElement('input');
        teamIdInput.type = "hidden";
        teamIdInput.name = "teamId";
        teamIdInput.value = teamId;
        form.appendChild(teamIdInput);

        // Append form to body, submit it, and remove it
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const handleClick = async () => {
        await axios.post('/buy', {
            dataId: _id,
            teamId: teamId,
            labels: selectedLabels,
            dataName: dataName
        })
        setNotifyOpen(true)
        setIsClickable(false)
    }

    const handleSelect = () => {
        setSelectedData({
            _id,
            price,
            updatedAt,
            name,
            createBy
        });
    };

    return (
        <Paper
            sx={{
                p: 2,
                width: "100%",
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Stack gap={1} sx={{ width: '100%' }}>
                <Stack direction={"row"} sx={{
                    justifyContent: "space-between"
                }}>
                    <div>
                        <Typography variant="h6">{name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Created by: {createBy.name}
                        </Typography>
                    </div>
                    <Stack sx={{ textAlign: "end" }}>
                        <Typography variant="caption">
                            Updated: {new Date(updatedAt).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color='blue' sx={{
                            cursor: 'pointer',
                        }}
                            onClick={submitForm}
                        >
                            preview
                        </Typography>
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button onClick={handleClick} variant='contained' sx={{ flexGrow: 1 }} disabled={!isClickable}>Buy: {init_price + price} ฿</Button>
                    <Button onClick={handleSelect} variant='outlined' >Select</Button>
                </Stack>
            </Stack>
        </Paper >
    );
};

function Buy() {
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [caller, setCaller] = useState<string>("")
    const [teamInfo, setTeamInfo] = useState<TeamWithDetailed>()
    const [error, setError] = useState<string | null>(null)
    const [notifyOpen, setNotifyOpen] = useState(false)
    const [init_price, setInit_price] = useState<number>(0)
    const [selectedLabels, setSelectedLabels] = useState<number[]>([23, 24, 12, 17]); // Default from server code
    const [availableData, setAvailableData] = useState<Data[] | null>(null)
    const [dataName, setDataName] = useState<string>("")
    const [selectedData, setSelectedData] = useState<Data | null>(null); // Track selected data

    useEffect(() => {
        // Re-render when notification state changes
    }, [notifyOpen])

    useEffect(() => {
        const label_price = cal_init_price(selectedLabels)
        setInit_price(label_price)
    }, [selectedLabels])

    const labelsArray = Object.entries(labels)
        .filter(([key]) => key !== "DEFAULT") // Filter out DEFAULT entry
        .map(([key, value]) => ({
            id: Number(key),
            ...value
        }))
        .filter(label => !isNaN(label.id)); // Ensure it's a valid number

    const handleLabelToggle = (labelId: number) => {
        setSelectedLabels(prev => {
            if (prev.includes(labelId)) {
                return prev.filter(id => id !== labelId);
            } else {
                return [...prev, labelId];
            }
        });
    };

    useEffect(() => {
        const getInfo = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get<TeamMemberRes>(`/teams/id/${id}`);
                const available = await axios.get<Data[]>(`/buy`)
                setAvailableData(available.data)

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
            getInfo();
        }
    }, [id])

    if (isLoading) return <Loading />

    return (
        <Page header={'Buy data'}>
            <Stack gap={3}>
                <Grid container spacing={2}>
                    {/* Left side - Label selection and project naming */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={3} sx={{ p: 2, width: "100%" }}>
                            <Stack>
                                <TextField value={dataName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDataName(e.target.value)}
                                    label={"Project name"}
                                    sx={{ mb: 1 }}
                                />

                                <Divider />
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

                    {/* Right side - Pricing information */}
                    <Grid item xs={12} md={4}>
                        <PricingInfo 
                            selectedLabels={selectedLabels} 
                            dataPrice={selectedData?.price || 0} 
                        />
                    </Grid>
                </Grid>

                {/* Available Data Grid */}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Available Data Sets
                </Typography>
                <Grid container spacing={2}>
                    {availableData && availableData.map((data, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <DataDisplay
                                dataName={dataName}
                                teamId={teamInfo?._id || ""}
                                _id={data._id}
                                updatedAt={data.updatedAt || ''}
                                name={data.name || ''}
                                createBy={data.createBy}
                                selectedLabels={selectedLabels}
                                init_price={init_price}
                                price={data.price}
                                setNotifyOpen={setNotifyOpen}
                                setSelectedData={setSelectedData}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Snackbar
                    open={notifyOpen}
                    onClose={() => setNotifyOpen(false)}
                    autoHideDuration={1200}
                >
                    <Alert
                        onClose={() => setNotifyOpen(false)}
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        Project added
                    </Alert>
                </Snackbar>
            </Stack>
        </Page>
    )
}

export default Buy