import { Container, Box, Typography, Divider } from "@mui/material";
import ThemeToggle from "../components/ThemeToggle";
import { ReactElement } from "react";

function Graph({ children, header }: { children: ReactElement, header: string }) {
    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="500" color="primary">
                    {header}
                </Typography>
                <ThemeToggle />
            </Box>
            <Divider sx={{ mb: 3 }} />
            {children}
        </Container>
    );
}

export default Graph