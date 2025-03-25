import { Box, Typography } from '@mui/material'
import React from 'react'
import Page from './Page'

function Loading() {
    return (
        <Page header="กำลังโหลดข้อมูล...">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>กำลังโหลดข้อมูลผู้ใช้...</Typography>
            </Box>
        </Page>
    )
}

export default Loading