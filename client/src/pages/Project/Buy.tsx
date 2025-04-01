import React, { ChangeEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { TeamMemberRes, TeamWithDetailed } from '../Team/TeamInfo';
import Loading from '../../components/Loading';
import { Alert, Box, Button, Checkbox, Container, Divider, FormControlLabel, Grid, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import Page from '../../components/Page';
import axios from '../../utils/axios';
import { labels } from '../../utils/avaiable_label';
import { cal_init_price } from '../../utils/cal_price';

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

const DataDisplay: React.FC<DataDisplayProps> = ({ dataName, setNotifyOpen, teamId, _id, price, updatedAt, name, createBy, selectedLabels, init_price }) => {
    const [isClickable, setIsClickable] = useState(true)


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
                    <Typography variant="caption">
                        Updated: {new Date(updatedAt).toLocaleString()}
                    </Typography>
                </Stack>
                <Button onClick={handleClick} variant='contained' disabled={!isClickable}>Buy: {init_price + price} ฿ </Button>
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

    useEffect(() => {

    }, [notifyOpen])

    useEffect(() => {
        const label_price = cal_init_price(selectedLabels)
        console.log(label_price)
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
                console.log('available.data', available.data)

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
            console.log('here')
        }
    }, [id])

    if (isLoading) return <Loading />

    return (
        <Page header={'Buy data'}>
            <Stack gap={3}>
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
                        <TextField value={dataName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setDataName(e.target.value)}
                            label={"Project name"}
                            sx={{
                                mb: 1,
                            }}
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
                            <Typography>labels price:{init_price}</Typography>
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

                <Grid container spacing={2} >
                    {availableData && availableData.map((data, index) => (
                        <Grid item xs={12} sm={12} md={6} lg={4} key={index}>
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
                            />
                        </Grid>
                    ))}

                </Grid>
                <Snackbar
                    open={notifyOpen}
                    onClose={() => setNotifyOpen(false)} // Close when timeout or click happens
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
        </Page >
    )
}

export default Buy