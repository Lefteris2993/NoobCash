import { Box, Card, CardContent, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import * as React from 'react';


function Help() {
    return (
        <Box style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <Card sx={{ width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <CardContent>
                    <Typography display='block' style={{ color: grey[700], fontWeight: 500, textAlign: 'center', padding: 5 }}>
                        With NoobCashApp you can:
                    </Typography>
                    <Typography variant='body2'>
                        a. Create a new transaction to transfer money to another NoobCashNode
                        <br />
                        b. View the latest transactions of NoobCash
                        <br />
                        c. View your own balance of digital NoobCash coins
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Help;