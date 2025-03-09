import { Container, Typography, Grid, Paper, Box, Card, CardContent, CardHeader, Divider, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import { AttachMoney, BarChart } from '@mui/icons-material';
// import  from '@mui/icons-material/BarChart';
import ThemeToggle from '../components/ThemeToggle';
import Page from '../components/Page';

function Index() {
  return (

    <Page header={'Dashboard'} >
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                width: 56,
                height: 56,
                borderRadius: '50%',
                mb: 2
              }}>
                <TrendingUpIcon fontSize="large" />
              </Box>
              <Typography variant="h5" fontWeight="bold">1,258</Typography>
              <Typography variant="body2" color="text.secondary">Daily Views</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'success.light',
                color: 'success.contrastText',
                width: 56,
                height: 56,
                borderRadius: '50%',
                mb: 2
              }}>
                <PeopleIcon fontSize="large" />
              </Box>
              <Typography variant="h5" fontWeight="bold">854</Typography>
              <Typography variant="body2" color="text.secondary">New Users</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
                width: 56,
                height: 56,
                borderRadius: '50%',
                mb: 2
              }}>
                <AttachMoney fontSize="large" />
              </Box>
              <Typography variant="h5" fontWeight="bold">$15,869</Typography>
              <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
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
                <BarChart fontSize="large" />
              </Box>
              <Typography variant="h5" fontWeight="bold">42%</Typography>
              <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional content section */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardHeader title="Performance Overview" />
            <CardContent>
              <Typography variant="body1" paragraph>
                Welcome to your dashboard overview. Here you'll find key metrics and insights about your business performance.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The data presented here is updated in real-time. For more detailed statistics, visit the Statistics page.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Typography variant="body2" paragraph>
                • View detailed reports
              </Typography>
              <Typography variant="body2" paragraph>
                • Update user profiles
              </Typography>
              <Typography variant="body2" paragraph>
                • Manage settings
              </Typography>
              <Typography variant="body2">
                • Export data
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
}

export default Index;