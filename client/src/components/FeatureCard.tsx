import { BarChart } from '@mui/icons-material'
import { Box, Card, CardContent, Typography } from '@mui/material'
import React, { ReactElement } from 'react'

interface CardProps {
    icon: ReactElement,
    primary: string,
    secondary: string
}

function FeatureCard({ icon, primary, secondary }: CardProps) {
    return (
        <Card elevation={2} sx={{ height: '100%', borderRadius: 2, minWidth: 180 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingY: 3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    mb: 2
                }}>
                    {icon}
                </Box>
                <Typography variant="h5" fontWeight="bold">{primary}</Typography>
                <Typography variant="body2" color="text.secondary">{secondary}</Typography>
            </CardContent>
        </Card>
    )
}

export default FeatureCard


