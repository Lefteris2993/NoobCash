import { Box, Card, CardContent, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import * as React from 'react';
import axios from 'axios';
import { configuration } from '../../conf';


function Balance() {
  const [balance, setBalance] = React.useState(0);

  React.useEffect(() => {
    axios.get(`${configuration.API}/balance`)
      .then((res) => {
        const _amount = res.data.amount;
        setBalance(_amount);
      }).catch((err) => {

      });
  }, []);

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
      <Card sx={{ width: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
          <Typography sx={{ fontSize: 16, textAlign: 'center', fontWeight: 500, color: grey[700] }} gutterBottom>
            {'Your balance:'}
          </Typography>
          <Typography sx={{ mb: 1.5, textAlign: 'center' }} color="text.secondary">
            {balance} NBC
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Balance;