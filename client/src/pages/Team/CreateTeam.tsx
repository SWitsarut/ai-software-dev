import { useState, ChangeEvent } from 'react'
import Page from "../../components/Page"
import { useNavigate } from 'react-router-dom';
import axios from "../../utils/axios"
import {
    CardMedia,
    Paper,
    Stack,
    Button,
    TextField,
    Box,
    Grid,
} from '@mui/material';

function CreateTeam() {
    const [name, setName] = useState<string>("")
    const [image, setImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string>("");
    const navigate = useNavigate()

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleReset = () => {
        setName("")
        setImage(null)
        setPreviewImage(null)
        setNameError("")
    }

    const handleSave = async () => {
        // Validate team name
        if (!name.trim()) {
            setNameError("Team name cannot be empty");
            return;
        }

        const formData = new FormData()

        if (image) {
            formData.append('image', image)
        }
        formData.append('name', name);
        try {
            const response = await axios.post('/teams/create', formData)
            console.log(response)
            navigate("/teams")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Page header='Create Team'>
            <Paper sx={{ p: 4, borderRadius: 2 }} elevation={3}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            width: 340,
                            height: 'auto',
                            margin: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}>
                            <Box sx={{
                                width: 340,
                                height: 340,
                                margin: 'auto',
                                border: '2px dashed grey'
                            }}>
                                <CardMedia
                                    component="img"
                                    image={previewImage || "/api/placeholder/340/340"}
                                    alt="Team Image"
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                component="label"
                                fullWidth
                            >
                                Upload Team Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Team Name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setNameError(""); // Clear error when user starts typing
                                }}
                                error={!!nameError}
                                helperText={nameError}
                                variant="outlined"
                            />
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSave}
                                    fullWidth
                                >
                                    Save Team
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleReset}
                                    fullWidth
                                >
                                    Reset
                                </Button>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
        </Page>
    )
}

export default CreateTeam