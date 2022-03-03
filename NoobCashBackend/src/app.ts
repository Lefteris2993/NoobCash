import express from 'express';
import { configuration } from './configuration';
import { NoobCashNode } from './node';

const app = express();
const port = configuration.port;

app.listen(port, () => {
  console.log(`NoobCash backend running on port: ${port}`);
});

const node = new NoobCashNode();

// An endpoint to see that the node is up and running
app.get('/healthcheck', (_, res) => {
  res.status(200).send('Up and running!')
});

// Initialize node, join network
app.post('/ignite', node.ignite);

// Receive new block
app.post('/block', () => {});

// Receive new Transaction
app.put('/transactions:id', () => {});

// Receive chain for initialization
app.post('/info', () => {});

// Used only on bootstrap node to register a new node
app.post('/register', () => {});

// Get the block chain
app.get('/ignite', () => {});

// Create a new Transaction
app.post('/transactions', () => {});

// Get list of Transactions
app.get('/transactions', () => {});

// Get balance
app.get('/balance', () => {});
