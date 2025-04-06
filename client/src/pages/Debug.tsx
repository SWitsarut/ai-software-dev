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

interface PC_PathName {
  displayName: string
  path: string
}

const DataForm: React.FC<DataFormProps> = ({
  action = API_URL, // Directly use the API_URL from context
  method = "POST",
  target = "_blank",
}) => {

  const pcs: PC_PathName[] = [
    { displayName: 'Load Data 14_spacial', path: '14_spacial/0' },
    { displayName: 'Load Data 14_new', path: '14_new' },
    { displayName: 'Load Data 14_single', path: '14_single' },
    { displayName: 'Load Data 03', path: '03/1' },
    { displayName: '08_pred', path: '08_pred' },
    { displayName: '08_label', path: '08_label' },
    { displayName: '08_custom_out', path: '08_custom_out docker!! wrong path!!!!' },
    { displayName: 'docker_right_path', path: 'docker_right_path' },
    { displayName: 'change_network_and_tester', path: 'change_network_and_tester' },
    { displayName: 'change_network', path: 'change_network' },
    { displayName: 'tester_change_test', path: 'tester_change_test' },
    { displayName: '08_testing', path: '08_testing' },
    { displayName: '08_testing_2', path: '08_testing_2' },
    { displayName: '11_testing', path: '11_testing' },
    { displayName: 'dataset_as_parameters aka 11', path: 'dataset_as_parameters' },
    { displayName: '08_dataset_as_param aka 08', path: '08_dataset_as_param' },
    { displayName: 'old prediction', path: 'out' },
    { displayName: '67ea595a307bf9fb6bf08489', path: '67ea595a307bf9fb6bf08489/potree/0' },
    { displayName: '67ea68c915848637748d79c8', path: '67ea68c915848637748d79c8/potree/0' },
    { displayName: '8_label_test', path: '67ea70a8238fce10e53072fa/potree/0' },
    { displayName: 'AJ_TEST', path: '67ea7122238fce10e5307323/potree/0' },
    { displayName: 'Toronto3D', path: 'forPotree' },
  ];

  const formRef = useRef<HTMLFormElement>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);
  const selectedLabelsRef = useRef<HTMLInputElement>(null);

  // State for selected labels
  const [selectedLabels, setSelectedLabels] = useState<number[]>([23, 24, 12, 17]); // Default from server code
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
          {pcs.map((pc, index) => (
            <Button
              key={index}
              startIcon={<DataIcon />}
              onClick={() => submitForm(pc.path)}
            >
              {pc.displayName}
            </Button>
          ))}
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
const Debug: React.FC = () => {
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

export default Debug;