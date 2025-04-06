import { Typography, Box, Card, CardContent, Grid, CircularProgress, Paper } from '@mui/material';
import Page from '../components/Page';
import { useEffect, useState } from 'react';
import axios from '../utils/axios';

interface Stat {
  objects: number,
  project: number,
  users: number
}

function Index() {
  const [statData, setStatData] = useState<Stat | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Stat>('/');
        console.log('res.data index', response.data);
        setStatData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const StatCard = ({ title, value, icon }: { title: string, value: number | undefined, icon: string }) => (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        borderRadius: 2,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          {icon}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'medium',
            mb: 1
          }}
        >
          {value !== undefined ? value.toLocaleString() : '-'}
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Page header={'Point Cloud Labeling Platform'}>
      <Box
        display='flex'
        flexDirection={'column'}
        position={'relative'}
        gap={3}
        sx={{
          width: '100%',
          overflow: 'hidden',
          maxWidth: '100%'
        }}
      >
        <Card
          elevation={4}
          sx={{
            height: 500,
            borderRadius: 3,
            maxWidth: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <video
            autoPlay
            muted
            loop
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="https://semantic-kitti.org/assets/hero_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Box
            sx={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 4
            }}
          >
            <Typography
              variant='h2'
              color="white"
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Point Lab
            </Typography>
            <Typography
              variant='h5'
              color="white"
              sx={{
                textAlign: 'center',
                maxWidth: '800px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              Point Cloud Labeling Platform
            </Typography>
          </Box>
        </Card>

        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant='h4' gutterBottom sx={{ fontWeight: 'medium' }}>
              Point Cloud Labeling AI
            </Typography>
            <Typography variant='body1' paragraph>
              Our platform uses state-of-the-art deep learning algorithms to automate the labeling of 3D point cloud data,
              significantly reducing annotation time while maintaining high accuracy. Built on the foundation of the
              <a href='https://semantic-kitti.org/' style={{ marginLeft: '5px', textDecoration: 'none', fontWeight: 'bold' }}>
                SemanticKITTI
              </a> dataset, our solution provides robust performance across various environments and scenarios.
            </Typography>
          </CardContent>
        </Card>

        <Typography variant='h4' sx={{ mt: 2, mb: 3, fontWeight: 'medium' }}>
          Platform Statistics
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 2 }}>
            <Typography>{error}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <StatCard title="Labeled Objects" value={statData?.objects} icon="🔷" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard title="Active Projects" value={statData?.project} icon="📊" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard title="Platform Users" value={statData?.users} icon="👥" />
            </Grid>
          </Grid>
        )}

      </Box>
    </Page>
  );
}

export default Index;