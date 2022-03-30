import { Box, Button, FormControl, Input, InputAdornment, InputLabel } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { configuration } from '../../conf';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function NewTransaction() {
  const [amount, setAmount] = React.useState(null);
  const [destNode, setDestNode] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState('success');

  const handleClose = () => {
    setOpen(false);
  };

  const handleSend = () => {
    const data = {
      amount: amount,
      receiverId: destNode
    }
    axios.post(`${configuration.API}/transactions`, data)
      .then((res) => {
        setOpen(true);
        setMessage('Transaction submitted!');
        setType('success');
      }).catch((err) => {
        setOpen(true);
        setMessage('Something went wrong');
        setType('error');
        console.error(err);
      }).finally(() => {
        setAmount(null);
        setDestNode(null);
      })
  }

  return (
    <Box style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      alignContent: 'center'
    }}>
      <FormControl variant="standard"
        style={{
          margin: 10
        }}>
        <InputLabel htmlFor="amount">
          {'Amount'}
        </InputLabel>
        <Input
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          endAdornment={
            <InputAdornment position="start">
              {'NBC'}
            </InputAdornment>
          }
        />
      </FormControl>

      <FormControl variant="standard"
        style={{
          margin: 10
        }}>
        <InputLabel htmlFor="destination">
          {'Destination Node'}
        </InputLabel>
        <Input
          id="destination"
          value={destNode}
          onChange={(e) => setDestNode(e.target.value)}
        />
      </FormControl>
      <Button
        onClick={handleSend}
        style={{
          margin: 10
        }}>
        {'Send'}
      </Button>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default NewTransaction;