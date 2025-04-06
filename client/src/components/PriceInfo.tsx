import { Paper, Typography, Box, Accordion, AccordionSummary, AccordionDetails, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import { labels } from "../utils/avaiable_label";
import { cal_init_price, classPricing } from "../utils/cal_price";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';


interface PricingInfoProps {
    selectedLabels: number[];
    dataPrice?: number;
  }
  
  const PricingInfo: React.FC<PricingInfoProps> = ({ selectedLabels, dataPrice = 0}) => {
    const selectedLabelDetails = selectedLabels.map(id => {
      const labelInfo = labels[id];
      return {
        id,
        name: labelInfo?.name || `Label ${id}`,
        price: classPricing[id] || 0,
        color: labelInfo?.color || [0.5, 0.5, 0.5, 1]
      };
    });
  
    const totalLabelsPrice = cal_init_price(selectedLabels);
    const finalPrice = totalLabelsPrice + dataPrice;
  
    return (
      <Paper elevation={3} sx={{ p: 2, width: "100%" }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" fontSize="small" />
          Pricing Summary
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight="bold" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Price:</span>
            <span>{finalPrice} ฿</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Labels Cost:</span>
            <span>{totalLabelsPrice} ฿</span>
          </Typography>
          {dataPrice > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Data Cost:</span>
              <span>{dataPrice} ฿</span>
            </Typography>
          )}
        </Box>
  
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Selected Labels Detail ({selectedLabels.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {selectedLabels.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Label</TableCell>
                      <TableCell align="right">Price (฿)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedLabelDetails.map((label) => (
                      <TableRow key={label.id}>
                        <TableCell>
                          <Chip 
                            label={label.name} 
                            size="small"
                            sx={{ 
                              backgroundColor: `rgba(${label.color[0] * 255}, ${label.color[1] * 255}, ${label.color[2] * 255}, ${label.color[3]})`,
                              color: (label.color[0] + label.color[1] + label.color[2]) / 3 > 0.6 ? 'black' : 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{label.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">No labels selected</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>
    );
  };
  
  export default PricingInfo;