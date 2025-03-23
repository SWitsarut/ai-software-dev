import { Typography, Box, Card, CardContent } from '@mui/material';
import Page from '../components/Page';

function Index() {
  return (
    <Page header={'Point Cloud Labeling Platform'}>
      <Box
        display='flex'
        flexDirection={'column'}
        position={'relative'}
        gap={1}
        sx={{
          width: '100%',
          overflow: 'hidden', // Prevent overflow
          maxWidth: '100%'    // Constrain max width
        }}
      >
        <Card
          elevation={2}
          sx={{
            height: 500,
            borderRadius: 2,
            maxWidth: '100%', // Ensure card doesn't overflow
            overflow: 'hidden' // Contain the video
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
          <Box sx={{ backgroundColor: 'black', position: 'absolute' }}></Box>
        </Card>
        <Card>
          <CardContent>
            <Typography variant='h4'>Point cloud labeling ai</Typography>
            <Typography variant='subtitle1'>base on <a href='https://semantic-kitti.org/' >SemanticKITTI</a> dataset for</Typography>
          </CardContent>
        </Card>
      </Box>
    </Page>
  );
}

export default Index;