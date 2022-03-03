import express from 'express';
import { BootstrapNode } from './bootstrapNode';
import { configuration } from './configuration';
import { NoobCashNode } from './NoobCashNode';
import { SimpleNode } from './simpleNode';

const app = express();
const port = configuration.port;

app.listen(port, () => {
  console.log(`NoobCash backend running on port: ${port}`);
});

let node: NoobCashNode;

if (configuration.isBootstrap)
  node = new BootstrapNode();
else 
  node = new SimpleNode()

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
app.post('/register', node.register);

// Get the block chain
app.get('/ignite', () => {});

// Create a new Transaction
app.post('/transactions', () => {});

// Get list of Transactions
app.get('/transactions', () => {});

// Get balance
app.get('/balance', () => {});
