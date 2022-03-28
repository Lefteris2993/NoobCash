import logo from './logo.svg';
import './App.css';
import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ViewTransactions from './components/viewTransactions';
import Balance from './components/balance';
import NewTransaction from './components/newTransaction';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import { Typography } from '@mui/material';
import Help from './components/help';
import { HelpOutlineRounded } from '@mui/icons-material';

function App() {
  const [value, setValue] = React.useState(0);

  const pages = [
    <NewTransaction />,
    <ViewTransactions />,
    <Balance />,
    <Help />
  ]

  return (
    <Box sx={{ width: '100%'}}>
      <Box style={{ display: 'flex', justifyContent: 'center', padding: 10 }}>
        <Typography variant='h4'>
          Noob Cash
        </Typography>
      </Box>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          console.log(newValue)
        }}
      >
        <BottomNavigationAction label="New Transaction" icon={<AddCardRoundedIcon />} />
        <BottomNavigationAction label="View Last Transactions" icon={<ReceiptLongRoundedIcon />} />
        <BottomNavigationAction label="Your Balance" icon={<PaidRoundedIcon />} />
        <BottomNavigationAction label="Help" icon={<HelpOutlineRounded />} />
      </BottomNavigation>
      <Box>
        {pages[value]}
      </Box>
    </Box>
  );
}

export default App;