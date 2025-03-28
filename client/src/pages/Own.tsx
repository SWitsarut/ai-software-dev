import React, { useRef, useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  Typography,
  ButtonGroup,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Divider,
  Collapse,
  IconButton
} from '@mui/material';
import DataIcon from '@mui/icons-material/Storage';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Page from '../components/Page';

// Import the labels from aviable_label.ts
import { labels } from '../utils/avaiable_label';
import { API_URL } from '../context/AuthProvider';

interface DataFormProps {
  action?: string;
  method?: string;
  target?: string;
  title?: string;
  elevation?: number;
}

const DataForm: React.FC<DataFormProps> = ({
  action = API_URL, // Directly use the API_URL from context
  method = "POST",
  target = "_blank",
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);
  const selectedLabelsRef = useRef<HTMLInputElement>(null);

  // State for selected labels
  const [selectedLabels, setSelectedLabels] = useState<number[]>([23, 24, 12, 1, 17]); // Default from server code
  const [showLabels, setShowLabels] = useState<boolean>(false);

  // Convert labels to array for easier mapping
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

  const submitForm = (dataValue: string) => {
    if (dataInputRef.current && selectedLabelsRef.current && formRef.current) {
      dataInputRef.current.value = dataValue;
      selectedLabelsRef.current.value = JSON.stringify(selectedLabels);
      formRef.current.submit();
    }
  };

  return (
    <form
      ref={formRef}
      action={action}
      method={method}
      target={target}
      id="dataForm"
    >
      <input
        type="hidden"
        name="data"
        id="dataInput"
        ref={dataInputRef}
      />
      <input
        type="hidden"
        name="selectedLabels"
        id="selectedLabelsInput"
        ref={selectedLabelsRef}
      />

      <ButtonGroup
        variant="outlined"
        aria-label="data loading button group"
        fullWidth
        size="large"
        sx={{ mt: 2, mb: 2 }}
      >
        <Box display={'flex'} flexWrap={'wrap'}>
          
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('14_spacial/0')}
        >
          Load Data 14_spacial
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('14_new')}
        >
          Load Data 14_new
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('14_single')}
        >
          Load Data 14_single
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('03/1')}
        >
          Load Data 03
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('08_pred')}
        >
          08_pred
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('08_label')}
        >
          08_label
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('08_custom_out')}
        >
          08_custom_out docker!! wrong path!!!!
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('docker_right_path')}
        >
          docker_right_path
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('change_network_and_tester')}
        >
          change_network_and_tester
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('change_network')}
        >
          change_network
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('tester_change_test')}
        >
          tester_change_test
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('tester_change_test')}
        >
          edited_main
        </Button>
        <Button
          startIcon={<DataIcon />}
          onClick={() => submitForm('out')}
        >
          old prediction
        </Button>
  
        </Box>
      </ButtonGroup>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Visible Labels ({selectedLabels.length} selected)
        </Typography>
        <IconButton
          onClick={() => setShowLabels(!showLabels)}
          aria-expanded={showLabels}
          aria-label="toggle labels"
        >
          {showLabels ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Divider />

      <Collapse in={showLabels}>
        <Grid container spacing={1} sx={{ mt: 1 }}>
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
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedLabels([])}
          >
            Clear All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedLabels(labelsArray.map(label => label.id))}
          >
            Select All
          </Button>
        </Box>
      </Collapse>
    </form>
  );
};

// Usage example
const App: React.FC = () => {
  return (
    <Page header='Data Visualization Tool'>
      <DataForm
        target="_blank"
        title="Open in New Tab"
        action={API_URL}
        elevation={1}
      />
    </Page>
  );
};

export default App;