import { Box, Button, FormControl, Input, InputAdornment, InputLabel } from '@mui/material';
import axios from 'axios';
import * as React from 'react';


function NewTransaction() {
  const [amount, setAmount] = React.useState(null);
  const [destNode, setDestNode] = React.useState(null);

  const handleSend = () => {
    const data = {
      amount: amount,
      receiverId: destNode
    }
    // axios.post(`${API}/transactions`, data)
    //   .then((res) => {

    //   }).catch((err) => {

    //   });
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
    </Box>
  );
}

export default NewTransaction;