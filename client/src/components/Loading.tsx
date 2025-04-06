import { Box, Typography } from '@mui/material'
import Page from './Page'

function Loading() {
    return (
        <Page header="กำลังโหลดข้อมูล...">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>กำลังโหลดข้อมูล...</Typography>
            </Box>
        </Page>
    )
}

export default Loading