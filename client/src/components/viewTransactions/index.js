import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { grey } from '@mui/material/colors';
import axios from 'axios';
import * as React from 'react';
import { configuration } from '../../conf';

function ViewTransactions() {
  const [transactions, setTransactions] = React.useState([]);

  const fields = [
    {
      id: 'senderAddress',
      name: 'Sender Address'
    },
    {
      id: 'receiverAddress',
      name: 'Receiver Address'
    },
    {
      id: 'amount',
      name: 'Amount'
    },
    {
      id: 'timestamp',
      name: 'Timestamp'
    },
    {
      id: 'transactionId',
      name: 'Transaction Id'
    }
  ];

  React.useEffect(() => {
    axios.get(`${configuration.API}/transactions`)
      .then((res) => {
        const _transactions = res.data.transactions;
        setTransactions(_transactions);
      }).catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', alignContent: 'center', margin: '10%', marginTop: 5 }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {fields.map((field) => (
                <TableCell style={{ color: grey[700], fontSize: '16px', fontWeight: 700, }}>
                  {field.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.transactionId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {fields.map((field) => (
                  <TableCell sx={{ maxWidth: '160px', height: '30px', overflow: 'auto' }}>
                    {transaction[field.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ViewTransactions;