import express from 'express';
import { BootstrapNode } from './bootstrapNode';
import { configuration } from './configuration';
import { NoobCashNode } from './NoobCashNode';
import { SimpleNode } from './simpleNode';
import { Request, Response } from 'express';
import { PostInfoDTO, PostTransactionDTO } from './interfaces';
import { NoobCashError } from './utils';

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
app.post('/ignite', async (_: Request, res: Response) => {
  await node.ignite();
  res.status(200);
});

// Receive new block
app.post('/block', () => {});

// Receive new Transaction
app.put('/transactions', () => {});

// Receive chain for initialization
app.post('/info', (req: Request<any, any, PostInfoDTO>, res: Response) => {
  const nodeInfo = req.body.nodesInfo;
  const utxos = req.body.utxos;
  const chain = req.body.chain;
  try {
    node.info(nodeInfo, utxos, chain);
  } catch (err) {
    const error = err as NoobCashError;
    res.status(error.status).send(error.message);
  }
  res.status(200);
});

// Used only on bootstrap node to register a new node
app.post('/register', node.register);

// Get the block chain
app.get('/chain', () => {});

// Create a new Transaction
app.post('/transactions', (req: Request<any, any, PostTransactionDTO>, res: Response) => {
  const amount = req.body.amount;
  const receiverAddress = req.body.receiverAddress;
  try {
    node.postTransaction(amount, receiverAddress);
  } catch (err) {
    const error = err as NoobCashError;
    res.status(error.status).send(error.message);
  }
  res.status(200);
});

// Get list of Transactions
app.get('/transactions', () => {});

// Get balance
app.get('/balance', () => {});
